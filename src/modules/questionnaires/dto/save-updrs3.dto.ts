import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsUUID, IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';

const SCORE_MIN = 0;
const SCORE_MAX = 4;

export class SaveUpdrs3Dto {
  @ApiProperty({
    description: 'Identificador do questionário ao qual o protocolo pertence',
    format: 'uuid',
  })
  @IsUUID()
  questionnaireId: string;

  @ApiPropertyOptional({ description: '3.1 - Fala', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  speech?: number;

  @ApiPropertyOptional({ description: '3.2 - Expressão facial', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  facial_expression?: number;

  @ApiPropertyOptional({ description: '3.3 - Rigidez (Pescoço)', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  rigidity_neck?: number;

  @ApiPropertyOptional({ description: '3.3 - Rigidez (MS Direito)', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  rigidity_rue?: number;

  @ApiPropertyOptional({ description: '3.3 - Rigidez (MS Esquerdo)', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  rigidity_lue?: number;

  @ApiPropertyOptional({ description: '3.3 - Rigidez (MI Direito)', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  rigidity_rle?: number;

  @ApiPropertyOptional({ description: '3.3 - Rigidez (MI Esquerdo)', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  rigidity_lle?: number;

  @ApiPropertyOptional({ description: '3.4 - Bater dos dedos das mãos (Direita)', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  finger_tapping_right?: number;

  @ApiPropertyOptional({ description: '3.4 - Bater dos dedos das mãos (Esquerda)', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  finger_tapping_left?: number;

  @ApiPropertyOptional({ description: '3.5 - Movimentos das mãos (Direita)', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  hand_movements_right?: number;

  @ApiPropertyOptional({ description: '3.5 - Movimentos das mãos (Esquerda)', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  hand_movements_left?: number;

  @ApiPropertyOptional({ description: '3.6 - Pronação/supinação (Direita)', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  pronation_supination_right?: number;

  @ApiPropertyOptional({ description: '3.6 - Pronação/supinação (Esquerda)', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  pronation_supination_left?: number;

  @ApiPropertyOptional({ description: '3.7 - Bater dos dedos dos pés (Direito)', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  toe_tapping_right?: number;

  @ApiPropertyOptional({ description: '3.7 - Bater dos dedos dos pés (Esquerdo)', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  toe_tapping_left?: number;

  @ApiPropertyOptional({ description: '3.8 - Agilidade das pernas (Direita)', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  leg_agility_right?: number;

  @ApiPropertyOptional({ description: '3.8 - Agilidade das pernas (Esquerda)', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  leg_agility_left?: number;

  @ApiPropertyOptional({ description: '3.9 - Levantar-se da cadeira', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  rising_from_chair?: number;

  @ApiPropertyOptional({ description: '3.10 - Marcha', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  gait?: number;

  @ApiPropertyOptional({ description: '3.11 - Freezing de marcha', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  freezing_of_gait?: number;

  @ApiPropertyOptional({ description: '3.12 - Estabilidade postural', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  postural_stability?: number;

  @ApiPropertyOptional({ description: '3.13 - Postura', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  posture?: number;

  @ApiPropertyOptional({ description: '3.14 - Bradicinesia global', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  global_bradykinesia?: number;

  @ApiPropertyOptional({ description: '3.15 - Tremor postural (Direita)', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  postural_tremor_right?: number;

  @ApiPropertyOptional({ description: '3.15 - Tremor postural (Esquerda)', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  postural_tremor_left?: number;

  @ApiPropertyOptional({ description: '3.16 - Tremor cinético (Direita)', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  kinetic_tremor_right?: number;

  @ApiPropertyOptional({ description: '3.16 - Tremor cinético (Esquerda)', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  kinetic_tremor_left?: number;

  @ApiPropertyOptional({ description: '3.17 - Tremor de repouso (MS Direito)', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  rest_tremor_rue?: number;

  @ApiPropertyOptional({ description: '3.17 - Tremor de repouso (MS Esquerdo)', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  rest_tremor_lue?: number;

  @ApiPropertyOptional({ description: '3.17 - Tremor de repouso (MI Direito)', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  rest_tremor_rle?: number;

  @ApiPropertyOptional({ description: '3.17 - Tremor de repouso (MI Esquerdo)', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  rest_tremor_lle?: number;

  @ApiPropertyOptional({ description: '3.17 - Tremor de repouso (Lábios/Mandíbula)', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  rest_tremor_lip_jaw?: number;

  @ApiPropertyOptional({ description: '3.18 - Persistência do tremor de repouso', minimum: SCORE_MIN, maximum: SCORE_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  postural_tremor_amplitude?: number;

  @ApiPropertyOptional({ description: 'Discinesias presentes durante a avaliação' })
  @IsOptional()
  @IsBoolean()
  dyskinesia_present?: boolean;

  @ApiPropertyOptional({ description: 'Discinesias interferiram nas pontuações' })
  @IsOptional()
  @IsBoolean()
  dyskinesia_interfered?: boolean;
}

