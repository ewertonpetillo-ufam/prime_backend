import archiver = require('archiver');
import { finished } from 'stream/promises';
import { BinaryCollectionsService } from '../binary-collections/binary-collections.service';
import { MinioStorageService } from '../storage/minio-storage.service';
import {
  ExportPrimePdfType,
  ExportPrimeSelectiveFilters,
  isSelectivePrimeExport,
  buildUfamPatientFolderName,
  getUniqueFilenameUfam,
  ufamPrimePdfReportZipPath,
} from './ufam-prime-dataset.utils';

/** Acima disso, MinIO → ZIP via stream (evita buffer de centenas de MiB na RAM). */
const STREAM_PDF_THRESHOLD_BYTES = 10 * 1024 * 1024;

export type UfamBulkSelectiveOptions = ExportPrimeSelectiveFilters;

async function appendMinioObjectToArchive(
  archive: archiver.Archiver,
  minioService: MinioStorageService,
  filePath: string,
  zipEntryName: string,
  fileSizeBytes?: number | null,
): Promise<void> {
  const useStream = (fileSizeBytes ?? 0) > STREAM_PDF_THRESHOLD_BYTES;

  if (useStream) {
    const stream = await minioService.getObjectStream(filePath);
    archive.append(stream, { name: zipEntryName });
    await finished(stream);
    return;
  }

  const buffer = await minioService.getObjectBuffer(filePath);
  archive.append(buffer, { name: zipEntryName });
}

function normalizeTaskCode(code: string | undefined | null): string {
  return (code || '').trim().toUpperCase();
}

/**
 * Monta no archive a pasta de um paciente no formato UFAM/PRIME (bulk),
 * espelhando handleDownloadAllColetas do frontend.
 * Com `selective` em modo seletivo, filtra CSVs / PDFs / binários.
 */
export async function appendUfamBulkPatientToArchive(
  archive: archiver.Archiver,
  item: any,
  deps: {
    minioService: MinioStorageService;
    binaryCollectionsService: BinaryCollectionsService;
    onPdfError?: (reportId: string, message: string) => void;
    onBinaryError?: (collectionId: string, message: string) => void;
    selective?: UfamBulkSelectiveOptions;
  },
): Promise<string> {
  const questionnaire = item?.questionnaire;
  const patient = questionnaire?.patient;
  const publicIdentifier =
    patient?.public_identifier ?? questionnaire?.public_identifier ?? 'Paciente';
  const patientCpf = patient?.cpf ?? '';
  const folderName = buildUfamPatientFolderName(publicIdentifier, patientCpf);

  const selective = deps.selective ?? {};
  const selectiveMode = isSelectivePrimeExport(selective);

  const includeClinicalCsv = selectiveMode
    ? selective.includeClinicalQuestionnaires === true
    : true;
  const includeSleepCsv = selectiveMode
    ? selective.includeSleepQuestionnaires === true
    : true;

  const csvFiles = item?.csvFiles ?? {};
  if (includeClinicalCsv) {
    archive.append(csvFiles.demographicAnthropometricClinical ?? '', {
      name: `${folderName}/01_Demographic_Anthropometric_Clinical_Data.csv`,
    });
    archive.append(csvFiles.neurologicalAssessment ?? '', {
      name: `${folderName}/02_Neurological_Assessment.csv`,
    });
    archive.append(csvFiles.speechTherapy ?? '', {
      name: `${folderName}/03_Speech_Therapy_Assessment.csv`,
    });
    archive.append(csvFiles.physiotherapy ?? '', {
      name: `${folderName}/05_Physiotherapy_Assessment.csv`,
    });
  }
  if (includeSleepCsv) {
    archive.append(csvFiles.sleepAssessment ?? '', {
      name: `${folderName}/04_Sleep_Assessment.csv`,
    });
  }

  // Modo seletivo: pdfTypes ausente ou [] = nenhum PDF; legado = todos.
  const allowedPdfTypes: Set<string> | null = selectiveMode
    ? new Set((selective.pdfTypes ?? []).map((t) => String(t).toUpperCase()))
    : null;

  const pdfReports: any[] = Array.isArray(item?.pdfReports) ? item.pdfReports : [];
  const pdfNameCounters = new Map<string, number>();

  // Um PDF por vez — EDF de polissonografia pode ter 400–600 MiB
  for (const report of pdfReports) {
    if (!report?.id || !report?.file_path) continue;

    const reportType = String(report.report_type || '').toUpperCase() as
      | ExportPrimePdfType
      | string;
    if (allowedPdfTypes && !allowedPdfTypes.has(reportType)) {
      continue;
    }

    try {
      const relPath = ufamPrimePdfReportZipPath(report.report_type);
      const baseName = report.file_name || 'relatorio.pdf';
      const uniqueName = getUniqueFilenameUfam(baseName, pdfNameCounters, relPath);
      const entryName = `${folderName}/${relPath}/${uniqueName}`;

      await appendMinioObjectToArchive(
        archive,
        deps.minioService,
        report.file_path,
        entryName,
        report.file_size_bytes,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      deps.onPdfError?.(String(report.id), message);
    }
  }

  // Modo seletivo: taskCodes ausente ou [] = nenhum binário; legado = todos.
  const allowedTaskCodes: Set<string> | null = selectiveMode
    ? new Set((selective.taskCodes ?? []).map((c) => normalizeTaskCode(c)))
    : null;

  const binaryCollections: any[] = Array.isArray(item?.binaryCollections)
    ? item.binaryCollections
    : [];

  for (let index = 0; index < binaryCollections.length; index++) {
    const collection = binaryCollections[index];
    if (!collection?.id) continue;

    const taskCode = normalizeTaskCode(collection.active_task?.task_code);
    if (allowedTaskCodes) {
      if (!taskCode || !allowedTaskCodes.has(taskCode)) {
        continue;
      }
    }

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
