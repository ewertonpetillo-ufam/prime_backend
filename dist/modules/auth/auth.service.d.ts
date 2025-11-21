import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private jwtService;
    private configService;
    private usersService;
    constructor(jwtService: JwtService, configService: ConfigService, usersService: UsersService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        token_type: string;
        expires_in: number;
        client_id: string;
    }>;
    private validateClientCredentials;
    userLogin(userLoginDto: UserLoginDto): Promise<{
        access_token: string;
        token_type: string;
        expires_in: number;
        user: {
            id: string;
            email: string;
            full_name: string;
            role: import("../../entities/user.entity").UserRole;
            first_login: boolean;
        };
    }>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    private getTokenExpirationInSeconds;
}
