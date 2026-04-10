import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

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
}
