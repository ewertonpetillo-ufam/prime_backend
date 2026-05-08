import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BinaryCollection, ProcessingStatus } from '../../entities/binary-collection.entity';
import { Patient } from '../../entities/patient.entity';
import { ActiveTaskDefinition } from '../../entities/active-task-definition.entity';
import { Questionnaire } from '../../entities/questionnaire.entity';
import { CryptoUtil } from '../../utils/crypto.util';

type UploadCsvResponse = Omit<BinaryCollection, 'csv_data' | 'task_id'> & {
  task_code: string;
};

const EXCLUDED_COLLECTION_PUBLIC_IDS = ['P000', 'P00'] as const;

function anonymizeCpfPrefixInFilename(fileName: string, cpfHash?: string | null): string {
  const shortHash = (cpfHash || '').substring(0, 8);
  if (!fileName) return shortHash || 'arquivo';
  if (!shortHash) return fileName;
  const idx = fileName.indexOf('_');
  if (idx === -1) return `${shortHash}_${fileName}`;
  const rest = fileName.substring(idx + 1);
  return `${shortHash}_${rest}`;
}

@Injectable()
export class BinaryCollectionsService {
  constructor(
    @InjectRepository(BinaryCollection)
    private binaryCollectionsRepository: Repository<BinaryCollection>,
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    @InjectRepository(ActiveTaskDefinition)
    private activeTaskRepository: Repository<ActiveTaskDefinition>,
    @InjectRepository(Questionnaire)
    private questionnairesRepository: Repository<Questionnaire>,
  ) {}

  /**
   * Upload de arquivo binário (CSV, áudio, etc.) enviado pelo app de coleta
   * @param patient_cpf - Plain text CPF
   * @param task_code - Task code (e.g., TA1, TA2, TA3)
   * @param file - Multer file object
   */
  async uploadCsv(
    patient_cpf: string,
    task_code: string,
    file: Express.Multer.File,
  ): Promise<UploadCsvResponse> {
    // Validate CPF format
    if (!CryptoUtil.isValidCpfFormat(patient_cpf)) {
      throw new BadRequestException('Invalid CPF format');
    }

    // Hash CPF with HMAC
    const cpf_hash = CryptoUtil.hashCpf(patient_cpf);

    // Find patient by hashed CPF
    const patient = await this.patientsRepository.findOne({
      where: { cpf_hash },
    });

    if (!patient) {
      throw new NotFoundException('Patient with this CPF not found');
    }

    // Find active task by task_code
    const activeTask = await this.activeTaskRepository.findOne({
      where: { task_code },
    });

    if (!activeTask) {
      throw new NotFoundException(`Task with code ${task_code} not found`);
    }

    // Validate file
    if (!file || !file.buffer) {
      throw new BadRequestException('File is required');
    }

    // Find the most recent questionnaire for this patient
    // Prefer questionnaires with status 'in_progress' or 'completed'
    let questionnaire = await this.questionnairesRepository
      .createQueryBuilder('q')
      .where('q.patient_id = :patientId', { patientId: patient.id })
      .andWhere('q.status IN (:...statuses)', { statuses: ['in_progress', 'completed'] })
      .orderBy('q.created_at', 'DESC')
      .getOne();

    // If no in_progress or completed questionnaire, get the most recent one
    if (!questionnaire) {
      questionnaire = await this.questionnairesRepository
        .createQueryBuilder('q')
        .where('q.patient_id = :patientId', { patientId: patient.id })
        .orderBy('q.created_at', 'DESC')
        .getOne();
    }

    // Create binary collection record
    const binaryCollection = this.binaryCollectionsRepository.create({
      patient_cpf_hash: cpf_hash,
      task_id: activeTask.id,
      questionnaire_id: questionnaire?.id || null,
      csv_data: file.buffer,
      file_size_bytes: file.size,
      repetitions_count: 1, // Default, can be updated later
      collection_type: activeTask.task_category ? (activeTask.task_category as any) : null,
      collected_at: new Date(),
      uploaded_at: new Date(),
      processing_status: ProcessingStatus.COMPLETED, // Set as completed after upload
      metadata: {
        uploaded_at: new Date().toISOString(),
        patient_id: patient.id,
        task_code: task_code,
        file_name: file.originalname,
        file_format: file.mimetype,
        questionnaire_id: questionnaire?.id || null,
      },
    });

    const saved = await this.binaryCollectionsRepository.save(binaryCollection);

    // Remove csv_data and task_id from response and include task_code instead
    const { csv_data, task_id, ...response } = saved;

    return {
      ...response,
      task_code: activeTask.task_code,
    } as UploadCsvResponse;
  }

