import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsUUID, IsOptional, IsInt, Min, Max } from 'class-validator';

const SCORE_MIN = 0;
const SCORE_MAX = 4;

export class SaveUdysrsDto {
  @ApiProperty({
    description: 'Identificador do questionário',
    format: 'uuid',
  })
  @IsUUID()
  questionnaireId: string;

  // Parte 1A
  @ApiPropertyOptional({ description: 'Tempo com discinesia em On (Parte 1A)', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  on_dyskinesia_time?: number;

  // Parte 1B
  @ApiPropertyOptional({ description: 'Impacto na fala', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  impact_speech?: number;

  @ApiPropertyOptional({ description: 'Impacto na mastigação/deglutição', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  impact_chewing?: number;

  @ApiPropertyOptional({ description: 'Impacto em tarefas para comer', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  impact_eating?: number;

  @ApiPropertyOptional({ description: 'Impacto em vestir-se', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  impact_dressing?: number;

  @ApiPropertyOptional({ description: 'Impacto em higiene', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  impact_hygiene?: number;

  @ApiPropertyOptional({ description: 'Impacto na escrita', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  impact_writing?: number;

  @ApiPropertyOptional({ description: 'Impacto em passatempos/atividades', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  impact_hobbies?: number;

  @ApiPropertyOptional({ description: 'Impacto na marcha/equilíbrio', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  impact_walking?: number;

  @ApiPropertyOptional({ description: 'Impacto em situações sociais', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  impact_social?: number;

  @ApiPropertyOptional({ description: 'Impacto em situações emocionais', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  impact_emotional?: number;

  // Parte 2A
  @ApiPropertyOptional({ description: 'Tempo com distonia em Off', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  off_dystonia_time?: number;

  // Parte 2B
  @ApiPropertyOptional({ description: 'Impacto das distonias nas atividades', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  dystonia_activities?: number;

  @ApiPropertyOptional({ description: 'Impacto da dor das distonias', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  dystonia_pain_impact?: number;

  @ApiPropertyOptional({ description: 'Intensidade da dor das distonias', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  dystonia_pain_severity?: number;

  // Parte 3
  @ApiPropertyOptional({ description: 'Intensidade na face', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  severity_face?: number;

  @ApiPropertyOptional({ description: 'Intensidade no pescoço', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  severity_neck?: number;

  @ApiPropertyOptional({ description: 'Intensidade braço/ombro direito', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  severity_right_arm?: number;

  @ApiPropertyOptional({ description: 'Intensidade braço/ombro esquerdo', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  severity_left_arm?: number;

  @ApiPropertyOptional({ description: 'Intensidade tronco', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  severity_trunk?: number;

  @ApiPropertyOptional({ description: 'Intensidade perna/coxa direita', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  severity_right_leg?: number;

  @ApiPropertyOptional({ description: 'Intensidade perna/coxa esquerda', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  severity_left_leg?: number;

  // Parte 4
  @ApiPropertyOptional({ description: 'Incapacidade - comunicação', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  disability_communication?: number;

  @ApiPropertyOptional({ description: 'Incapacidade - beber', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  disability_drinking?: number;

  @ApiPropertyOptional({ description: 'Incapacidade - vestir', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  disability_dressing?: number;

  @ApiPropertyOptional({ description: 'Incapacidade - marcha', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  disability_walking?: number;
}

