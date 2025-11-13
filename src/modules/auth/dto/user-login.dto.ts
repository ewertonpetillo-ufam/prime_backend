import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class UserLoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'joao.silva@hospital.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'senha123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

