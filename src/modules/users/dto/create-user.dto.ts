import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { UserRole } from '../../../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'Dr. João Silva',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  full_name: string;

  @ApiProperty({
    description: 'Email address (must be unique)',
    example: 'joao.silva@hospital.com',
    maxLength: 255,
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

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

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.EVALUATOR,
    default: UserRole.EVALUATOR,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

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
    description: 'Medical specialty or area of expertise',
    example: 'Neurologist',
    required: false,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  specialty?: string;

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
    description: 'Whether the user is active',
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({
    description: 'Whether this is the user\'s first login',
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  first_login?: boolean;

  @ApiProperty({
    description: 'Last login timestamp',
    example: '2025-01-15T10:30:00Z',
    required: false,
  })
  @IsOptional()
  last_login?: Date;
}

