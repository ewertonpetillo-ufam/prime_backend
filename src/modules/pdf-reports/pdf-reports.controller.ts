import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Res,
  Delete,
  PayloadTooLargeException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PdfReportsService } from './pdf-reports.service';
import { UploadPdfReportDto } from './dto/upload-pdf-report.dto';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { Response } from 'express';

const MAX_UPLOAD_FILE_SIZE_BYTES =
  Number(process.env.UPLOAD_MAX_FILE_SIZE_BYTES || 50 * 1024 * 1024);

@ApiTags('PDF Reports')
@ApiBearerAuth('JWT-auth')
@Controller('pdf-reports')
export class PdfReportsController {
  constructor(private readonly pdfReportsService: PdfReportsService) {}

  private logMemoryTelemetry(event: string, details: Record<string, unknown>) {
    const mem = process.memoryUsage();
    console.log(`[pdf-reports] ${event}`, {
      ...details,
      heapUsedMB: Number((mem.heapUsed / 1024 / 1024).toFixed(2)),
      rssMB: Number((mem.rss / 1024 / 1024).toFixed(2)),
    });
  }

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Upload de relatório de arquivo',
    description: 'Armazena um arquivo associado a um questionário (PDF, ZIP, CSV, TXT, EDF, etc.)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        questionnaireId: { type: 'string', format: 'uuid' },
        reportType: {
          type: 'string',
          enum: ['BIOBIT', 'DELSYS', 'POLYSOMNOGRAPHY', 'OTHER'],
        },
        notes: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['questionnaireId', 'reportType', 'file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Relatório salvo com sucesso' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_UPLOAD_FILE_SIZE_BYTES },
    }),
  )
  async uploadReport(
    @Body() dto: UploadPdfReportDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { userId: string },
  ) {
    const startedAt = Date.now();
    if (file && file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
      throw new PayloadTooLargeException(
        `Arquivo excede o limite de ${MAX_UPLOAD_FILE_SIZE_BYTES} bytes`,
      );
    }
    const result = await this.pdfReportsService.uploadReport(dto, file, user?.userId);
    this.logMemoryTelemetry('upload_report', {
      questionnaireId: dto.questionnaireId,
      reportType: dto.reportType,
      fileSizeBytes: file?.size ?? 0,
      durationMs: Date.now() - startedAt,
    });
    return result;
  }

  @Get(':id/download')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Download de relatório de arquivo',
    description: 'Retorna o arquivo original para download',
  })
  @ApiResponse({ status: 200, description: 'Relatório retornado com sucesso' })
  @ApiResponse({ status: 404, description: 'Relatório não encontrado' })
  async downloadReport(@Param('id') id: string, @Res() res: Response) {
    const startedAt = Date.now();
    const { report, stream } = await this.pdfReportsService.getReportForDownload(id);
    const mimeType = report.mime_type || 'application/octet-stream';
    const dispositionFileName = encodeURIComponent(report.file_name || 'relatorio');

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${dispositionFileName}"`,
    });

    if (report.file_size_bytes) {
      res.set('Content-Length', report.file_size_bytes.toString());
    }

    stream.on('error', (err: Error & { code?: string }) => {
      console.error('[pdf-reports] download stream error', {
        reportId: id,
        message: err?.message,
        code: err?.code,
      });
      if (!res.headersSent) {
        res.status(500).json({
          statusCode: 500,
          message: 'Falha ao transmitir o arquivo do armazenamento',
        });
      } else {
        res.destroy(err);
      }
    });

    stream.on('end', () => {
      this.logMemoryTelemetry('download_report', {
        reportId: id,
        fileSizeBytes: report.file_size_bytes ?? 0,
        durationMs: Date.now() - startedAt,
      });
    });

    stream.pipe(res);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir relatório de arquivo',
    description: 'Remove um relatório PDF associado a um questionário',
  })
  @ApiResponse({ status: 204, description: 'Relatório excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Relatório não encontrado' })
  async deleteReport(@Param('id') id: string) {
    await this.pdfReportsService.deleteReport(id);
  }
}

