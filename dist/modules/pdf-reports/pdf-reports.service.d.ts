import { Repository } from 'typeorm';
import { PdfReport } from '../../entities/pdf-report.entity';
import { Questionnaire } from '../../entities/questionnaire.entity';
import { UploadPdfReportDto } from './dto/upload-pdf-report.dto';
export declare class PdfReportsService {
    private readonly pdfReportRepository;
    private readonly questionnaireRepository;
    constructor(pdfReportRepository: Repository<PdfReport>, questionnaireRepository: Repository<Questionnaire>);
    uploadReport(dto: UploadPdfReportDto, file: Express.Multer.File, uploadedBy?: string): Promise<PdfReport>;
    getReportById(id: string): Promise<PdfReport>;
}
