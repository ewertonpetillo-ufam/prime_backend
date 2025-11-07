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

@ApiTags('Binary Collections')
@ApiBearerAuth('JWT-auth')
@Controller('binary-collections')
export class BinaryCollectionsController {
  constructor(
    private readonly binaryCollectionsService: BinaryCollectionsService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Upload CSV file from collection app',
    description:
      'Receives CPF (plain text), task code (e.g., TA1), and CSV file. ' +
      'The CPF will be hashed with HMAC to find the patient, then the binary file will be stored.',
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
          description: 'CSV file',
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
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!task_code) {
      throw new BadRequestException('task_code is required');
    }

    return this.binaryCollectionsService.uploadCsv(patient_cpf, task_code, file);
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
  @Header('Content-Type', 'text/csv')
  @ApiOperation({
    summary: 'Download binary collection CSV file',
    description: 'Downloads the CSV file associated with the binary collection',
  })
  @ApiParam({ name: 'id', description: 'Binary collection UUID' })
  @ApiResponse({
    status: 200,
    description: 'CSV file downloaded successfully',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Binary collection not found or CSV data not available',
  })
  async downloadCsv(@Param('id', ParseUUIDPipe) id: string) {
    const { buffer, filename } = await this.binaryCollectionsService.downloadCsv(id);
    return new StreamableFile(buffer, {
      type: 'text/csv',
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
}
