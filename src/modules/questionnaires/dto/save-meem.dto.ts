import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsUUID, IsOptional, IsInt, Min, Max } from 'class-validator';

const BIN_MIN = 0;
const BIN_MAX = 1;

export class SaveMeemDto {
  @ApiProperty({
    description: 'Identificador do questionário',
    format: 'uuid',
  })
  @IsUUID()
  questionnaireId: string;

  // Orientação
  @ApiPropertyOptional({ description: 'Dia da semana', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  orientation_day?: number;

  @ApiPropertyOptional({ description: 'Dia do mês', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  orientation_date?: number;

  @ApiPropertyOptional({ description: 'Mês', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  orientation_month?: number;

  @ApiPropertyOptional({ description: 'Ano', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  orientation_year?: number;

  @ApiPropertyOptional({ description: 'Hora aproximada', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  orientation_time?: number;

  @ApiPropertyOptional({ description: 'Local específico', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  orientation_location?: number;

  @ApiPropertyOptional({ description: 'Instituição', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  orientation_institution?: number;

  @ApiPropertyOptional({ description: 'Cidade', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  orientation_city?: number;

  @ApiPropertyOptional({ description: 'Estado', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  orientation_state?: number;

  @ApiPropertyOptional({ description: 'País', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  orientation_country?: number;

  // Memória imediata
  @ApiPropertyOptional({ description: 'Memória imediata - palavra 1', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  registration_word1?: number;

  @ApiPropertyOptional({ description: 'Memória imediata - palavra 2', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  registration_word2?: number;

  @ApiPropertyOptional({ description: 'Memória imediata - palavra 3', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  registration_word3?: number;

  // Atenção e cálculo
  @ApiPropertyOptional({ description: 'Atenção - resposta 1', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  attention_calc1?: number;

  @ApiPropertyOptional({ description: 'Atenção - resposta 2', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  attention_calc2?: number;

  @ApiPropertyOptional({ description: 'Atenção - resposta 3', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  attention_calc3?: number;

  @ApiPropertyOptional({ description: 'Atenção - resposta 4', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  attention_calc4?: number;

  @ApiPropertyOptional({ description: 'Atenção - resposta 5', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  attention_calc5?: number;

  // Evocação
  @ApiPropertyOptional({ description: 'Evocação - palavra 1', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  recall_word1?: number;

  @ApiPropertyOptional({ description: 'Evocação - palavra 2', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  recall_word2?: number;

  @ApiPropertyOptional({ description: 'Evocação - palavra 3', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  recall_word3?: number;

  // Linguagem
  @ApiPropertyOptional({ description: 'Nomear relógio', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  language_naming1?: number;

  @ApiPropertyOptional({ description: 'Nomear caneta', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  language_naming2?: number;

  @ApiPropertyOptional({ description: 'Repetir frase', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  language_repetition?: number;

  @ApiPropertyOptional({ description: 'Comando 1', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  language_command1?: number;

  @ApiPropertyOptional({ description: 'Comando 2', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  language_command2?: number;

  @ApiPropertyOptional({ description: 'Comando 3', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  language_command3?: number;

  @ApiPropertyOptional({ description: 'Ler e obedecer', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  language_reading?: number;

  @ApiPropertyOptional({ description: 'Escrever uma frase', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  language_writing?: number;

  @ApiPropertyOptional({ description: 'Copiar desenho', minimum: BIN_MIN, maximum: BIN_MAX })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(BIN_MIN)
  @Max(BIN_MAX)
  language_copying?: number;
}

