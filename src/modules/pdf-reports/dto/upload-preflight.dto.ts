import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class PreflightFileItemDto {
  @ApiProperty({ example: 'emg-relatorio.pdf' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({ example: 134217728 })
  @IsInt()
  @Min(1)
  fileSizeBytes: number;
}

export class UploadPreflightDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  questionnaireId: string;

  @ApiProperty({ enum: ['BIOBIT', 'DELSYS', 'POLYSOMNOGRAPHY', 'OTHER'] })
  @IsIn(['BIOBIT', 'DELSYS', 'POLYSOMNOGRAPHY', 'OTHER'])
  reportType: 'BIOBIT' | 'DELSYS' | 'POLYSOMNOGRAPHY' | 'OTHER';

  @ApiProperty({ type: [PreflightFileItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PreflightFileItemDto)
  files: PreflightFileItemDto[];
}
