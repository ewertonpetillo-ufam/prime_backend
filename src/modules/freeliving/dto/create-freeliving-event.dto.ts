import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateFreelivingEventDto {
  @ApiProperty({
    description: 'CPF do paciente (11 dígitos, com ou sem pontuação)',
    example: '12345678900',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  patient_cpf: string;

  @ApiProperty({
    description: 'Código da ação (catálogo freeliving_action_types)',
    example: 'collection_started',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  action_code: string;

  @ApiPropertyOptional({
    description: 'Instante da ação no dispositivo (ISO-8601). Default: agora no servidor.',
    example: '2026-09-01T18:30:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  occurred_at?: string;

  @ApiPropertyOptional({
    description: 'UUID gerado pelo app para retries idempotentes',
    example: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  })
  @IsOptional()
  @IsUUID()
  client_event_id?: string;

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

  @ApiPropertyOptional({
    description: 'Payload extra para ações futuras',
    type: Object,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
