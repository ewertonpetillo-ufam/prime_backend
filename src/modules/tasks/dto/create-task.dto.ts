import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsInt,
  IsBoolean,
  IsEnum,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { TaskCategory } from '../../../entities/active-task-definition.entity';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Unique task code identifier',
    example: 'TA1',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  task_code: string;

  @ApiProperty({
    description: 'Task name',
    example: 'Mãos em repouso',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  task_name: string;

  @ApiPropertyOptional({
    description: 'Task category',
    enum: TaskCategory,
    example: TaskCategory.MOTOR,
  })
  @IsEnum(TaskCategory)
  @IsOptional()
  task_category?: TaskCategory;

  @ApiPropertyOptional({
    description: 'Collection form type ID (reference to collection_form_types table)',
    example: 1,
    type: Number,
  })
  @IsInt()
  @IsOptional()
  collection_form_type_id?: number;

  @ApiPropertyOptional({
    description: 'Stage number (1-3)',
    example: 1,
    type: Number,
    minimum: 1,
    maximum: 3,
  })
  @IsInt()
  @Min(1)
  @Max(3)
  @IsOptional()
  stage?: number;

  @ApiPropertyOptional({
    description: 'Task description',
    example: 'Avaliação de tremor de repouso nas mãos...',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Task instructions for the patient',
    example: 'Posicione-se sentado confortavelmente...',
  })
  @IsString()
  @IsOptional()
  instructions?: string;

  @ApiPropertyOptional({
    description: 'Active status',
    example: true,
    default: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

