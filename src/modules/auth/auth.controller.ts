import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate with client credentials',
    description:
      'Authenticate using client_id and client_secret to obtain a JWT access token. ' +
      'Two clients are available: collection_app (mobile app) and web_frontend (web interface).',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        expires_in: 86400,
        client_id: 'web_frontend',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid request payload',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid client credentials',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('user-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate user with email and password',
    description:
      'Authenticate a user using email and password to obtain a JWT access token. ' +
      'This endpoint is used for frontend and application user authentication.',
  })
  @ApiBody({ type: UserLoginDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        expires_in: 86400,
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'joao.silva@hospital.com',
          full_name: 'Dr. João Silva',
          role: 'evaluator',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid request payload',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid email or password, or user account is inactive',
  })
  async userLogin(@Body() userLoginDto: UserLoginDto) {
    return this.authService.userLogin(userLoginDto);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Change user password',
    description: 'Change the password for the authenticated user. Requires current password verification.',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: {
      example: {
        success: true,
        message: 'Password changed successfully',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid request payload',
  })
  @ApiUnauthorizedResponse({
    description: 'Current password is incorrect or user not authenticated',
  })
  async changePassword(
    @CurrentUser() user: { userId: string },
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.userId, changePasswordDto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar redefinição de senha',
    description:
      'Envia um email com link de redefinição de senha para o usuário, caso o email esteja cadastrado.',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description:
      'Resposta genérica informando que, se o email existir, o usuário receberá instruções.',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    return this.authService.requestPasswordReset(email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Redefinir senha usando token',
    description:
      'Redefine a senha do usuário a partir de um token de redefinição válido enviado por email.',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Senha redefinida com sucesso',
  })
  @ApiBadRequestResponse({
    description: 'Token inválido ou expirado',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const { token, new_password, confirm_password } = resetPasswordDto;

    if (new_password !== confirm_password) {
      throw new Error('As senhas não conferem');
    }

    return this.authService.resetPassword(token, new_password);
  }
}
