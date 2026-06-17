export interface PdfReportUploadJobData {
  tempPath: string;
  questionnaireId: string;
  reportType: 'BIOBIT' | 'DELSYS' | 'POLYSOMNOGRAPHY' | 'OTHER';
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  notes?: string | null;
  uploadedBy?: string | null;
}

export interface PdfReportUploadJobResult {
  id: string;
  fileName: string;
  fileDownloadUrl: string | null;
}
