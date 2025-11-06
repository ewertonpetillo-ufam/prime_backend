import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@ApiTags('Patients')
@ApiBearerAuth('JWT-auth')
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new patient',
    description:
      'Creates a new patient. The CPF will be anonymized using HMAC-SHA256 before storing.',
  })
  @ApiResponse({
    status: 201,
    description: 'Patient created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid CPF format',
  })
  @ApiResponse({
    status: 409,
    description: 'Patient with this CPF already registered',
  })
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all patients' })
  @ApiResponse({
    status: 200,
    description: 'List of all patients',
  })
  findAll() {
    return this.patientsService.findAll();
  }

  @Get('by-cpf')
  @ApiOperation({
    summary: 'Find patient by CPF',
    description:
      'Searches for a patient using CPF. The CPF will be hashed before searching.',
  })
  @ApiQuery({
    name: 'cpf',
    description: 'CPF (11 digits)',
    example: '12345678900',
  })
  @ApiResponse({
    status: 200,
    description: 'Patient found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid CPF format',
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found',
  })
  findByCpf(@Query('cpf') cpf: string) {
    return this.patientsService.findByCpf(cpf);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient by ID' })
  @ApiParam({ name: 'id', description: 'Patient UUID' })
  @ApiResponse({
    status: 200,
    description: 'Patient found',
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.patientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update patient',
    description: 'Updates patient data. CPF cannot be changed.',
  })
  @ApiParam({ name: 'id', description: 'Patient UUID' })
  @ApiResponse({
    status: 200,
    description: 'Patient updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete patient' })
  @ApiParam({ name: 'id', description: 'Patient UUID' })
  @ApiResponse({
    status: 204,
    description: 'Patient deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.patientsService.remove(id);
  }
}