  async findAll(): Promise<BinaryCollection[]> {
    return this.binaryCollectionsRepository.find({
      where: { deleted_pending: false },
      select: [
        'id',
        'questionnaire_id',
        'patient_cpf_hash',
        'task_id',
        'repetitions_count',
        'file_size_bytes',
        'file_checksum',
        'collection_type',
        'device_type',
        'device_serial',
        'sampling_rate_hz',
        'processing_status',
        'collected_at',
        'uploaded_at',
      ],
      order: { collected_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<BinaryCollection> {
    const collection = await this.binaryCollectionsRepository.findOne({
      where: { id, deleted_pending: false },
    });

    if (!collection) {
      throw new NotFoundException(`Binary collection with ID ${id} not found`);
    }

    return collection;
  }

  /**
   * Find all binary collections by patient CPF
   * @param patient_cpf - Plain text CPF
   * @returns List of binary collections (without csv_data)
   */
  async findByCpf(patient_cpf: string): Promise<Omit<BinaryCollection, 'csv_data'>[]> {
    // Validate CPF format
    if (!CryptoUtil.isValidCpfFormat(patient_cpf)) {
      throw new BadRequestException('Invalid CPF format');
    }

    // Hash CPF with HMAC
    const cpf_hash = CryptoUtil.hashCpf(patient_cpf);

    // Find all binary collections for this patient
    const collections = await this.binaryCollectionsRepository.find({
      where: { patient_cpf_hash: cpf_hash, deleted_pending: false },
      select: [
        'id',
        'questionnaire_id',
        'patient_cpf_hash',
        'task_id',
        'repetitions_count',
        'file_size_bytes',
        'file_checksum',
        'collection_type',
        'device_type',
        'device_serial',
        'sampling_rate_hz',
        'processing_status',
        'collected_at',
        'uploaded_at',
        'metadata',
        'processing_error',
      ],
      order: { collected_at: 'DESC' },
    });

    return collections;
  }

  async remove(id: string): Promise<void> {
    const collection = await this.findOne(id);
    await this.binaryCollectionsRepository.remove(collection);
  }

  /**
   * Obtém o binário da coleção (CSV, áudio, etc.) para download
   * @param id - Binary collection UUID
   * @returns Buffer contendo o arquivo binário, nome do arquivo e content-type
   */
  async downloadCsv(
    id: string,
  ): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
    const collection = await this.binaryCollectionsRepository.findOne({
      where: { id, deleted_pending: false },
      select: ['id', 'csv_data', 'metadata', 'patient_cpf_hash'],
    });

    if (!collection) {
      throw new NotFoundException(`Binary collection with ID ${id} not found`);
    }

    if (!collection.csv_data) {
      throw new NotFoundException(
        `Binary data not found for binary collection ${id}`,
      );
    }

    const originalFilename =
      (collection.metadata?.file_name as string) || `binary-collection-${id}.bin`;

    const cpfHash = collection.patient_cpf_hash;
    const filename = anonymizeCpfPrefixInFilename(originalFilename, cpfHash);

    const contentType =
      (collection.metadata?.file_format as string) || 'application/octet-stream';

    return {
      buffer: collection.csv_data,
      filename,
      contentType,
    };
  }

  /**
   * Count binary collections by questionnaire ID
   * This counts collections that are either:
   * - Directly linked to the questionnaire (questionnaire_id)
   * - Linked to the patient via CPF hash (patient_cpf_hash)
   * This matches the logic used in getQuestionnaireById
   * @param questionnaireId - Questionnaire UUID
   * @returns Count of binary collections
   */
  async countByQuestionnaireId(questionnaireId: string): Promise<number> {
    // First, get the questionnaire to find the patient's CPF hash
    const questionnaire = await this.questionnairesRepository
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.patient', 'patient')
      .where('q.id = :id', { id: questionnaireId })
      .getOne();

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire with ID ${questionnaireId} not found`);
    }

    const patientCpfHash = questionnaire.patient?.cpf_hash;

    // Count binary collections by questionnaire_id OR patient_cpf_hash
    // This matches the query logic in questionnaires.service.ts getQuestionnaireById
    if (patientCpfHash) {
      const count = await this.binaryCollectionsRepository
        .createQueryBuilder('bc')
        .where(
          '(bc.questionnaire_id = :questionnaireId OR bc.patient_cpf_hash = :patientCpfHash) AND bc.deleted_pending = FALSE',
          {
          questionnaireId,
          patientCpfHash,
          },
        )
        .getCount();

      return count;
    } else {
      // If no patient CPF hash, only count by questionnaire_id
      const count = await this.binaryCollectionsRepository.count({
        where: { questionnaire_id: questionnaireId, deleted_pending: false },
      });

      return count;
    }
  }

  /**
   * Get binary collections statistics for all time
   * Returns count of binary collections grouped by collection date (day)
   */
  async getBinaryCollectionsStatisticsLast30Days() {
    const excludedPids = [...EXCLUDED_COLLECTION_PUBLIC_IDS].map((id) =>
      id.toUpperCase(),
    );
    const collections = await this.binaryCollectionsRepository
      .createQueryBuilder('bc')
      .innerJoin('patients', 'p', 'p.cpf_hash = bc.patient_cpf_hash')
      .select([
        "TO_CHAR(DATE_TRUNC('day', bc.uploaded_at AT TIME ZONE 'America/Sao_Paulo'), 'YYYY-MM-DD') as date",
        'COUNT(*)::int as count',
      ])
      .where('bc.deleted_pending = FALSE')
      .andWhere(
        '(p.public_identifier IS NULL OR UPPER(TRIM(p.public_identifier)) NOT IN (:...excludedPids))',
        { excludedPids },
      )
      .groupBy("DATE_TRUNC('day', bc.uploaded_at AT TIME ZONE 'America/Sao_Paulo')")
      .orderBy("DATE_TRUNC('day', bc.uploaded_at AT TIME ZONE 'America/Sao_Paulo')", 'ASC')
      .getRawMany();

    return collections.map((c: any) => ({
      date: String(c.date || '').trim(),
      count: parseInt(c.count) || 0,
    }));
  }

  /**
   * Get binary collections statistics grouped by active task
   * Returns count of binary collections for each task
   */
  async getBinaryCollectionsByTask() {
    const excludedPids = [...EXCLUDED_COLLECTION_PUBLIC_IDS].map((id) =>
      id.toUpperCase(),
    );
    const collections = await this.binaryCollectionsRepository
      .createQueryBuilder('bc')
      .leftJoinAndSelect('bc.active_task', 'active_task')
      .innerJoin('patients', 'p', 'p.cpf_hash = bc.patient_cpf_hash')
      .select([
        'active_task.id as task_id',
        'active_task.task_code as task_code',
        'active_task.task_name as task_name',
        'COUNT(*)::int as count',
      ])
      .where('bc.task_id IS NOT NULL')
      .andWhere('bc.deleted_pending = FALSE')
      .andWhere(
        '(p.public_identifier IS NULL OR UPPER(TRIM(p.public_identifier)) NOT IN (:...excludedPids))',
        { excludedPids },
      )
      .groupBy('active_task.id, active_task.task_code, active_task.task_name')
      .orderBy('COUNT(*)', 'DESC')
      .getRawMany();

    return collections.map((c: any) => ({
      task_id: c.task_id,
      task_code: c.task_code || 'N/A',
      task_name: c.task_name || 'Tarefa Desconhecida',
      count: parseInt(c.count) || 0,
    }));
  }

  async getBinaryCollectionsDataSizeStats() {
    const excludedPids = [...EXCLUDED_COLLECTION_PUBLIC_IDS].map((id) =>
      id.toUpperCase(),
    );
    const row = await this.binaryCollectionsRepository
      .createQueryBuilder('bc')
      .innerJoin('patients', 'p', 'p.cpf_hash = bc.patient_cpf_hash')
      .select('COALESCE(SUM(bc.file_size_bytes), 0)', 'total_bytes')
      .addSelect('COALESCE(AVG(bc.file_size_bytes), 0)', 'average_bytes')
      .addSelect('COUNT(*)::int', 'total_records')
      .where('bc.deleted_pending = FALSE')
      .andWhere(
        '(p.public_identifier IS NULL OR UPPER(TRIM(p.public_identifier)) NOT IN (:...excludedPids))',
        { excludedPids },
      )
      .getRawOne<{
        total_bytes: string | number | null;
        average_bytes: string | number | null;
        total_records: string | number | null;
      }>();

    return {
      totalBytes: Number(row?.total_bytes ?? 0),
      averageBytes: Number(row?.average_bytes ?? 0),
      totalRecords: Number(row?.total_records ?? 0),
    };
  }
}
