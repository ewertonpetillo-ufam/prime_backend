import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class SaveRbdsqDto {
  @ApiProperty({
    description: 'Identificador do questionário',
    format: 'uuid',
  })
  @IsUUID()
  questionnaireId: string;

  @ApiPropertyOptional({ description: 'Q1 - Sonhos vívidos' })
  @IsOptional()
  @IsBoolean()
  q1_vivid_dreams?: boolean;

  @ApiPropertyOptional({ description: 'Q2 - Conteúdo agressivo' })
  @IsOptional()
  @IsBoolean()
  q2_aggressive_content?: boolean;

  @ApiPropertyOptional({ description: 'Q3 - Encenar sonhos' })
  @IsOptional()
  @IsBoolean()
  q3_dream_enactment?: boolean;

  @ApiPropertyOptional({ description: 'Q4 - Movimentos de membros' })
  @IsOptional()
  @IsBoolean()
  q4_limb_movements?: boolean;

  @ApiPropertyOptional({ description: 'Q5 - Potencial de lesão' })
  @IsOptional()
  @IsBoolean()
  q5_injury_potential?: boolean;

  @ApiPropertyOptional({ description: 'Q6 - Desorganização da cama' })
  @IsOptional()
  @IsBoolean()
  q6_bed_disruption?: boolean;

  @ApiPropertyOptional({ description: 'Q7 - Recordação do despertar' })
  @IsOptional()
  @IsBoolean()
  q7_awakening_recall?: boolean;

  @ApiPropertyOptional({ description: 'Q8 - Perturbação do sono' })
  @IsOptional()
  @IsBoolean()
  q8_sleep_disruption?: boolean;

  @ApiPropertyOptional({ description: 'Q9 - Distúrbio neurológico' })
  @IsOptional()
  @IsBoolean()
  q9_neurological_disorder?: boolean;

  @ApiPropertyOptional({ description: 'Q10 - Problemas prévios de comportamento REM' })
  @IsOptional()
  @IsBoolean()
  q10_rem_behavior_problem?: boolean;
}

