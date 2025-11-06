import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const { client_id, client_secret } = loginDto;

    // Validate client credentials
    const isValid = this.validateClientCredentials(client_id, client_secret);

    if (!isValid) {
      throw new UnauthorizedException('Invalid client credentials');
    }

    // Generate JWT token
    const payload = { client_id };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: this.getTokenExpirationInSeconds(),
      client_id,
    };
  }

  private validateClientCredentials(
    client_id: string,
    client_secret: string,
  ): boolean {
    const validCredentials = {
      collection_app: this.configService.get<string>('CLIENT_1_SECRET'),
      web_frontend: this.configService.get<string>('CLIENT_2_SECRET'),
    };

    return validCredentials[client_id] === client_secret;
  }

  private getTokenExpirationInSeconds(): number {
    const expiration = this.configService.get<string>('JWT_EXPIRATION');

    // Parse expiration string (e.g., "24h", "7d", "60s")
    if (expiration.endsWith('h')) {
      return parseInt(expiration) * 3600;
    } else if (expiration.endsWith('d')) {
      return parseInt(expiration) * 86400;
    } else if (expiration.endsWith('s')) {
      return parseInt(expiration);
    }

    // Default to 24 hours
    return 86400;
  }
}
