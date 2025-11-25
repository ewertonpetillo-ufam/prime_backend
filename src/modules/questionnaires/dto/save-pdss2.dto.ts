import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsInt, Min, Max, IsOptional } from 'class-validator';

const MIN_P = 0;
const MAX_P = 4;

export class SavePdss2Dto {
  @ApiProperty({
    description: 'Identificador do questionário',
    format: 'uuid',
  })
  @IsUUID()
  questionnaireId: string;

  @ApiPropertyOptional({ description: 'Questão 1', minimum: MIN_P, maximum: MAX_P })
  @IsOptional()
  @IsInt()
  @Min(MIN_P)
  @Max(MAX_P)
  q1?: number;

  @ApiPropertyOptional({ description: 'Questão 2', minimum: MIN_P, maximum: MAX_P })
  @IsOptional()
  @IsInt()
  @Min(MIN_P)
  @Max(MAX_P)
  q2?: number;

  @ApiPropertyOptional({ description: 'Questão 3', minimum: MIN_P, maximum: MAX_P })
  @IsOptional()
  @IsInt()
  @Min(MIN_P)
  @Max(MAX_P)
  q3?: number;

  @ApiPropertyOptional({ description: 'Questão 4', minimum: MIN_P, maximum: MAX_P })
  @IsOptional()
  @IsInt()
  @Min(MIN_P)
  @Max(MAX_P)
  q4?: number;

  @ApiPropertyOptional({ description: 'Questão 5', minimum: MIN_P, maximum: MAX_P })
  @IsOptional()
  @IsInt()
  @Min(MIN_P)
  @Max(MAX_P)
  q5?: number;

  @ApiPropertyOptional({ description: 'Questão 6', minimum: MIN_P, maximum: MAX_P })
  @IsOptional()
  @IsInt()
  @Min(MIN_P)
  @Max(MAX_P)
  q6?: number;

  @ApiPropertyOptional({ description: 'Questão 7', minimum: MIN_P, maximum: MAX_P })
  @IsOptional()
  @IsInt()
  @Min(MIN_P)
  @Max(MAX_P)
  q7?: number;

  @ApiPropertyOptional({ description: 'Questão 8', minimum: MIN_P, maximum: MAX_P })
  @IsOptional()
  @IsInt()
  @Min(MIN_P)
  @Max(MAX_P)
  q8?: number;

  @ApiPropertyOptional({ description: 'Questão 9', minimum: MIN_P, maximum: MAX_P })
  @IsOptional()
  @IsInt()
  @Min(MIN_P)
  @Max(MAX_P)
  q9?: number;

  @ApiPropertyOptional({ description: 'Questão 10', minimum: MIN_P, maximum: MAX_P })
  @IsOptional()
  @IsInt()
  @Min(MIN_P)
  @Max(MAX_P)
  q10?: number;

  @ApiPropertyOptional({ description: 'Questão 11', minimum: MIN_P, maximum: MAX_P })
  @IsOptional()
  @IsInt()
  @Min(MIN_P)
  @Max(MAX_P)
  q11?: number;

  @ApiPropertyOptional({ description: 'Questão 12', minimum: MIN_P, maximum: MAX_P })
  @IsOptional()
  @IsInt()
  @Min(MIN_P)
  @Max(MAX_P)
  q12?: number;

  @ApiPropertyOptional({ description: 'Questão 13', minimum: MIN_P, maximum: MAX_P })
  @IsOptional()
  @IsInt()
  @Min(MIN_P)
  @Max(MAX_P)
  q13?: number;

  @ApiPropertyOptional({ description: 'Questão 14', minimum: MIN_P, maximum: MAX_P })
  @IsOptional()
  @IsInt()
  @Min(MIN_P)
  @Max(MAX_P)
  q14?: number;

  @ApiPropertyOptional({ description: 'Questão 15', minimum: MIN_P, maximum: MAX_P })
  @IsOptional()
  @IsInt()
  @Min(MIN_P)
  @Max(MAX_P)
  q15?: number;
}

