import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private jwtService;
    private configService;
    constructor(jwtService: JwtService, configService: ConfigService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        token_type: string;
        expires_in: number;
        client_id: string;
    }>;
    private validateClientCredentials;
    private getTokenExpirationInSeconds;
}
