import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  Min,
} from 'class-validator';

export class SaveStep2Dto {
  @ApiProperty({
    description: 'Questionnaire ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  questionnaireId: string;

  @ApiPropertyOptional({ description: 'Weight in kg', example: 70.5 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ description: 'Height in cm', example: 170 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  height?: number;

  @ApiPropertyOptional({ description: 'Waist size in cm', example: 92 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  waistSize?: number;

  @ApiPropertyOptional({ description: 'Hip size in cm', example: 104 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  hipSize?: number;

  @ApiPropertyOptional({ description: 'Abdominal circumference in cm', example: 98 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  abdominal?: number;
}

