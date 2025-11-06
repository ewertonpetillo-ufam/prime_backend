import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CryptoUtil } from '../../utils/crypto.util';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    // Validate CPF format
    if (!CryptoUtil.isValidCpfFormat(createPatientDto.cpf)) {
      throw new BadRequestException('Invalid CPF format');
    }

    // Hash CPF with HMAC
    const cpf_hash = CryptoUtil.hashCpf(createPatientDto.cpf);

    // Check if CPF hash already exists
    const existing = await this.patientsRepository.findOne({
      where: { cpf_hash },
    });

    if (existing) {
      throw new ConflictException('Patient with this CPF already registered');
    }

    // Create patient with hashed CPF
    const { cpf, ...patientData } = createPatientDto;
    const patient = this.patientsRepository.create({
      ...patientData,
      cpf_hash,
    });

    return this.patientsRepository.save(patient);
  }

  async findAll(): Promise<Patient[]> {
    return this.patientsRepository.find({
      order: { full_name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { id },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  /**
   * Find patient by CPF (will hash the CPF before searching)
   */
  async findByCpf(cpf: string): Promise<Patient> {
    if (!CryptoUtil.isValidCpfFormat(cpf)) {
      throw new BadRequestException('Invalid CPF format');
    }

    const cpf_hash = CryptoUtil.hashCpf(cpf);

    const patient = await this.patientsRepository.findOne({
      where: { cpf_hash },
    });

    if (!patient) {
      throw new NotFoundException('Patient with this CPF not found');
    }

    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
    const patient = await this.findOne(id);

    Object.assign(patient, updatePatientDto);
    return this.patientsRepository.save(patient);
  }

  async remove(id: string): Promise<void> {
    const patient = await this.findOne(id);
    await this.patientsRepository.remove(patient);
  }
}
