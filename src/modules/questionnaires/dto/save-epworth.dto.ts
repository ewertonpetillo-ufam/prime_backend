import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsInt, Min, Max } from 'class-validator';

export class SaveEpworthDto {
  @ApiProperty({
    description: 'Identificador do questionário',
    format: 'uuid',
  })
  @IsUUID()
  questionnaireId: string;

  @ApiPropertyOptional({ description: 'Sentado e lendo', minimum: 0, maximum: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3)
  sitting_reading?: number;

  @ApiPropertyOptional({ description: 'Assistindo TV', minimum: 0, maximum: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3)
  watching_tv?: number;

  @ApiPropertyOptional({ description: 'Sentado inativo em público', minimum: 0, maximum: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3)
  sitting_inactive_public?: number;

  @ApiPropertyOptional({ description: 'Passageiro em carro por 1h', minimum: 0, maximum: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3)
  passenger_car?: number;

  @ApiPropertyOptional({ description: 'Deitado à tarde', minimum: 0, maximum: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3)
  lying_down_afternoon?: number;

  @ApiPropertyOptional({ description: 'Sentado conversando', minimum: 0, maximum: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3)
  sitting_talking?: number;

  @ApiPropertyOptional({ description: 'Sentado após o almoço', minimum: 0, maximum: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3)
  sitting_after_lunch?: number;

  @ApiPropertyOptional({ description: 'Carro parado no trânsito', minimum: 0, maximum: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3)
  car_stopped_traffic?: number;
}

