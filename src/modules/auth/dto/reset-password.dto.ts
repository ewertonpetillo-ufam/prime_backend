import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token de redefinição de senha recebido por email',
  })
  token: string;

  @ApiProperty({
    description: 'Nova senha do usuário',
  })
  new_password: string;

  @ApiProperty({
    description: 'Confirmação da nova senha',
  })
  confirm_password: string;
}

