import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class SavePhysioDto {
  @ApiProperty({
    description: 'Identificador do questionário',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  questionnaireId: string;

  @ApiPropertyOptional({
    description: 'Descrição fisioterápica do paciente',
  })
  @IsString()
  @IsOptional()
  physioPatientDescription?: string;
}

