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

    // Create patient with hashed CPF and plain CPF
    const { cpf, ...patientData } = createPatientDto;
    const patient = this.patientsRepository.create({
      ...patientData,
      cpf_hash,
      cpf, // Store CPF in plain text for retrieval
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
      // Don't load relations eagerly to improve performance
      relations: [],
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
    // Only check CPF if it's being updated - use a lightweight query
    const updateData = { ...updatePatientDto };
    if (updateData.cpf) {
      const currentCpf = await this.patientsRepository
        .createQueryBuilder('patient')
        .select('patient.cpf', 'cpf')
        .where('patient.id = :id', { id })
        .getRawOne();
      
      // Don't update CPF if it already exists
      if (currentCpf?.cpf) {
        delete updateData.cpf;
      }
    }
    
    // Use update() for better performance - avoids loading full entity and relations
    await this.patientsRepository.update(id, updateData);
    
    // Return updated patient - use query builder to avoid eager loading
    const updatedPatient = await this.patientsRepository
      .createQueryBuilder('patient')
      .where('patient.id = :id', { id })
      .getOne();
    
    if (!updatedPatient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    
    return updatedPatient;
  }

  async remove(id: string): Promise<void> {
    const patient = await this.findOne(id);
    await this.patientsRepository.remove(patient);
  }
}
