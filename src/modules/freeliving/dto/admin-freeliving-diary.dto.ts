import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClinicalMedicationSlot } from '../freeliving-clinical-medications';
import { FreelivingDiaryDto } from './freeliving-overview.dto';

export class FreelivingClinicalMedicationDto {
  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ nullable: true })
  doseMg: number | null;

  @ApiPropertyOptional({ nullable: true })
  dosesPerDay: number | null;

  @ApiProperty()
  label: string;
}

export class FreelivingDiaryPatientSearchDto {
  @ApiProperty()
  patientId: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  cpf: string;

  @ApiPropertyOptional({ nullable: true })
  publicIdentifier: string | null;

  @ApiProperty({ type: [FreelivingClinicalMedicationDto] })
  medications: ClinicalMedicationSlot[];

  @ApiProperty({
    description: 'Quantidade de medicamentos além dos 5 slots M1–M5',
  })
  extraMedicationCount: number;
}

export class FreelivingDiaryListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  diaryDate: string;

  @ApiProperty()
  protocolDay: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  gapCount: number;

  @ApiProperty()
  filledSectionCount: number;

  @ApiProperty()
  sectionCount: number;

  @ApiProperty()
  saveCount: number;

  @ApiProperty()
  lastSavedAt: string;

  @ApiProperty({
    enum: ['app', 'admin'],
    description:
      'Origem do registro: enviado pelo app de coleta ou digitado no painel',
  })
  source: 'app' | 'admin';

  @ApiPropertyOptional()
  patientId?: string;

  @ApiPropertyOptional()
  patientName?: string;

  @ApiPropertyOptional({ nullable: true })
  publicIdentifier?: string | null;
}

export class FreelivingDiaryListResponseDto {
  @ApiProperty({ type: [FreelivingDiaryListItemDto] })
  items: FreelivingDiaryListItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;
}

export class FreelivingDiaryEditorDto extends FreelivingDiaryDto {
  @ApiProperty()
  patientId: string;

  @ApiProperty()
  patientName: string;

  @ApiPropertyOptional({ nullable: true })
  publicIdentifier: string | null;
}
