export declare class UploadPdfReportDto {
    questionnaireId: string;
    reportType: 'BIOBIT' | 'DELSYS' | 'POLYSOMNOGRAPHY' | 'OTHER';
    notes?: string;
}
