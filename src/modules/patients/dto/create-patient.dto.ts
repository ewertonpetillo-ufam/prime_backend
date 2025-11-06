import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  IsDateString,
  IsInt,
  IsBoolean,
  MaxLength,
  Matches,
  Length,
} from 'class-validator';

/**
 * DTO for creating a new patient.
 * 
 * Note: The following fields have been removed and should not be sent:
 * - city (removed)
 * - state (removed)  
 * - phone (replaced by phone_primary and phone_secondary)
 * 
 * New fields available:
 * - phone_primary (replaces phone)
 * - phone_secondary (new optional field)
 * - nationality (new field)
 * - occupation (new field)
 * - education_other (new field)
 * - is_current_smoker (new field)
 * - smoking_duration_years (new field)
 * - years_since_quit_smoking (new field)
 * - active (new field for soft delete)
 */
export class CreatePatientDto {
  @ApiProperty({
    description: 'CPF of the patient (11 digits, will be hashed with HMAC-SHA256 for storage)',
    example: '12345678900',
    minLength: 11,
    maxLength: 11,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{11}$/, { message: 'CPF must contain exactly 11 digits' })
  cpf: string;

  @ApiProperty({
    description: 'Full name of the patient',
    example: 'Maria Santos',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  full_name: string;

  @ApiProperty({
    description: 'Date of birth',
    example: '1950-05-15',
  })
  @IsDateString()
  @IsNotEmpty()
  date_of_birth: string;

  @ApiProperty({
    description: 'Gender type ID (reference to gender_types table)',
    example: 1,
    required: false,
    type: Number,
  })
  @IsInt()
  @IsOptional()
  gender_id?: number;

  @ApiProperty({
    description: 'Ethnicity type ID (reference to ethnicity_types table)',
    example: 1,
    required: false,
    type: Number,
  })
  @IsInt()
  @IsOptional()
  ethnicity_id?: number;

  @ApiProperty({
    description: 'Education level ID (reference to education_levels table)',
    example: 1,
    required: false,
    type: Number,
  })
  @IsInt()
  @IsOptional()
  education_level_id?: number;

  @ApiProperty({
    description: 'Marital status type ID (reference to marital_status_types table)',
    example: 1,
    required: false,
    type: Number,
  })
  @IsInt()
  @IsOptional()
  marital_status_id?: number;

  @ApiProperty({
    description: 'Income range ID (reference to income_ranges table)',
    example: 1,
    required: false,
    type: Number,
  })
  @IsInt()
  @IsOptional()
  income_range_id?: number;

  @ApiProperty({
    description: 'Nationality of the patient',
    example: 'Brasileiro',
    required: false,
    default: 'Brasileiro',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nationality?: string;

  @ApiProperty({
    description: 'Primary phone number (replaces old "phone" field)',
    example: '(11) 98765-4321',
    required: false,
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone_primary?: string;

  @ApiProperty({
    description: 'Secondary phone number (optional)',
    example: '(11) 91234-5678',
    required: false,
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone_secondary?: string;

  @ApiProperty({
    description: 'Email address',
    example: 'maria.santos@email.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @ApiProperty({
    description: 'Occupation',
    example: 'Médico',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  occupation?: string;

  @ApiProperty({
    description: 'Other education information',
    example: 'Curso técnico em enfermagem',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  education_other?: string;

  @ApiProperty({
    description: 'Is the patient currently a smoker',
    example: false,
    required: false,
    default: false,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  is_current_smoker?: boolean;

  @ApiProperty({
    description: 'Smoking duration in years (only if is_current_smoker is true)',
    example: 10,
    required: false,
    type: Number,
    minimum: 0,
  })
  @IsInt()
  @IsOptional()
  smoking_duration_years?: number;

  @ApiProperty({
    description: 'Years since quit smoking (only if is_current_smoker is false)',
    example: 5,
    required: false,
    type: Number,
    minimum: 0,
  })
  @IsInt()
  @IsOptional()
  years_since_quit_smoking?: number;

  @ApiProperty({
    description: 'Patient active status (soft delete flag)',
    example: true,
    required: false,
    default: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
