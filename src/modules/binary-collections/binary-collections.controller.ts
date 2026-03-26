import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  PayloadTooLargeException,
  StreamableFile,
  Header,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { BinaryCollectionsService } from './binary-collections.service';
import { UploadBinaryDto } from './dto/upload-binary.dto';

const MAX_UPLOAD_FILE_SIZE_BYTES =
  Number(process.env.UPLOAD_MAX_FILE_SIZE_BYTES || 50 * 1024 * 1024);

@ApiTags('Binary Collections')
@ApiBearerAuth('JWT-auth')
@Controller('binary-collections')
export class BinaryCollectionsController {
  constructor(
    private readonly binaryCollectionsService: BinaryCollectionsService,
  ) {}

  private logMemoryTelemetry(event: string, details: Record<string, unknown>) {
    const mem = process.memoryUsage();
    console.log(`[binary-collections] ${event}`, {
      ...details,
      heapUsedMB: Number((mem.heapUsed / 1024 / 1024).toFixed(2)),
      rssMB: Number((mem.rss / 1024 / 1024).toFixed(2)),
    });
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_UPLOAD_FILE_SIZE_BYTES },
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Upload de arquivo binário do app de coleta',
    description:
      'Recebe CPF (texto puro), código da tarefa (ex.: TA1) e um arquivo binário (CSV, áudio, etc.). ' +
      'O CPF será hasheado com HMAC para localizar o paciente, e o arquivo binário será armazenado.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['patient_cpf', 'task_code', 'file'],
      properties: {
        patient_cpf: {
          type: 'string',
          description: 'CPF of the patient (11 digits)',
          example: '12345678900',
        },
        task_code: {
          type: 'string',
          description: 'Task code (e.g., TA1, TA2, TA3)',
          example: 'TA1',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo binário (CSV, áudio, etc.)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid CPF format or missing file',
  })
  @ApiResponse({
    status: 404,
    description: 'Patient or task not found',
  })
  async uploadCsv(
    @UploadedFile() file: Express.Multer.File,
    @Body('patient_cpf') patient_cpf: string,
    @Body('task_code') task_code: string,
  ) {
    const startedAt = Date.now();
    if (!file) {
      throw new BadRequestException('File is required');
    }
    if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
      throw new PayloadTooLargeException(
        `Arquivo excede o limite de ${MAX_UPLOAD_FILE_SIZE_BYTES} bytes`,
      );
    }

    if (!task_code) {
      throw new BadRequestException('task_code is required');
    }

    const result = await this.binaryCollectionsService.uploadCsv(patient_cpf, task_code, file);
    this.logMemoryTelemetry('upload_binary', {
      taskCode: task_code,
      fileSizeBytes: file.size,
      durationMs: Date.now() - startedAt,
    });
    return result;
  }

  @Get()
  @ApiOperation({
    summary: 'Get all binary collections',
    description: 'Returns list of all binary collections (without binary data)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of binary collections',
  })
  findAll() {
    return this.binaryCollectionsService.findAll();
  }

  @Get('by-cpf/:cpf')
  @ApiOperation({
    summary: 'Get binary collections by patient CPF',
    description:
      'Returns all binary collections for a patient identified by CPF. ' +
      'The CPF will be hashed with HMAC-SHA256 to find the patient\'s collections. ' +
      'Returns an array of binary collections without the csv_data field to reduce payload size.',
  })
  @ApiParam({
    name: 'cpf',
    description: 'Patient CPF (11 digits, plain text)',
    example: '12345678900',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of binary collections for the patient (without csv_data)',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
          patient_cpf_hash: { type: 'string', example: '540c70713031a70595de28f3c0c80100edb79e1733943274d82133d50ca3d7db' },
          task_id: { type: 'number', example: 1 },
          questionnaire_id: { type: 'string', format: 'uuid', nullable: true },
          repetitions_count: { type: 'number', example: 1 },
          file_size_bytes: { type: 'number', example: 1024 },
          file_checksum: { type: 'string', nullable: true },
          collection_type: { type: 'string', enum: ['MOTOR', 'GAIT', 'TREMOR', 'SPEECH', 'OTHER'], example: 'MOTOR' },
          device_type: { type: 'string', nullable: true },
          device_serial: { type: 'string', nullable: true },
          sampling_rate_hz: { type: 'number', nullable: true },
          processing_status: { type: 'string', enum: ['pending', 'processing', 'completed', 'error'], example: 'pending' },
          collected_at: { type: 'string', format: 'date-time' },
          uploaded_at: { type: 'string', format: 'date-time' },
          metadata: { type: 'object' },
          processing_error: { type: 'string', nullable: true },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid CPF format - CPF must contain exactly 11 digits',
  })
  @ApiResponse({
    status: 404,
    description: 'No collections found for this CPF (returns empty array)',
  })
  findByCpf(@Param('cpf') cpf: string) {
    return this.binaryCollectionsService.findByCpf(cpf);
  }

  @Get(':id/download')
  @ApiOperation({
    summary: 'Download de arquivo da coleção binária',
    description:
      'Faz o download do arquivo binário associado à coleção (CSV, áudio, etc.). ' +
      'O content-type é retornado conforme o tipo de arquivo armazenado.',
  })
  @ApiParam({ name: 'id', description: 'Binary collection UUID' })
  @ApiResponse({
    status: 200,
    description: 'Arquivo binário baixado com sucesso',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Binary collection não encontrada ou dados binários indisponíveis',
  })
  async downloadCsv(@Param('id', ParseUUIDPipe) id: string) {
    const startedAt = Date.now();
    const { buffer, filename, contentType } =
      await this.binaryCollectionsService.downloadCsv(id);
    this.logMemoryTelemetry('download_binary', {
      collectionId: id,
      fileSizeBytes: buffer.length,
      durationMs: Date.now() - startedAt,
    });
    return new StreamableFile(buffer, {
      type: contentType,
      disposition: `attachment; filename="${filename}"`,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get binary collection by ID',
    description: 'Returns binary collection including the binary data',
  })
  @ApiParam({ name: 'id', description: 'Binary collection UUID' })
  @ApiResponse({
    status: 200,
    description: 'Binary collection found',
  })
  @ApiResponse({
    status: 404,
    description: 'Binary collection not found',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.binaryCollectionsService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete binary collection' })
  @ApiParam({ name: 'id', description: 'Binary collection UUID' })
  @ApiResponse({
    status: 204,
    description: 'Binary collection deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Binary collection not found',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.binaryCollectionsService.remove(id);
  }

  @Get('count/by-questionnaire/:questionnaireId')
  @ApiOperation({
    summary: 'Count binary collections by questionnaire ID',
    description: 'Returns the count of binary collections associated with a questionnaire',
  })
  @ApiParam({
    name: 'questionnaireId',
    description: 'Questionnaire UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Count of binary collections',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 5 },
      },
    },
  })
  async countByQuestionnaireId(@Param('questionnaireId', ParseUUIDPipe) questionnaireId: string) {
    const count = await this.binaryCollectionsService.countByQuestionnaireId(questionnaireId);
    return { count };
  }

  @Get('statistics/last-30-days')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get binary collections statistics for last 30 days',
    description: 'Returns count of binary collections grouped by date for the last 30 days',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getBinaryCollectionsStatisticsLast30Days() {
    return this.binaryCollectionsService.getBinaryCollectionsStatisticsLast30Days();
  }

  @Get('statistics/by-task')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get binary collections statistics grouped by active task',
    description: 'Returns count of binary collections for each active task',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getBinaryCollectionsByTask() {
    return this.binaryCollectionsService.getBinaryCollectionsByTask();
  }
}
