import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FreelivingDiaryDto } from './dto/freeliving-overview.dto';
import { UpsertFreelivingDiaryDto } from './dto/upsert-freeliving-diary.dto';
import { FreelivingService } from './freeliving.service';

@ApiTags('FreeLiving')
@ApiBearerAuth('JWT-auth')
@Controller('freeliving')
export class FreelivingDiaryController {
  constructor(private readonly freelivingService: FreelivingService) {}

  @Put('diary')
  @ApiOperation({
    summary: 'Cria ou atualiza o diário FreeLiving do dia',
    description:
      'Upsert por paciente + diary_date. O app envia o snapshot das seções; ' +
      'seções omitidas preservam o valor já salvo. O servidor calcula gaps e status. ' +
      'Na primeira gravação registra diary_started; ao completar, diary_submitted.',
  })
  @ApiOkResponse({ type: FreelivingDiaryDto })
  upsertDiary(@Body() dto: UpsertFreelivingDiaryDto) {
    return this.freelivingService.upsertDiary(dto);
  }

  @Get('diary')
  @ApiOperation({
    summary: 'Retoma o rascunho do diário do dia',
  })
  @ApiQuery({ name: 'patient_cpf', required: true })
  @ApiQuery({
    name: 'diary_date',
    required: false,
    description: 'YYYY-MM-DD. Default: hoje (America/Sao_Paulo)',
  })
  @ApiOkResponse({ type: FreelivingDiaryDto })
  getDiary(
    @Query('patient_cpf') patientCpf: string,
    @Query('diary_date') diaryDate?: string,
  ) {
    return this.freelivingService.getDiaryByCpf(patientCpf, diaryDate);
  }
}
