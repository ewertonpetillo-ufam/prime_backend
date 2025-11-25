import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class SaveStopbangDto {
  @ApiProperty({
    description: 'Identificador do questionário',
    format: 'uuid',
  })
  @IsUUID()
  questionnaireId: string;

  @ApiPropertyOptional({ description: 'Ronco alto' })
  @IsOptional()
  @IsBoolean()
  snoring?: boolean;

  @ApiPropertyOptional({ description: 'Sensação de cansaço diurno' })
  @IsOptional()
  @IsBoolean()
  tired?: boolean;

  @ApiPropertyOptional({ description: 'Apneia observada' })
  @IsOptional()
  @IsBoolean()
  observed_apnea?: boolean;

  @ApiPropertyOptional({ description: 'Hipertensão arterial' })
  @IsOptional()
  @IsBoolean()
  blood_pressure?: boolean;

  @ApiPropertyOptional({ description: 'IMC superior a 35kg/m²' })
  @IsOptional()
  @IsBoolean()
  bmi_over_35?: boolean;

  @ApiPropertyOptional({ description: 'Idade acima de 50 anos' })
  @IsOptional()
  @IsBoolean()
  age_over_50?: boolean;

  @ApiPropertyOptional({ description: 'Pescoço largo (≥ 40 cm)' })
  @IsOptional()
  @IsBoolean()
  neck_circumference_large?: boolean;

  @ApiPropertyOptional({ description: 'Sexo masculino' })
  @IsOptional()
  @IsBoolean()
  gender_male?: boolean;
}

