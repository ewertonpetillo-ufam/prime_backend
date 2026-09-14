import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AdminRoleGuard } from '../../common/guards/admin-role.guard';
import { isUUID } from 'class-validator';
import { AdminUpsertFreelivingDiaryDto } from './dto/admin-upsert-freeliving-diary.dto';
import { FreelivingService } from './freeliving.service';

@ApiTags('Admin - FreeLiving')
@ApiBearerAuth('JWT-auth')
@UseGuards(AdminRoleGuard)
@Controller('admin/freeliving')
export class AdminFreelivingController {
  constructor(private readonly freelivingService: FreelivingService) {}

  @Get('overview')
  @ApiOperation({
    summary: 'Acompanhamento diário das coletas FreeLiving',
    description:
      'Lista pacientes com ações do app e arquivos FL01/FL02 no período. Default: hoje (America/Sao_Paulo).',
  })
  @ApiQuery({ name: 'date', required: false, description: 'Dia YYYY-MM-DD' })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @ApiQuery({
    name: 'patient',
    required: false,
    description: 'Busca por identificador público ou nome',
  })
  @ApiQuery({
    name: 'actionCode',
    required: false,
    description: 'Filtra pacientes que tenham esta ação no período',
  })
  @ApiQuery({
    name: 'taskCode',
    required: false,
    description: 'Filtra por task_code quando a ação estiver ligada a uma atividade (ex.: FL01)',
  })
  @ApiQuery({
    name: 'dayStatus',
    required: false,
    enum: ['sem_acao', 'iniciou', 'finalizou', 'iniciou_e_finalizou'],
  })
  @ApiQuery({ name: 'hasFl01', required: false })
  @ApiQuery({ name: 'hasFl02', required: false })
  @ApiQuery({
    name: 'onlyWithActivity',
    required: false,
    description: 'Default true. Se false e date de um único dia, inclui pacientes sem atividade.',
  })
  @ApiQuery({
    name: 'diaryStatus',
    required: false,
    enum: ['sem_registro', 'em_preenchimento', 'completo'],
  })
  getOverview(
    @Query('date') date?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('patient') patient?: string,
    @Query('actionCode') actionCode?: string,
    @Query('taskCode') taskCode?: string,
    @Query('dayStatus') dayStatus?: string,
    @Query('hasFl01') hasFl01?: string,
    @Query('hasFl02') hasFl02?: string,
    @Query('onlyWithActivity') onlyWithActivity?: string,
    @Query('diaryStatus') diaryStatus?: string,
  ) {
    return this.freelivingService.getOverview({
      date,
      dateFrom,
      dateTo,
      patient,
      actionCode,
      taskCode,
      dayStatus,
      hasFl01,
      hasFl02,
      onlyWithActivity,
      diaryStatus,
    });
  }

  @Get('patients/search')
  @ApiOperation({
    summary: 'Busca pacientes para o diário Free Living',
    description: 'Nome, CPF (dígitos) ou identificador público. Inclui medicamentos clínicos.',
  })
  @ApiQuery({ name: 'term', required: false })
  searchPatients(@Query('term') term?: string) {
    return this.freelivingService.searchPatientsForDiary(term);
  }

  @Get('diaries')
  @ApiOperation({
    summary: 'Lista diários Free Living',
    description:
      'Sem patientId: todos os diários paginados. Com patientId: diários daquele paciente.',
  })
  @ApiQuery({ name: 'patientId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'term', required: false })
  @ApiQuery({ name: 'source', required: false })
  @ApiQuery({ name: 'status', required: false })
  async listDiaries(
    @Query('patientId') patientId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('term') term?: string,
    @Query('source') source?: string,
    @Query('status') status?: string,
  ) {
    const parsedPage = Number.parseInt(page || '1', 10);
    const parsedSize = Number.parseInt(pageSize || '20', 10);
    const trimmed = patientId?.trim();
    const sourceFilter =
      source === 'app' || source === 'admin' ? source : undefined;
    const statusFilter = status?.trim().toLowerCase();
    if (!trimmed) {
      return this.freelivingService.listRecentDiaries({
        page: parsedPage,
        pageSize: parsedSize,
        term,
        source: sourceFilter,
        status: statusFilter,
      });
    }
    if (!isUUID(trimmed)) {
      throw new BadRequestException('patientId inválido');
    }
    const items = await this.freelivingService.listDiariesByPatient(trimmed);
    return {
      items,
      total: items.length,
      page: 1,
      pageSize: items.length || parsedSize,
    };
  }

  @Put('diaries')
  @ApiOperation({
    summary: 'Cria ou atualiza o diário Free Living pelo painel admin',
  })
  upsertDiary(@Body() dto: AdminUpsertFreelivingDiaryDto) {
    return this.freelivingService.upsertDiaryByPatientId(dto);
  }

  @Get('diaries/:id')
  @ApiOperation({ summary: 'Obtém um diário pelo id' })
  @ApiParam({ name: 'id', description: 'UUID do diário' })
  getDiary(@Param('id', ParseUUIDPipe) id: string) {
    return this.freelivingService.getDiaryById(id);
  }

  @Delete('diaries/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui um diário cadastrado' })
  @ApiParam({ name: 'id', description: 'UUID do diário' })
  deleteDiary(@Param('id', ParseUUIDPipe) id: string) {
    return this.freelivingService.deleteDiary(id);
  }

  @Get('patients/:patientId/diary-document')
  @ApiOperation({
    summary: 'Gera o formulário do diário em 7 vias (DOCX)',
    description:
      'Layout do modelo oficial, com identificação e medicamentos do questionário clínico.',
  })
  @ApiParam({ name: 'patientId', description: 'UUID do paciente' })
  async downloadDiaryDocument(
    @Param('patientId', ParseUUIDPipe) patientId: string,
  ) {
    const { buffer, fileName } =
      await this.freelivingService.buildDiaryDocumentForPatient(patientId);
    const asciiName = fileName.replace(/[^\x20-\x7E]/g, '_');
    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      disposition: `attachment; filename="${asciiName}"`,
    });
  }

  @Get('patients/:patientId')
  @ApiOperation({
    summary: 'Detalhe de um paciente no dia: timeline de ações e arquivos FL01/FL02',
  })
  @ApiParam({ name: 'patientId', description: 'UUID do paciente' })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Dia YYYY-MM-DD (America/Sao_Paulo). Default: hoje.',
  })
  getPatientDetail(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Query('date') date?: string,
  ) {
    return this.freelivingService.getPatientDetail(patientId, date);
  }
}
