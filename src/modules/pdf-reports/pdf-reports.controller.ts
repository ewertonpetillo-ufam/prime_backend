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

@ApiTags('PDF Reports')
@ApiBearerAuth('JWT-auth')
@Controller('pdf-reports')
export class PdfReportsController {
  constructor(private readonly pdfReportsService: PdfReportsService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Upload de relatório PDF',
    description: 'Armazena um relatório PDF associado a um questionário',
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
  @UseInterceptors(FileInterceptor('file'))
  async uploadReport(
    @Body() dto: UploadPdfReportDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { userId: string },
  ) {
    return this.pdfReportsService.uploadReport(dto, file, user?.userId);
  }

  @Get(':id/download')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Download de relatório PDF',
    description: 'Retorna o arquivo PDF original para download',
  })
  @ApiResponse({ status: 200, description: 'Relatório retornado com sucesso' })
  @ApiResponse({ status: 404, description: 'Relatório não encontrado' })
  async downloadReport(@Param('id') id: string, @Res() res: Response) {
    const report = await this.pdfReportsService.getReportById(id);
    const mimeType = report.mime_type || 'application/pdf';
    const dispositionFileName = encodeURIComponent(report.file_name || 'relatorio.pdf');

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${dispositionFileName}"`,
    });

    if (report.file_size_bytes) {
      res.set('Content-Length', report.file_size_bytes.toString());
    }

    res.send(report.file_data ?? Buffer.from([]));
  }
}

