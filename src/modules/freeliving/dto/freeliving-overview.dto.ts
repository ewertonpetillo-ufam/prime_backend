import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  DiaryOverviewStatus,
  FreelivingDiaryGap,
  FreelivingDiaryPayload,
  FreelivingDiaryStatus,
} from '../freeliving-diary.types';
import { FreelivingDayStatus } from '../freeliving.utils';

export class FreelivingActionTypeDto {
  @ApiProperty()
  code: string;

  @ApiProperty()
  label_pt: string;
}

export class FreelivingOverviewKpisDto {
  @ApiProperty()
  pacientesComAtividade: number;

  @ApiProperty()
  iniciaram: number;

  @ApiProperty()
  finalizaram: number;

  @ApiProperty()
  arquivosFl01: number;

  @ApiProperty()
  arquivosFl02: number;

  @ApiProperty()
  diariosEmPreenchimento: number;

  @ApiProperty()
  diariosCompletos: number;

  @ApiPropertyOptional({ nullable: true })
  ultimoEventoRecebidoAt: string | null;
}

export class FreelivingOverviewRowDto {
  @ApiProperty()
  patientId: string;

  @ApiProperty()
  patientLabel: string;

  @ApiProperty()
  patientName: string;

  @ApiProperty({ description: 'Dia civil America/Sao_Paulo (YYYY-MM-DD)' })
  collectionDate: string;

  @ApiProperty({
    enum: ['sem_acao', 'iniciou', 'finalizou', 'iniciou_e_finalizou'],
  })
  dayStatus: FreelivingDayStatus;

  @ApiPropertyOptional({ nullable: true })
  firstStartedAt: string | null;

  @ApiPropertyOptional({ nullable: true })
  lastFinishedAt: string | null;

  @ApiProperty()
  eventCount: number;

  @ApiProperty({
    enum: ['sem_acao', 'iniciou', 'finalizou', 'iniciou_e_finalizou'],
  })
  fl01DayStatus: FreelivingDayStatus;

  @ApiProperty({
    enum: ['sem_acao', 'iniciou', 'finalizou', 'iniciou_e_finalizou'],
  })
  fl02DayStatus: FreelivingDayStatus;

  @ApiProperty()
  fl01FileCount: number;

  @ApiPropertyOptional({ nullable: true })
  fl01LastUploadedAt: string | null;

  @ApiProperty()
  fl02FileCount: number;

  @ApiPropertyOptional({ nullable: true })
  fl02LastUploadedAt: string | null;

  @ApiPropertyOptional({ nullable: true })
  lastEventAt: string | null;

  @ApiPropertyOptional({ nullable: true })
  lastEventReceivedAt: string | null;

  @ApiProperty({
    enum: ['sem_registro', 'em_preenchimento', 'completo'],
  })
  diaryStatus: DiaryOverviewStatus;

  @ApiPropertyOptional({ nullable: true })
  diaryProtocolDay: number | null;

  @ApiProperty()
  diarySaveCount: number;

  @ApiProperty()
  diaryGapCount: number;

  @ApiProperty()
  diaryFilledSectionCount: number;

  @ApiPropertyOptional({ nullable: true })
  diaryLastSavedAt: string | null;
}

export class FreelivingOverviewMetaDto {
  @ApiProperty()
  dateFrom: string;

  @ApiProperty()
  dateTo: string;

  @ApiProperty()
  generatedAt: string;

  @ApiProperty({ type: [FreelivingActionTypeDto] })
  actionTypes: FreelivingActionTypeDto[];
}

export class FreelivingOverviewResponseDto {
  @ApiProperty()
  kpis: FreelivingOverviewKpisDto;

  @ApiProperty({ type: [FreelivingOverviewRowDto] })
  rows: FreelivingOverviewRowDto[];

  @ApiProperty()
  meta: FreelivingOverviewMetaDto;
}

export class FreelivingEventDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  actionCode: string;

  @ApiProperty()
  actionLabel: string;

  @ApiPropertyOptional({
    nullable: true,
    description:
      'Contexto opcional da ação (FL01, FL02 ou outro código). Nulo quando a ação não está ligada a uma tarefa.',
  })
  taskCode: string | null;

  @ApiProperty()
  occurredAt: string;

  @ApiProperty()
  receivedAt: string;

  @ApiProperty()
  collectionDate: string;

  @ApiPropertyOptional({ nullable: true })
  deviceType: string | null;

  @ApiPropertyOptional({ nullable: true })
  deviceModel: string | null;

  @ApiPropertyOptional({ nullable: true })
  osVersion: string | null;

  @ApiPropertyOptional({ nullable: true })
  appVersion: string | null;

  @ApiProperty()
  metadata: Record<string, unknown>;

  @ApiProperty()
  source: string;
}

export class FreelivingFileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  taskCode: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  fileSizeBytes: number;

  @ApiProperty()
  uploadedAt: string;
}

export class FreelivingDiaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  diaryDate: string;

  @ApiProperty()
  protocolDay: number;

  @ApiProperty({ enum: ['rascunho', 'completo'] })
  status: FreelivingDiaryStatus;

  @ApiProperty()
  payload: FreelivingDiaryPayload;

  @ApiProperty({ type: [Object] })
  gaps: FreelivingDiaryGap[];

  @ApiProperty()
  gapCount: number;

  @ApiProperty()
  filledSectionCount: number;

  @ApiProperty()
  sectionCount: number;

  @ApiProperty()
  saveCount: number;

  @ApiProperty()
  firstSavedAt: string;

  @ApiProperty()
  lastSavedAt: string;
}

export class FreelivingPatientDetailResponseDto {
  @ApiProperty()
  patientId: string;

  @ApiProperty()
  patientLabel: string;

  @ApiProperty()
  patientName: string;

  @ApiProperty()
  collectionDate: string;

  @ApiProperty({ type: [FreelivingEventDto] })
  events: FreelivingEventDto[];

  @ApiProperty({ type: [FreelivingFileDto] })
  files: FreelivingFileDto[];

  @ApiPropertyOptional({ type: () => FreelivingDiaryDto, nullable: true })
  diary: FreelivingDiaryDto | null;
}
