import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PdfReportsController } from './pdf-reports.controller';
import { PdfReportsService } from './pdf-reports.service';
import { PdfReport } from '../../entities/pdf-report.entity';
import { Questionnaire } from '../../entities/questionnaire.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PdfReport, Questionnaire])],
  controllers: [PdfReportsController],
  providers: [PdfReportsService],
  exports: [PdfReportsService],
})
export class PdfReportsModule {}

