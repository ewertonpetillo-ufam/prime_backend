import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AdminRoleGuard } from '../../common/guards/admin-role.guard';
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
