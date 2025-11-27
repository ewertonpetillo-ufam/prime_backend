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
  ValidateIf,
} from 'class-validator';

export class SaveStep1Dto {
  @ApiProperty({
    description: 'CPF of the patient (11 digits)',
    example: '12345678900',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{11}$/, { message: 'CPF must contain exactly 11 digits' })
  cpf: string;

  @ApiProperty({ description: 'Full name', example: 'Maria Santos' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({ description: 'Date of birth', example: '1950-05-15' })
  @IsDateString()
  @IsNotEmpty()
  birthday: string;

  @ApiPropertyOptional({ description: 'Age', example: '73' })
  @IsString()
  @IsOptional()
  age?: string;

  @ApiPropertyOptional({ description: 'Gender (M, F, Outro)', example: 'F' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ description: 'Ethnicity', example: 'Branco' })
  @IsString()
  @IsOptional()
  etnia?: string;

  @ApiPropertyOptional({ description: 'Nationality', example: 'Brasileiro' })
  @IsString()
  @IsOptional()
  nationality?: string;

  @ApiPropertyOptional({ description: 'Education level', example: 'Ensino Superior Completo' })
  @IsString()
  @IsOptional()
  education?: string;

  @ApiPropertyOptional({ description: 'Other education', example: 'Curso técnico' })
  @IsString()
  @IsOptional()
  educationOther?: string;

  @ApiPropertyOptional({ description: 'Marital status', example: 'Casado' })
  @IsString()
  @IsOptional()
  maritalStatus?: string;

  @ApiPropertyOptional({ description: 'Occupation', example: 'Médico' })
  @IsString()
  @IsOptional()
  occupation?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '(11) 98765-4321' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Contact phone number', example: '(11) 91234-5678' })
  @IsString()
  @IsOptional()
  phoneNumberContact?: string;

  @ApiPropertyOptional({ description: 'Email (opcional)', example: 'maria@email.com' })
  @IsOptional()
  @ValidateIf((o) => o.email !== undefined && o.email !== null && o.email !== '')
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  email?: string;

  @ApiPropertyOptional({ description: 'Is current smoker', example: 'Sim' })
  @IsString()
  @IsOptional()
  fumaCase?: string | boolean;

  @ApiPropertyOptional({ description: 'Smoked before', example: 'Sim' })
  @IsString()
  @IsOptional()
  fumouAntes?: string | boolean;

  @ApiPropertyOptional({ description: 'Smoking duration', example: '10 anos' })
  @IsString()
  @IsOptional()
  smokingDuration?: string;

  @ApiPropertyOptional({ description: 'Stopped smoking duration', example: '2 anos' })
  @IsString()
  @IsOptional()
  stoppedSmokingDuration?: string;

  @ApiProperty({ description: 'Collection date', example: '2024-01-15' })
  @IsDateString()
  @IsNotEmpty()
  dataColeta: string;

  @ApiPropertyOptional({ description: 'Evaluator name', example: 'Dr. João Silva' })
  @IsString()
  @IsOptional()
  nomeAvaliador?: string;

  @ApiPropertyOptional({ description: 'Family income', example: 'ate_1_salario' })
  @IsString()
  @IsOptional()
  rendaFamiliar?: string;

  @ApiPropertyOptional({ description: 'Visual deficiency', example: 'Não' })
  @IsString()
  @IsOptional()
  deficienciaVisual?: string;

  @ApiPropertyOptional({ description: 'Hoarseness', example: 'Não' })
  @IsString()
  @IsOptional()
  rouquidao?: string;

  @ApiPropertyOptional({ description: 'Stuttering', example: 'Não' })
  @IsString()
  @IsOptional()
  gagueja?: string;

  @ApiPropertyOptional({ description: 'Existing questionnaire ID (if editing)', example: 'uuid' })
  @IsString()
  @IsOptional()
  questionnaireId?: string;
}

