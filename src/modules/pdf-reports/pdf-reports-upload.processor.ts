import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PDF_REPORT_UPLOAD_QUEUE } from '../queues/queues.module';
import { PdfReportsService } from './pdf-reports.service';
import { PdfReportUploadJobData, PdfReportUploadJobResult } from './pdf-report-upload.types';

@Processor(PDF_REPORT_UPLOAD_QUEUE, {
  concurrency: 1,
  lockDuration: 2 * 60 * 60 * 1000,
})
export class PdfReportsUploadProcessor extends WorkerHost {
  private readonly logger = new Logger(PdfReportsUploadProcessor.name);

  constructor(private readonly pdfReportsService: PdfReportsService) {
    super();
  }

  async process(job: Job<PdfReportUploadJobData>): Promise<PdfReportUploadJobResult> {
    this.logger.log(`[pdf-report-upload] job_started jobId=${job.id} file=${job.data.fileName}`);
    await job.updateProgress({ percent: 10, step: 'Arquivo recebido' } as unknown as number);

    try {
      await job.updateProgress({ percent: 30, step: 'Enviando ao MinIO' } as unknown as number);
      const result = await this.pdfReportsService.persistUploadFromTemp(job.data);
      await job.updateProgress({ percent: 100, step: 'Concluído' } as unknown as number);
      this.logger.log(`[pdf-report-upload] job_completed jobId=${job.id} reportId=${result.id}`);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`[pdf-report-upload] job_failed jobId=${job.id} message=${message}`);
      throw error;
    }
  }
}
