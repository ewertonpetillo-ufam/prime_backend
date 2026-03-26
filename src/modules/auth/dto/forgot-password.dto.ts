import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'usuario@icomp.ufam.edu.br',
    description: 'Email do usuário que deseja redefinir a senha',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

