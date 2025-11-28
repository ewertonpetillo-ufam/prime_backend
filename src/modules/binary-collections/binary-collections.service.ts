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
import { CryptoUtil } from '../../utils/crypto.util';

@Injectable()
export class BinaryCollectionsService {
  constructor(
    @InjectRepository(BinaryCollection)
    private binaryCollectionsRepository: Repository<BinaryCollection>,
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    @InjectRepository(ActiveTaskDefinition)
    private activeTaskRepository: Repository<ActiveTaskDefinition>,
  ) {}

  /**
   * Upload CSV file from mobile collection app
   * @param patient_cpf - Plain text CPF
   * @param task_code - Task code (e.g., TA1, TA2, TA3)
   * @param file - Multer file object
   */
  async uploadCsv(
    patient_cpf: string,
    task_code: string,
    file: Express.Multer.File,
  ): Promise<Omit<BinaryCollection, 'csv_data'>> {
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

    // Create binary collection record
    const binaryCollection = this.binaryCollectionsRepository.create({
      patient_cpf_hash: cpf_hash,
      task_id: activeTask.id,
      csv_data: file.buffer,
      file_size_bytes: file.size,
      repetitions_count: 1, // Default, can be updated later
      collection_type: activeTask.task_category ? (activeTask.task_category as any) : null,
      collected_at: new Date(),
      uploaded_at: new Date(),
      processing_status: ProcessingStatus.PENDING,
      metadata: {
        uploaded_at: new Date().toISOString(),
        patient_id: patient.id,
        task_code: task_code,
        file_name: file.originalname,
        file_format: file.mimetype,
      },
    });

    const saved = await this.binaryCollectionsRepository.save(binaryCollection);

    // Remove csv_data from response to reduce payload size
    const { csv_data, ...response } = saved;

    return response as Omit<BinaryCollection, 'csv_data'>;
  }

  async findAll(): Promise<BinaryCollection[]> {
    return this.binaryCollectionsRepository.find({
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
      where: { id },
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
      where: { patient_cpf_hash: cpf_hash },
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
   * Get binary collection CSV data for download
   * @param id - Binary collection UUID
   * @returns Buffer containing the CSV file data
   */
  async downloadCsv(id: string): Promise<{ buffer: Buffer; filename: string }> {
    const collection = await this.binaryCollectionsRepository.findOne({
      where: { id },
      select: ['id', 'csv_data', 'metadata'],
    });

    if (!collection) {
      throw new NotFoundException(`Binary collection with ID ${id} not found`);
    }

    if (!collection.csv_data) {
      throw new NotFoundException(`CSV data not found for binary collection ${id}`);
    }

    // Get filename from metadata or generate a default one
    const filename =
      collection.metadata?.file_name ||
      `binary-collection-${id}.csv`;

    return {
      buffer: collection.csv_data,
      filename,
    };
  }

  /**
   * Count binary collections by questionnaire ID
   * @param questionnaireId - Questionnaire UUID
   * @returns Count of binary collections
   */
  async countByQuestionnaireId(questionnaireId: string): Promise<number> {
    const count = await this.binaryCollectionsRepository.count({
      where: { questionnaire_id: questionnaireId },
    });

    return count;
  }
}
