import { PartialType, OmitType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatePatientDto } from './create-patient.dto';
import { IsString, IsOptional, Matches } from 'class-validator';

// Allow CPF update only if it's missing (for existing patients)
export class UpdatePatientDto extends PartialType(
  OmitType(CreatePatientDto, ['cpf'] as const),
) {
  @ApiPropertyOptional({
    description: 'CPF of the patient (11 digits). Only updated if current CPF is null/empty.',
    example: '12345678900',
    minLength: 11,
    maxLength: 11,
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d{11}$/, { message: 'CPF must contain exactly 11 digits' })
  cpf?: string;
}
