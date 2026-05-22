import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class SaveSpeechPatientDescriptionDto {
  @ApiProperty({
    description: 'Identificador do questionário',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  questionnaireId: string;

  @ApiPropertyOptional({
    description: 'Descrição do paciente na avaliação da fala',
  })
  @IsString()
  @IsOptional()
  speechPatientDescription?: string;
}
