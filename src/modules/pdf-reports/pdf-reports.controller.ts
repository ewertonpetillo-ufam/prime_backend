import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpCode,
  HttpStatus,
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
}

