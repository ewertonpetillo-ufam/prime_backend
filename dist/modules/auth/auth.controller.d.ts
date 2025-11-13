import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UserLoginDto } from './dto/user-login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        token_type: string;
        expires_in: number;
        client_id: string;
    }>;
    userLogin(userLoginDto: UserLoginDto): Promise<{
        access_token: string;
        token_type: string;
        expires_in: number;
        user: {
            id: string;
            email: string;
            full_name: string;
            role: import("../../entities/user.entity").UserRole;
        };
    }>;
}
