import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PdfReport } from '../../entities/pdf-report.entity';
import { Questionnaire } from '../../entities/questionnaire.entity';
import { UploadPdfReportDto } from './dto/upload-pdf-report.dto';

@Injectable()
export class PdfReportsService {
  constructor(
    @InjectRepository(PdfReport)
    private readonly pdfReportRepository: Repository<PdfReport>,
    @InjectRepository(Questionnaire)
    private readonly questionnaireRepository: Repository<Questionnaire>,
  ) {}

  async uploadReport(
    dto: UploadPdfReportDto,
    file: Express.Multer.File,
    uploadedBy?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo PDF é obrigatório');
    }

    const questionnaire = await this.questionnaireRepository.findOne({
      where: { id: dto.questionnaireId },
    });

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire with ID ${dto.questionnaireId} not found`);
    }

    const pdfReport = this.pdfReportRepository.create({
      questionnaire_id: dto.questionnaireId,
      report_type: dto.reportType,
      file_name: file.originalname,
      file_size_bytes: file.size,
      mime_type: file.mimetype || 'application/pdf',
      file_data: file.buffer,
      notes: dto.notes || null,
      uploaded_by: uploadedBy || null,
    });

    return this.pdfReportRepository.save(pdfReport);
  }
}

