import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';

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
}
