import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { PdfReportsController } from './pdf-reports.controller';
import { PdfReportsService } from './pdf-reports.service';
import { PdfReportsUploadProcessor } from './pdf-reports-upload.processor';
import { PdfReport } from '../../entities/pdf-report.entity';
import { Questionnaire } from '../../entities/questionnaire.entity';
import { StorageModule } from '../storage/storage.module';
import { PDF_REPORT_UPLOAD_QUEUE } from '../queues/queues.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PdfReport, Questionnaire]),
    StorageModule,
    BullModule.registerQueue({ name: PDF_REPORT_UPLOAD_QUEUE }),
  ],
  controllers: [PdfReportsController],
  providers: [PdfReportsService, PdfReportsUploadProcessor],
  exports: [PdfReportsService],
})
export class PdfReportsModule {}
