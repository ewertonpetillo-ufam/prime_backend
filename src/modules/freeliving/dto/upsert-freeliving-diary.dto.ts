import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpsertFreelivingDiaryDto {
  @ApiProperty({
    description: 'CPF do paciente (11 dígitos, com ou sem pontuação)',
    example: '12345678900',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  patient_cpf: string;

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

  @ApiPropertyOptional({
    description:
      'Data civil do diário (YYYY-MM-DD, America/Sao_Paulo). Default: hoje.',
    example: '2026-09-02',
  })
  @IsOptional()
  @IsDateString()
  diary_date?: string;

  @ApiPropertyOptional({
    description: 'Instante do save no dispositivo (ISO-8601)',
    example: '2026-09-02T14:30:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  occurred_at?: string;

  @ApiPropertyOptional({
    description: 'UUID gerado pelo app para retries do mesmo documento',
    example: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  })
  @IsOptional()
  @IsUUID()
  client_diary_id?: string;

  @ApiPropertyOptional({ example: 'smartphone' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  device_type?: string;

  @ApiPropertyOptional({ example: 'Galaxy Watch 6' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  device_model?: string;

  @ApiPropertyOptional({ example: 'Android 14' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  os_version?: string;

  @ApiPropertyOptional({ example: '1.4.0' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  app_version?: string;

  @ApiProperty({
    description:
      'Snapshot das 4 seções do diário. Seções omitidas preservam o valor já salvo.',
    type: Object,
  })
  @IsObject()
  payload: Record<string, unknown>;
}
