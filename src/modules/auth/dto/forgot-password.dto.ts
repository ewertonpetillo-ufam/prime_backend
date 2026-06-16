import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'E-mail do usuário cadastrado',
    example: 'usuario@hospital.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
