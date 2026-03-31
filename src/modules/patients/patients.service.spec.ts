import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { Patient } from '../../entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CryptoUtil } from '../../utils/crypto.util';
import { ConfigService } from '@nestjs/config';

describe('PatientsService', () => {
  let service: PatientsService;
  let repository: Repository<Patient>;
  let configService: ConfigService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
    query: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-hmac-secret'),
  };

  beforeEach(async () => {
    // Inicializar CryptoUtil antes dos testes
    CryptoUtil.setConfigService(mockConfigService as any);

    const repositoryToken = getRepositoryToken(Patient);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        {
          provide: repositoryToken,
          useValue: mockRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
    repository = module.get<Repository<Patient>>(repositoryToken);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createPatientDto: CreatePatientDto = {
      cpf: '12345678900',
      full_name: 'João Silva',
      date_of_birth: '1990-01-01',
      email: 'joao@example.com',
      phone_primary: '11999999999',
    };

    it('deve criar paciente com sucesso', async () => {
      const hashedCpf = CryptoUtil.hashCpf(createPatientDto.cpf);
      const savedPatient = {
        id: 'patient-id',
        ...createPatientDto,
        cpf_hash: hashedCpf,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(savedPatient);
      mockRepository.save.mockResolvedValue(savedPatient);

      const result = await service.create(createPatientDto);

      expect(result).toEqual(savedPatient);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { cpf_hash: hashedCpf },
      });
      expect(mockRepository.query).not.toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('deve lançar BadRequestException para CPF inválido', async () => {
      const invalidDto = { ...createPatientDto, cpf: '123' };

      await expect(service.create(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(invalidDto)).rejects.toThrow(
        'Invalid CPF format',
      );
    });

    it('deve lançar ConflictException para CPF duplicado', async () => {
      const hashedCpf = CryptoUtil.hashCpf(createPatientDto.cpf);
      const existingPatient = {
        id: 'existing-id',
        cpf_hash: hashedCpf,
      };

      mockRepository.findOne.mockResolvedValue(existingPatient);

      await expect(service.create(createPatientDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createPatientDto)).rejects.toThrow(
        'Patient with this CPF already registered',
      );
    });

    it('deve aceitar CPF com formatação', async () => {
      const dtoWithFormattedCpf = {
        ...createPatientDto,
        cpf: '123.456.789-00',
      };
      const hashedCpf = CryptoUtil.hashCpf(dtoWithFormattedCpf.cpf);
      const savedPatient = {
        id: 'patient-id',
        ...dtoWithFormattedCpf,
        cpf_hash: hashedCpf,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(savedPatient);
      mockRepository.save.mockResolvedValue(savedPatient);

      const result = await service.create(dtoWithFormattedCpf);

      expect(result).toBeDefined();
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { cpf_hash: hashedCpf },
      });
      expect(mockRepository.query).not.toHaveBeenCalled();
    });
  });

  describe('createWithPublicIdentifier', () => {
    const createPatientDto: CreatePatientDto = {
      cpf: '12345678900',
      full_name: 'João Silva',
      date_of_birth: '1990-01-01',
      email: 'joao@example.com',
      phone_primary: '11999999999',
    };

    it('deve criar paciente com public_identifier gerado no banco', async () => {
      const hashedCpf = CryptoUtil.hashCpf(createPatientDto.cpf);
      const savedPatient = {
        id: 'patient-id',
        ...createPatientDto,
        cpf_hash: hashedCpf,
        public_identifier: 'P0001',
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.query.mockResolvedValue([{ identifier: 'P0001' }]);
      mockRepository.create.mockReturnValue(savedPatient);
      mockRepository.save.mockResolvedValue(savedPatient);

      const result = await service.createWithPublicIdentifier(createPatientDto);

      expect(result.public_identifier).toBe('P0001');
      expect(mockRepository.query).toHaveBeenCalledWith(
        'SELECT generate_patient_identifier() AS identifier',
      );
    });

    it('deve lançar ConflictException para CPF duplicado', async () => {
      const hashedCpf = CryptoUtil.hashCpf(createPatientDto.cpf);
      mockRepository.findOne.mockResolvedValue({
        id: 'existing',
        cpf_hash: hashedCpf,
      });

      await expect(
        service.createWithPublicIdentifier(createPatientDto),
      ).rejects.toThrow(ConflictException);
      expect(mockRepository.query).not.toHaveBeenCalled();
    });
  });

  describe('ensurePublicIdentifier', () => {
    it('deve atribuir identificador quando ainda é nulo', async () => {
      const patientId = '550e8400-e29b-41d4-a716-446655440000';
      const afterAssign = {
        id: patientId,
        full_name: 'João',
        public_identifier: 'P0002',
      };

      mockRepository.findOne
        .mockResolvedValueOnce({ id: patientId, public_identifier: null })
        .mockResolvedValueOnce(afterAssign);
      mockRepository.query.mockResolvedValue([
        { public_identifier: 'P0002' },
      ]);

      const result = await service.ensurePublicIdentifier(patientId);

      expect(result).toEqual(afterAssign);
      expect(mockRepository.query).toHaveBeenCalled();
    });

    it('deve retornar paciente sem query quando já há identificador', async () => {
      const patientId = '550e8400-e29b-41d4-a716-446655440000';
      const patient = { id: patientId, public_identifier: 'P0001' };

      mockRepository.findOne.mockResolvedValueOnce(patient);

      const result = await service.ensurePublicIdentifier(patientId);

      expect(result.public_identifier).toBe('P0001');
      expect(mockRepository.query).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de pacientes ordenada por nome', async () => {
      const patients = [
        { id: '1', full_name: 'Ana Silva' },
        { id: '2', full_name: 'João Santos' },
      ];

      mockRepository.find.mockResolvedValue(patients);

      const result = await service.findAll();

      expect(result).toEqual(patients);
      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { full_name: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('deve retornar paciente por ID', async () => {
      const patient = {
        id: 'patient-id',
        full_name: 'João Silva',
      };

      mockRepository.findOne.mockResolvedValue(patient);

      const result = await service.findOne('patient-id');

      expect(result).toEqual(patient);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'patient-id' },
        relations: [],
      });
    });

    it('deve lançar NotFoundException para paciente não encontrado', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        'Patient with ID invalid-id not found',
      );
    });
  });

  describe('findByCpf', () => {
    it('deve retornar paciente por CPF', async () => {
      const cpf = '12345678900';
      const hashedCpf = CryptoUtil.hashCpf(cpf);
      const patient = {
        id: 'patient-id',
        cpf_hash: hashedCpf,
        full_name: 'João Silva',
      };

      mockRepository.findOne.mockResolvedValue(patient);

      const result = await service.findByCpf(cpf);

      expect(result).toEqual(patient);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { cpf_hash: hashedCpf },
      });
    });

    it('deve lançar BadRequestException para CPF inválido', async () => {
      await expect(service.findByCpf('123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar NotFoundException para CPF não encontrado', async () => {
      const cpf = '12345678900';
      const hashedCpf = CryptoUtil.hashCpf(cpf);

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findByCpf(cpf)).rejects.toThrow(NotFoundException);
      await expect(service.findByCpf(cpf)).rejects.toThrow(
        'Patient with this CPF not found',
      );
    });
  });

  describe('update', () => {
    const updatePatientDto: UpdatePatientDto = {
      full_name: 'João Silva Santos',
    };

    it('deve atualizar paciente com sucesso', async () => {
      const existingPatient = {
        id: 'patient-id',
        full_name: 'João Silva',
      };
      const updatedPatient = {
        ...existingPatient,
        ...updatePatientDto,
      };

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
        getOne: jest.fn().mockResolvedValue(updatedPatient),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update('patient-id', updatePatientDto);

      expect(result).toEqual(updatedPatient);
      expect(mockRepository.update).toHaveBeenCalledWith(
        'patient-id',
        updatePatientDto,
      );
    });

    it('deve lançar NotFoundException para paciente não encontrado', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockRepository.update.mockResolvedValue({ affected: 0 });

      await expect(
        service.update('invalid-id', updatePatientDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('não deve atualizar CPF se já existir', async () => {
      const updateDto: UpdatePatientDto = {
        cpf: '98765432100',
        full_name: 'João Silva',
      };

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ cpf: '12345678900' }),
        getOne: jest.fn().mockResolvedValue({
          id: 'patient-id',
          full_name: 'João Silva',
        }),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update('patient-id', updateDto);

      expect(result).toBeDefined();
      // Verifica que o CPF foi removido do updateData
      expect(mockRepository.update).toHaveBeenCalledWith(
        'patient-id',
        expect.not.objectContaining({ cpf: '98765432100' }),
      );
    });
  });

  describe('remove', () => {
    it('deve remover paciente com sucesso', async () => {
      const patient = {
        id: 'patient-id',
        full_name: 'João Silva',
      };

      mockRepository.findOne.mockResolvedValue(patient);
      mockRepository.remove.mockResolvedValue(patient);

      await service.remove('patient-id');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'patient-id' },
        relations: [],
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(patient);
    });

    it('deve lançar NotFoundException se paciente não existir', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

