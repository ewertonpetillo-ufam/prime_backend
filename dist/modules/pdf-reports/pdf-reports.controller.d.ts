import { PdfReportsService } from './pdf-reports.service';
import { UploadPdfReportDto } from './dto/upload-pdf-report.dto';
import { Response } from 'express';
export declare class PdfReportsController {
    private readonly pdfReportsService;
    constructor(pdfReportsService: PdfReportsService);
    uploadReport(dto: UploadPdfReportDto, file: Express.Multer.File, user: {
        userId: string;
    }): Promise<import("../../entities/pdf-report.entity").PdfReport>;
    downloadReport(id: string, res: Response): Promise<void>;
}
