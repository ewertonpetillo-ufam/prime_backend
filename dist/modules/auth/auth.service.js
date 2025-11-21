"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    constructor(jwtService, configService, usersService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.usersService = usersService;
    }
    async login(loginDto) {
        const { client_id, client_secret } = loginDto;
        const isValid = this.validateClientCredentials(client_id, client_secret);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid client credentials');
        }
        const payload = { client_id };
        const access_token = this.jwtService.sign(payload);
        return {
            access_token,
            token_type: 'Bearer',
            expires_in: this.getTokenExpirationInSeconds(),
            client_id,
        };
    }
    validateClientCredentials(client_id, client_secret) {
        const validCredentials = {
            collection_app: this.configService.get('CLIENT_1_SECRET'),
            web_frontend: this.configService.get('CLIENT_2_SECRET'),
        };
        return validCredentials[client_id] === client_secret;
    }
    async userLogin(userLoginDto) {
        const { email, password } = userLoginDto;
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (!user.active) {
            throw new common_1.UnauthorizedException('User account is inactive');
        }
        let passwordHash = user.password_hash;
        if (passwordHash.startsWith('$wp$')) {
            passwordHash = '$' + passwordHash.substring(3);
        }
        const isPasswordValid = await bcrypt.compare(password, passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            client_id: 'web_frontend',
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
                first_login: user.first_login,
            },
        };
    }
    async changePassword(userId, changePasswordDto) {
        const { currentPassword, newPassword } = changePasswordDto;
        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        let passwordHash = user.password_hash;
        if (passwordHash.startsWith('$wp$')) {
            passwordHash = '$' + passwordHash.substring(3);
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const saltRounds = 10;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
        await this.usersService.updatePassword(userId, newPasswordHash, false);
        return {
            success: true,
            message: 'Password changed successfully',
        };
    }
    getTokenExpirationInSeconds() {
        const expiration = this.configService.get('JWT_EXPIRATION');
        if (expiration.endsWith('h')) {
            return parseInt(expiration) * 3600;
        }
        else if (expiration.endsWith('d')) {
            return parseInt(expiration) * 86400;
        }
        else if (expiration.endsWith('s')) {
            return parseInt(expiration);
        }
        return 86400;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        users_service_1.UsersService])
], AuthService);
//# sourceMappingURL=auth.service.js.map