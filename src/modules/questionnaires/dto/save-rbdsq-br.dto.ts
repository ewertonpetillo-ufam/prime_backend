import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class SaveRbdsqBrDto {
  @ApiProperty({
    description: 'Identificador do questionário',
    format: 'uuid',
  })
  @IsUUID()
  questionnaireId: string;

  @ApiPropertyOptional({ description: 'Q1 - Sonhos que parecem reais' })
  @IsOptional()
  @IsBoolean()
  q1_realistic_dreams?: boolean;

  @ApiPropertyOptional({ description: 'Q2 - Sonhos com conteúdo agressivo ou muita ação' })
  @IsOptional()
  @IsBoolean()
  q2_aggressive_dreams?: boolean;

  @ApiPropertyOptional({ description: 'Q3 - Comportamentos que refletem os sonhos' })
  @IsOptional()
  @IsBoolean()
  q3_dream_enactment?: boolean;

  @ApiPropertyOptional({ description: 'Q4 - Movimentos de braços e pernas durante o sono' })
  @IsOptional()
  @IsBoolean()
  q4_limb_movements?: boolean;

  @ApiPropertyOptional({ description: 'Q5 - (Quase) se machucou ou (quase) machucou o parceiro durante o sono' })
  @IsOptional()
  @IsBoolean()
  q5_injury_potential?: boolean;

  @ApiPropertyOptional({ description: 'Q6.1 - Falar, gritar, xingar, rir alto' })
  @IsOptional()
  @IsBoolean()
  q6_1_vocalizations?: boolean;

  @ApiPropertyOptional({ description: 'Q6.2 - Movimentar bruscamente os membros, “lutar”' })
  @IsOptional()
  @IsBoolean()
  q6_2_fighting_movements?: boolean;

  @ApiPropertyOptional({ description: 'Q6.3 - Movimentos complexos sem sentido ou quedas da cama' })
  @IsOptional()
  @IsBoolean()
  q6_3_complex_movements_or_falls?: boolean;

  @ApiPropertyOptional({ description: 'Q6.4 - Derrubar objetos ao redor da cama' })
  @IsOptional()
  @IsBoolean()
  q6_4_objects_falling?: boolean;

  @ApiPropertyOptional({ description: 'Q7 - Movimentos que acordam o paciente' })
  @IsOptional()
  @IsBoolean()
  q7_movements_cause_awakenings?: boolean;

  @ApiPropertyOptional({ description: 'Q8 - Recordação vívida dos sonhos' })
  @IsOptional()
  @IsBoolean()
  q8_dream_recall?: boolean;

  @ApiPropertyOptional({ description: 'Q9 - Sono frequentemente agitado ou perturbado' })
  @IsOptional()
  @IsBoolean()
  q9_disturbed_sleep?: boolean;

  @ApiPropertyOptional({ description: 'Q10 - Presença de doença neurológica' })
  @IsOptional()
  @IsBoolean()
  q10_neurological_disease?: boolean;

  @ApiPropertyOptional({
    description: 'Descrição da doença neurológica (campo livre correspondente a “Qual doença?”)',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  neuroDiseaseDescription?: string;
}

