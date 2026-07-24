import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  ValidateIf,
} from 'class-validator';

export class SaveSleepPatientDescriptionDto {
  @ApiProperty({
    description: 'Identificador do questionário',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  questionnaireId: string;

  @ApiPropertyOptional({
    description: 'Descrição do paciente na avaliação do sono',
  })
  @IsString()
  @IsOptional()
  sleepPatientDescription?: string;

  @ApiPropertyOptional({
    description: 'Data do exame do sono (YYYY-MM-DD). Envie vazio para limpar.',
    example: '2026-07-23',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((_, v) => v !== '' && v != null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'sleepExamDate must be YYYY-MM-DD',
  })
  sleepExamDate?: string;
}
