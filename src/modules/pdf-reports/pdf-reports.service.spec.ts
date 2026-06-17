import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bullmq';
import { NotFoundException } from '@nestjs/common';
import { PdfReportsService } from './pdf-reports.service';
import { PdfReport } from '../../entities/pdf-report.entity';
import { Questionnaire } from '../../entities/questionnaire.entity';
import { MinioStorageService } from '../storage/minio-storage.service';
import { PDF_REPORT_UPLOAD_QUEUE } from '../queues/queues.module';

describe('PdfReportsService', () => {
  let service: PdfReportsService;

  const mockPdfReportRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockQuestionnaireRepository = {
    findOne: jest.fn(),
  };

  const mockMinioStorage = {
    isEnabled: jest.fn().mockReturnValue(true),
    putObjectStream: jest.fn(),
    getPresignedGetUrl: jest.fn(),
  };

  const mockUploadQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PdfReportsService,
        { provide: getRepositoryToken(PdfReport), useValue: mockPdfReportRepository },
        { provide: getRepositoryToken(Questionnaire), useValue: mockQuestionnaireRepository },
        { provide: MinioStorageService, useValue: mockMinioStorage },
        { provide: getQueueToken(PDF_REPORT_UPLOAD_QUEUE), useValue: mockUploadQueue },
      ],
    }).compile();

    service = module.get(PdfReportsService);
    jest.clearAllMocks();
    mockMinioStorage.isEnabled.mockReturnValue(true);
  });

  describe('preflightUpload', () => {
    const questionnaireId = 'q-uuid';
    const dto = {
      questionnaireId,
      reportType: 'DELSYS' as const,
      files: [
        { fileName: 'emg1.pdf', fileSizeBytes: 100 },
        { fileName: 'emg2.pdf', fileSizeBytes: 200 },
      ],
    };

    it('retorna skip para duplicata e upload para arquivo novo', async () => {
      mockQuestionnaireRepository.findOne.mockResolvedValue({ id: questionnaireId });
      mockPdfReportRepository.find.mockResolvedValue([
        {
          id: 'existing-id',
          file_name: 'emg1.pdf',
          file_size_bytes: 100,
        },
      ]);

      const result = await service.preflightUpload(dto);

      expect(result.items).toEqual([
        {
          fileName: 'emg1.pdf',
          fileSizeBytes: 100,
          action: 'skip',
          existingReportId: 'existing-id',
        },
        {
          fileName: 'emg2.pdf',
          fileSizeBytes: 200,
          action: 'upload',
        },
      ]);
    });

    it('lança NotFoundException se questionário não existir', async () => {
      mockQuestionnaireRepository.findOne.mockResolvedValue(null);

      await expect(service.preflightUpload(dto)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('enqueueUploadReport', () => {
    const dto = {
      questionnaireId: 'q-uuid',
      reportType: 'DELSYS' as const,
    };

    const file = {
      path: '/tmp/pdf-uploads/test.pdf',
      originalname: 'emg.pdf',
      size: 128,
      mimetype: 'application/pdf',
    } as Express.Multer.File;

    it('retorna skipped quando duplicata existe', async () => {
      mockQuestionnaireRepository.findOne.mockResolvedValue({ id: dto.questionnaireId });
      mockPdfReportRepository.findOne.mockResolvedValue({ id: 'dup-id' });

      const result = await service.enqueueUploadReport(dto, file, 'user-id');

      expect(result).toEqual({
        skipped: true,
        existingReportId: 'dup-id',
        id: 'dup-id',
      });
      expect(mockUploadQueue.add).not.toHaveBeenCalled();
    });

    it('enfileira job para arquivo novo', async () => {
      mockQuestionnaireRepository.findOne.mockResolvedValue({ id: dto.questionnaireId });
      mockPdfReportRepository.findOne.mockResolvedValue(null);
      mockUploadQueue.add.mockResolvedValue({ id: 'job-123' });

      const result = await service.enqueueUploadReport(dto, file, 'user-id');

      expect(mockUploadQueue.add).toHaveBeenCalledWith(
        'process-upload',
        expect.objectContaining({
          tempPath: file.path,
          questionnaireId: dto.questionnaireId,
          fileName: file.originalname,
        }),
        expect.any(Object),
      );
      expect(result).toEqual({
        jobId: 'job-123',
        statusUrl: '/pdf-reports/upload/status/job-123',
      });
    });
  });
});
