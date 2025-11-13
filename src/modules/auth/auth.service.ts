import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
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

  async userLogin(userLoginDto: UserLoginDto) {
    const { email, password } = userLoginDto;

    // Find user by email
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is active
    if (!user.active) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Verify password
    // Remove any prefix like $wp$ that might be added by other systems
    let passwordHash = user.password_hash;
    if (passwordHash.startsWith('$wp$')) {
      // Remove $wp prefix and restore the $ for bcrypt format
      passwordHash = '$' + passwordHash.substring(3);
    }

    const isPasswordValid = await bcrypt.compare(password, passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT token with user information
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      client_id: 'web_frontend', // Indicate this is a user login
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: this.getTokenExpirationInSeconds(),
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    };
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
