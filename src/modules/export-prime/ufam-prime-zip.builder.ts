import archiver = require('archiver');
import pLimit from 'p-limit';
import { BinaryCollectionsService } from '../binary-collections/binary-collections.service';
import { MinioStorageService } from '../storage/minio-storage.service';
import {
  buildUfamPatientFolderName,
  getUniqueFilenameUfam,
  ufamPrimePdfReportZipPath,
} from './ufam-prime-dataset.utils';

/**
 * Monta no archive a pasta de um paciente no formato UFAM/PRIME (bulk),
 * espelhando handleDownloadAllColetas do frontend.
 */
export async function appendUfamBulkPatientToArchive(
  archive: archiver.Archiver,
  item: any,
  deps: {
    minioService: MinioStorageService;
    binaryCollectionsService: BinaryCollectionsService;
    pdfLimit: ReturnType<typeof pLimit>;
    onPdfError?: (reportId: string, message: string) => void;
    onBinaryError?: (collectionId: string, message: string) => void;
  },
): Promise<string> {
  const questionnaire = item?.questionnaire;
  const patient = questionnaire?.patient;
  const publicIdentifier =
    patient?.public_identifier ?? questionnaire?.public_identifier ?? 'Paciente';
  const patientCpf = patient?.cpf ?? '';
  const folderName = buildUfamPatientFolderName(publicIdentifier, patientCpf);

  const csvFiles = item?.csvFiles ?? {};
  archive.append(csvFiles.demographicAnthropometricClinical ?? '', {
    name: `${folderName}/01_Demographic_Anthropometric_Clinical_Data.csv`,
  });
  archive.append(csvFiles.neurologicalAssessment ?? '', {
    name: `${folderName}/02_Neurological_Assessment.csv`,
  });
  archive.append(csvFiles.speechTherapy ?? '', {
    name: `${folderName}/03_Speech_Therapy_Assessment.csv`,
  });
  archive.append(csvFiles.sleepAssessment ?? '', {
    name: `${folderName}/04_Sleep_Assessment.csv`,
  });
  archive.append(csvFiles.physiotherapy ?? '', {
    name: `${folderName}/05_Physiotherapy_Assessment.csv`,
  });

  const pdfReports: any[] = Array.isArray(item?.pdfReports) ? item.pdfReports : [];
  const pdfNameCounters = new Map<string, number>();

  await Promise.all(
    pdfReports
      .filter((r: any) => Boolean(r?.id) && Boolean(r?.file_path))
      .map((report: any) =>
        deps.pdfLimit(async () => {
          try {
            const relPath = ufamPrimePdfReportZipPath(report.report_type);
            const baseName = report.file_name || 'relatorio.pdf';
            const uniqueName = getUniqueFilenameUfam(baseName, pdfNameCounters, relPath);
            const pdfBuffer = await deps.minioService.getObjectBuffer(report.file_path);
            archive.append(pdfBuffer, {
              name: `${folderName}/${relPath}/${uniqueName}`,
            });
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            deps.onPdfError?.(String(report.id), message);
          }
        }),
      ),
  );

  const binaryCollections: any[] = Array.isArray(item?.binaryCollections)
    ? item.binaryCollections
    : [];

  for (let index = 0; index < binaryCollections.length; index++) {
    const collection = binaryCollections[index];
    if (!collection?.id) continue;

    try {
      const { buffer, filename } = await deps.binaryCollectionsService.downloadCsv(collection.id);
      archive.append(buffer, {
        name: `${folderName}/Active_Tasks/${filename}`,
      });
    } catch (err) {
      deps.onBinaryError?.(
        String(collection.id),
        err instanceof Error ? err.message : String(err),
      );
    }
  }

  return folderName;
}
