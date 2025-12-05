import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    userLogin: jest.fn(),
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('deve chamar authService.login e retornar resultado', async () => {
      const loginDto: LoginDto = {
        client_id: 'web_frontend',
        client_secret: 'secret123',
      };

      const expectedResult = {
        access_token: 'token',
        token_type: 'Bearer',
        expires_in: 86400,
        client_id: 'web_frontend',
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('userLogin', () => {
    it('deve chamar authService.userLogin e retornar resultado', async () => {
      const userLoginDto: UserLoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResult = {
        access_token: 'token',
        token_type: 'Bearer',
        expires_in: 86400,
        user: {
          id: 'user-id',
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'evaluator',
          first_login: false,
        },
      };

      mockAuthService.userLogin.mockResolvedValue(expectedResult);

      const result = await controller.userLogin(userLoginDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.userLogin).toHaveBeenCalledWith(userLoginDto);
    });
  });

  describe('changePassword', () => {
    it('deve chamar authService.changePassword com userId do usuário atual', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'old-password',
        newPassword: 'new-password123',
      };

      const currentUser = { userId: 'user-id' };
      const expectedResult = {
        success: true,
        message: 'Password changed successfully',
      };

      mockAuthService.changePassword.mockResolvedValue(expectedResult);

      const result = await controller.changePassword(
        currentUser,
        changePasswordDto,
      );

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.changePassword).toHaveBeenCalledWith(
        'user-id',
        changePasswordDto,
      );
    });
  });
});

