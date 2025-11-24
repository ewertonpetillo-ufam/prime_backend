import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsString, IsIn, IsOptional, MaxLength } from 'class-validator';

export class UploadPdfReportDto {
  @ApiProperty({
    description: 'Identificador do questionário relacionado ao relatório',
    format: 'uuid',
  })
  @IsUUID()
  questionnaireId: string;

  @ApiProperty({
    description: 'Tipo do relatório PDF',
    enum: ['BIOBIT', 'DELSYS', 'POLYSOMNOGRAPHY', 'OTHER'],
  })
  @IsString()
  @IsIn(['BIOBIT', 'DELSYS', 'POLYSOMNOGRAPHY', 'OTHER'])
  reportType: 'BIOBIT' | 'DELSYS' | 'POLYSOMNOGRAPHY' | 'OTHER';

  @ApiPropertyOptional({
    description: 'Observações adicionais',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

