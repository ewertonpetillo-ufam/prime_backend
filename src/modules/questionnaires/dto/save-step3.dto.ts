import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsUUID,
  IsInt,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MedicationDto {
  @ApiPropertyOptional({ description: 'Drug name', example: 'Levodopa' })
  @IsString()
  @IsOptional()
  drug?: string;

  @ApiPropertyOptional({ description: 'Dose in mg', example: 300 })
  @IsNumber()
  @IsOptional()
  doseMg?: number;

  @ApiPropertyOptional({ description: 'Quantity per day', example: 3 })
  @IsInt()
  @IsOptional()
  qtDose?: number;

  @ApiPropertyOptional({ description: 'LED value', example: 300 })
  @IsNumber()
  @IsOptional()
  led?: number;
}

export class SaveStep3Dto {
  @ApiProperty({
    description: 'Questionnaire ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  questionnaireId: string;

  @ApiPropertyOptional({ description: 'Diagnostic description', example: 'Doença de Parkinson' })
  @IsString()
  @IsOptional()
  diagnosticDescription?: string;

  @ApiPropertyOptional({ description: 'Age at onset', example: 65 })
  @IsInt()
  @IsOptional()
  onsetAge?: number;

  @ApiPropertyOptional({ description: 'Parkinson onset time', example: '5 anos' })
  @IsString()
  @IsOptional()
  parkinsonOnset?: string;

  @ApiPropertyOptional({ description: 'Initial symptom', example: 'Tremor' })
  @IsString()
  @IsOptional()
  initialSympton?: string;

  @ApiPropertyOptional({ description: 'Parkinson side', example: 'Direito' })
  @IsString()
  @IsOptional()
  parkinsonSide?: string;

  @ApiPropertyOptional({ description: 'Family case', example: 'Sim' })
  @IsString()
  @IsOptional()
  familyCase?: string;

  @ApiPropertyOptional({ description: 'Kinship degree', example: 'Pai' })
  @IsString()
  @IsOptional()
  kinshipDegree?: string;

  @ApiPropertyOptional({ description: 'Main phenotype', example: 'Tremulante' })
  @IsString()
  @IsOptional()
  mainPhenotype?: string;

  @ApiPropertyOptional({ description: 'Levodopa ON', example: true })
  @IsBoolean()
  @IsOptional()
  levodopaOn?: boolean;

  @ApiPropertyOptional({ description: 'Medications', type: [MedicationDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MedicationDto)
  medications?: MedicationDto[];

  @ApiPropertyOptional({ description: 'LEDD result', example: 600 })
  @IsNumber()
  @IsOptional()
  leddResult?: number;

  @ApiPropertyOptional({ description: 'Comorbidities', example: 'Hipertensão' })
  @IsString()
  @IsOptional()
  comorbidities?: string;

  @ApiPropertyOptional({ description: 'Other medications', example: 'Aspirina' })
  @IsString()
  @IsOptional()
  otherMedications?: string;

  @ApiPropertyOptional({ description: 'Has dyskinesia', example: false })
  @IsBoolean()
  @IsOptional()
  diskinectiaPresence?: boolean;

  @ApiPropertyOptional({ description: 'Has freezing of gait', example: false })
  @IsBoolean()
  @IsOptional()
  fog?: boolean;

  @ApiPropertyOptional({ description: 'FOG classification', example: 'Pico de dose' })
  @IsString()
  @IsOptional()
  fogClassifcation?: string;

  @ApiPropertyOptional({ description: 'Has wearing off', example: false })
  @IsBoolean()
  @IsOptional()
  wearingOff?: boolean;

  @ApiPropertyOptional({ description: 'Duration wearing off', example: '4 horas' })
  @IsString()
  @IsOptional()
  durationWearingOff?: string;

  @ApiPropertyOptional({ description: 'Has delay on', example: false })
  @IsBoolean()
  @IsOptional()
  DelayOn?: boolean;

  @ApiPropertyOptional({ description: 'Duration L-Dopa', example: '30 minutos' })
  @IsString()
  @IsOptional()
  durationLDopa?: string;

  @ApiPropertyOptional({ description: 'Hoehn-Yahr scale', example: '2.5' })
  @IsString()
  @IsOptional()
  scaleHY?: string;

  @ApiPropertyOptional({ description: 'Schwab & England score', example: '80' })
  @IsString()
  @IsOptional()
  scaleSE?: string;
}

