import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsInt, Min, Max, IsOptional } from 'class-validator';

const MIN_P = 0;
const MAX_P = 4;

export class SaveFogqDto {
  @ApiProperty({
    description: 'Identificador do questionário',
    format: 'uuid',
  })
  @IsUUID()
  questionnaireId: string;

  @ApiPropertyOptional({ description: 'Gait worst state', minimum: MIN_P, maximum: MAX_P })
  @IsOptional()
  @IsInt()
  @Min(MIN_P)
  @Max(MAX_P)
  gait_worst_state?: number;

  @ApiPropertyOptional({ description: 'Impact daily activities', minimum: MIN_P, maximum: MAX_P })
  @IsOptional()
  @IsInt()
  @Min(MIN_P)
  @Max(MAX_P)
  impact_daily_activities?: number;

  @ApiPropertyOptional({ description: 'Feet stuck', minimum: MIN_P, maximum: MAX_P })
  @IsOptional()
  @IsInt()
  @Min(MIN_P)
  @Max(MAX_P)
  feet_stuck?: number;

  @ApiPropertyOptional({ description: 'Longest episode', minimum: MIN_P, maximum: MAX_P })
  @IsOptional()
  @IsInt()
  @Min(MIN_P)
  @Max(MAX_P)
  longest_episode?: number;

  @ApiPropertyOptional({ description: 'Hesitation initiation', minimum: MIN_P, maximum: MAX_P })
  @IsOptional()
  @IsInt()
  @Min(MIN_P)
  @Max(MAX_P)
  hesitation_initiation?: number;

  @ApiPropertyOptional({ description: 'Hesitation turning', minimum: MIN_P, maximum: MAX_P })
  @IsOptional()
  @IsInt()
  @Min(MIN_P)
  @Max(MAX_P)
  hesitation_turning?: number;
}

