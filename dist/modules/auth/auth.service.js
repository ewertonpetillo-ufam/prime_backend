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
let AuthService = class AuthService {
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
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
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map