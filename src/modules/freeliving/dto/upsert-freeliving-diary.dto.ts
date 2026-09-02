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
      'Snapshot das 4 seções do diário. Seções omitidas preservam o valor já salvo. Chaves em inglês.',
    type: Object,
    example: {
      medication: {
        labels: { m1: 'Levodopa', m2: null, m3: null, m4: null, m5: null },
        doses: [
          {
            time: '08:00',
            m1: true,
            m2: false,
            m3: false,
            m4: false,
            m5: false,
            notes: null,
          },
        ],
      },
      activities: {
        morning_hygiene: { time: '07:00', notes: null },
        meal_1: { time: '08:00', notes: null },
        short_walk: { time: '10:00', notes: null },
        arms_extended_1: { time: '11:00', notes: null },
        arms_extended_2: { time: '16:00', notes: null },
      },
      symptoms: {
        tremor: { '06': 0, '07': 1 },
        slowness: { '06': 0 },
        dyskinesia: { '06': 0 },
        walking: { '06': 0 },
        freezing: { '06': 0 },
      },
      devices: {
        watch_usage: 'all_day',
        phone_nearby: 'yes',
        watch_removed: { from: null, to: null, reason: null },
        device_problem: false,
        device_problem_detail: null,
        charged_end_of_day: true,
        sleep_with_smartwatch: true,
        day_notes: null,
      },
    },
  })
  @IsObject()
  payload: Record<string, unknown>;
}
