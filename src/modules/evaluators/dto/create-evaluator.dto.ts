import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateEvaluatorDto {
  @ApiProperty({
    description: 'Full name of the evaluator',
    example: 'Dr. João Silva',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  full_name: string;

  @ApiProperty({
    description: 'Professional registration number',
    example: 'CRM-123456',
    required: false,
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  registration_number?: string;

  @ApiProperty({
    description: 'Medical specialty',
    example: 'Neurologist',
    required: false,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  specialty?: string;

  @ApiProperty({
    description: 'Email address',
    example: 'joao.silva@hospital.com',
    required: false,
    maxLength: 255,
  })
  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @ApiProperty({
    description: 'Phone number',
    example: '(11) 98765-4321',
    required: false,
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({
    description: 'Password hash (will be generated if not provided)',
    example: 'hashed_password_here',
    required: false,
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  password_hash?: string;
}
