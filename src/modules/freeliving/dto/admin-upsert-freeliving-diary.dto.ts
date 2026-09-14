import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsObject,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AdminUpsertFreelivingDiaryDto {
  @ApiProperty({ description: 'UUID do paciente' })
  @IsUUID()
  patientId: string;

  @ApiProperty({
    description: 'Dia do protocolo FreeLiving (1 a 7)',
    example: 1,
    minimum: 1,
    maximum: 7,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(7)
  protocol_day: number;

  @ApiProperty({
    description: 'Data civil do diário (YYYY-MM-DD, America/Sao_Paulo)',
    example: '2026-09-14',
  })
  @IsDateString()
  diary_date: string;

  @ApiProperty({
    description: 'Snapshot das 4 seções do diário. Chaves em inglês.',
    type: Object,
  })
  @IsObject()
  payload: Record<string, unknown>;
}
