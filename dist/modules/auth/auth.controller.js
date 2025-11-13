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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const user_login_dto_1 = require("./dto/user-login.dto");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async login(loginDto) {
        return this.authService.login(loginDto);
    }
    async userLogin(userLoginDto) {
        return this.authService.userLogin(userLoginDto);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Authenticate with client credentials',
        description: 'Authenticate using client_id and client_secret to obtain a JWT access token. ' +
            'Two clients are available: collection_app (mobile app) and web_frontend (web interface).',
    }),
    (0, swagger_1.ApiBody)({ type: login_dto_1.LoginDto }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Invalid request payload',
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Invalid client credentials',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('user-login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Authenticate user with email and password',
        description: 'Authenticate a user using email and password to obtain a JWT access token. ' +
            'This endpoint is used for frontend and application user authentication.',
    }),
    (0, swagger_1.ApiBody)({ type: user_login_dto_1.UserLoginDto }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Invalid request payload',
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Invalid email or password, or user account is inactive',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_login_dto_1.UserLoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "userLogin", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map