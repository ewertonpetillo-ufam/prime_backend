import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BinaryCollectionsService } from './binary-collections.service';
import { BinaryCollection } from '../../entities/binary-collection.entity';
import { Patient } from '../../entities/patient.entity';
import { ActiveTaskDefinition } from '../../entities/active-task-definition.entity';
import { Questionnaire } from '../../entities/questionnaire.entity';
import { ConfigService } from '@nestjs/config';
import { CryptoUtil } from '../../utils/crypto.util';

describe('BinaryCollectionsService', () => {
  let service: BinaryCollectionsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
    manager: { transaction: jest.fn() },
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-hmac-secret'),
  };

  beforeEach(async () => {
    CryptoUtil.setConfigService(mockConfigService as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BinaryCollectionsService,
        { provide: getRepositoryToken(BinaryCollection), useValue: mockRepository },
        { provide: getRepositoryToken(Patient), useValue: mockRepository },
        { provide: getRepositoryToken(ActiveTaskDefinition), useValue: mockRepository },
        { provide: getRepositoryToken(Questionnaire), useValue: mockRepository },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<BinaryCollectionsService>(BinaryCollectionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadCsv', () => {
    const validCpf = '52998224725';
    const emptyFile = {
      buffer: Buffer.alloc(0),
      size: 0,
      originalname: 'empty.csv',
      mimetype: 'text/csv',
    } as Express.Multer.File;

    it('rejeita arquivo vazio (size 0)', async () => {
      mockRepository.findOne
        .mockResolvedValueOnce({ id: 'patient-1' })
        .mockResolvedValueOnce({ id: 1, task_code: 'TA1' });

      await expect(service.uploadCsv(validCpf, 'TA1', emptyFile)).rejects.toThrow(
        new BadRequestException('File is empty or missing'),
      );
    });
  });

  describe('downloadCsv', () => {
    it('retorna 404 quando csv_data está vazio', async () => {
      mockRepository.findOne.mockResolvedValueOnce({
        id: 'collection-1',
        csv_data: Buffer.alloc(0),
        metadata: { file_name: 'test.csv' },
        patient_cpf_hash: 'hash123',
      });

      await expect(service.downloadCsv('collection-1')).rejects.toThrow(
        new NotFoundException('Binary data not found for binary collection collection-1'),
      );
    });
  });
});
