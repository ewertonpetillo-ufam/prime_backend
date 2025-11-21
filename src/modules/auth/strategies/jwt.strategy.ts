import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  client_id?: string;
  sub?: string; // User ID for user login
  email?: string;
  role?: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // For user login tokens, sub (user ID) is required
    if (payload.sub) {
      return {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        client_id: payload.client_id,
      };
    }

    // For client credentials tokens, client_id is required
    if (payload.client_id) {
      return {
        client_id: payload.client_id,
      };
    }

    throw new UnauthorizedException('Invalid token');
  }
}
