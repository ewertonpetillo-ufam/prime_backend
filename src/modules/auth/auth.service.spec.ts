import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { PasswordResetToken } from '../../entities/password-reset-token.entity';
import { LoginDto } from './dto/login.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User, UserRole } from '../../entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let usersService: UsersService;
  let mailService: MailService;

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    findOne: jest.fn(),
    updatePassword: jest.fn(),
    update: jest.fn(),
  };

  const mockMailService = {
    sendPasswordResetEmail: jest.fn(),
  };

  const mockPasswordResetTokenRepository = {
    update: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: getRepositoryToken(PasswordResetToken),
          useValue: mockPasswordResetTokenRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    usersService = module.get<UsersService>(UsersService);
    mailService = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('deve retornar token JWT para credenciais válidas', async () => {
      const loginDto: LoginDto = {
        client_id: 'web_frontend',
        client_secret: 'secret123',
      };

      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'CLIENT_2_SECRET') return 'secret123';
        if (key === 'JWT_EXPIRATION') return '24h';
      });

      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        token_type: 'Bearer',
        expires_in: 86400,
        client_id: 'web_frontend',
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        client_id: 'web_frontend',
      });
    });

    it('deve lançar UnauthorizedException para credenciais inválidas', async () => {
      const loginDto: LoginDto = {
        client_id: 'web_frontend',
        client_secret: 'wrong-secret',
      };

      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'CLIENT_2_SECRET') return 'secret123';
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid client credentials',
      );
    });

    it('deve funcionar com collection_app', async () => {
      const loginDto: LoginDto = {
        client_id: 'collection_app',
        client_secret: 'app-secret',
      };

      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'CLIENT_1_SECRET') return 'app-secret';
        if (key === 'JWT_EXPIRATION') return '24h';
      });

      mockJwtService.sign.mockReturnValue('mock-token');

      const result = await service.login(loginDto);

      expect(result.client_id).toBe('collection_app');
      expect(result.access_token).toBe('mock-token');
    });
  });

  describe('userLogin', () => {
    let mockUser: User;

    beforeEach(async () => {
      mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        password_hash: await bcrypt.hash('password123', 10),
        role: UserRole.EVALUATOR,
        active: true,
        first_login: false,
        registration_number: null,
        specialty: null,
        phone: null,
        last_login: null,
        created_at: new Date(),
        updated_at: new Date(),
        questionnaires: [],
      };
    });

    it('deve retornar token JWT para credenciais de usuário válidas', async () => {
      const userLoginDto: UserLoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockConfigService.get.mockReturnValue('24h');
      mockJwtService.sign.mockReturnValue('user-jwt-token');

      const result = await service.userLogin(userLoginDto);

      expect(result).toHaveProperty('access_token', 'user-jwt-token');
      expect(result).toHaveProperty('token_type', 'Bearer');
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        full_name: mockUser.full_name,
        role: mockUser.role,
        first_login: mockUser.first_login,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        client_id: 'web_frontend',
      });
    });

    it('deve lançar UnauthorizedException para email inválido', async () => {
      const userLoginDto: UserLoginDto = {
        email: 'wrong@example.com',
        password: 'password123',
      };

      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.userLogin(userLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.userLogin(userLoginDto)).rejects.toThrow(
        'Invalid email or password',
      );
    });

    it('deve lançar UnauthorizedException para senha inválida', async () => {
      const userLoginDto: UserLoginDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.userLogin(userLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve lançar UnauthorizedException para usuário inativo', async () => {
      const inactiveUser = { ...mockUser, active: false };
      const userLoginDto: UserLoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUsersService.findByEmail.mockResolvedValue(inactiveUser);

      await expect(service.userLogin(userLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.userLogin(userLoginDto)).rejects.toThrow(
        'User account is inactive',
      );
    });

    it('deve lidar com senha com prefixo $wp$', async () => {
      // Criar hash normal primeiro
      const normalHash = await bcrypt.hash('password123', 10);
      // O código remove $wp$ e adiciona $, então precisamos criar o hash como $wp$ + hash sem o primeiro $
      // Se o hash é $2b$10$..., então $wp$2b$10$... será convertido para $2b$10$...
      const userWithWpPrefix: User = {
        ...mockUser,
        password_hash: '$wp$' + normalHash.substring(1), // Remove o primeiro $ e adiciona $wp$
      };

      const userLoginDto: UserLoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUsersService.findByEmail.mockResolvedValue(userWithWpPrefix);
      mockConfigService.get.mockReturnValue('24h');
      mockJwtService.sign.mockReturnValue('token');

      const result = await service.userLogin(userLoginDto);

      expect(result).toHaveProperty('access_token');
      expect(mockJwtService.sign).toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    let mockUser: User;

    beforeEach(async () => {
      mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        password_hash: await bcrypt.hash('old-password', 10),
        role: UserRole.EVALUATOR,
        active: true,
        first_login: false,
        registration_number: null,
        specialty: null,
        phone: null,
        last_login: null,
        created_at: new Date(),
        updated_at: new Date(),
        questionnaires: [],
      };
    });

    it('deve alterar senha com sucesso', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'old-password',
        newPassword: 'new-password123',
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockUsersService.updatePassword.mockResolvedValue({
        ...mockUser,
        password_hash: await bcrypt.hash('new-password123', 10),
        first_login: false,
      });

      const result = await service.changePassword('user-id', changePasswordDto);

      expect(result).toEqual({
        success: true,
        message: 'Password changed successfully',
      });
      expect(mockUsersService.updatePassword).toHaveBeenCalledWith(
        'user-id',
        expect.any(String),
        false,
      );
    });

    it('deve lançar NotFoundException para usuário não encontrado', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'old-password',
        newPassword: 'new-password123',
      };

      mockUsersService.findOne.mockResolvedValue(null);

      await expect(
        service.changePassword('invalid-id', changePasswordDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar UnauthorizedException para senha atual incorreta', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'wrong-password',
        newPassword: 'new-password123',
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);

      await expect(
        service.changePassword('user-id', changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.changePassword('user-id', changePasswordDto),
      ).rejects.toThrow('Current password is incorrect');
    });
  });

  describe('forgotPassword', () => {
    const forgotPasswordDto: ForgotPasswordDto = {
      email: 'test@example.com',
    };

    it('deve retornar mensagem genérica mesmo quando usuário não existe', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword(forgotPasswordDto);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Se o e-mail estiver cadastrado');
      expect(mockMailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('deve enviar e-mail quando usuário ativo existe', async () => {
      const mockUser: User = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        password_hash: 'hash',
        role: UserRole.EVALUATOR,
        active: true,
        first_login: false,
        registration_number: null,
        specialty: null,
        phone: null,
        last_login: null,
        created_at: new Date(),
        updated_at: new Date(),
        questionnaires: [],
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockConfigService.get.mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES') return '60';
        if (key === 'FRONTEND_PUBLIC_URL') return 'https://prime.icomp.ufam.edu.br/webapp';
        return defaultValue;
      });
      mockPasswordResetTokenRepository.update.mockResolvedValue({});
      mockPasswordResetTokenRepository.create.mockImplementation((data) => data);
      mockPasswordResetTokenRepository.save.mockResolvedValue({});
      mockMailService.sendPasswordResetEmail.mockResolvedValue(undefined);

      const result = await service.forgotPassword(forgotPasswordDto);

      expect(result.success).toBe(true);
      expect(mockPasswordResetTokenRepository.update).toHaveBeenCalled();
      expect(mockPasswordResetTokenRepository.save).toHaveBeenCalled();
      expect(mockMailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        mockUser.email,
        expect.stringContaining('/redefinir-senha?token='),
        60,
      );
    });

    it('não deve enviar e-mail para usuário inativo', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        active: false,
      });

      const result = await service.forgotPassword(forgotPasswordDto);

      expect(result.success).toBe(true);
      expect(mockMailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('deve redefinir senha com token válido', async () => {
      const rawToken = 'a'.repeat(64);
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');
      const resetPasswordDto: ResetPasswordDto = {
        token: rawToken,
        newPassword: 'new-password123',
      };

      const mockUser: User = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        password_hash: 'old-hash',
        role: UserRole.EVALUATOR,
        active: true,
        first_login: true,
        registration_number: null,
        specialty: null,
        phone: null,
        last_login: null,
        created_at: new Date(),
        updated_at: new Date(),
        questionnaires: [],
      };

      const resetToken = {
        id: 'token-id',
        user_id: 'user-id',
        token_hash: tokenHash,
        expires_at: new Date(Date.now() + 60_000),
        used_at: null,
      };

      mockPasswordResetTokenRepository.findOne.mockResolvedValue(resetToken);
      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockUsersService.updatePassword.mockResolvedValue(mockUser);
      mockPasswordResetTokenRepository.save.mockResolvedValue({
        ...resetToken,
        used_at: new Date(),
      });

      const result = await service.resetPassword(resetPasswordDto);

      expect(result.success).toBe(true);
      expect(mockUsersService.updatePassword).toHaveBeenCalledWith(
        'user-id',
        expect.any(String),
        false,
      );
      expect(mockPasswordResetTokenRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ used_at: expect.any(Date) }),
      );
    });

    it('deve lançar BadRequestException para token inválido', async () => {
      mockPasswordResetTokenRepository.findOne.mockResolvedValue(null);

      await expect(
        service.resetPassword({ token: 'invalid', newPassword: 'newpass1' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getTokenExpirationInSeconds', () => {
    it('deve converter horas para segundos', () => {
      mockConfigService.get.mockReturnValue('24h');
      const localService = new AuthService(
        mockJwtService as any,
        mockConfigService as any,
        mockUsersService as any,
        mockMailService as any,
        mockPasswordResetTokenRepository as any,
      );

      // Acessar método privado via reflection ou testar indiretamente
      const loginDto: LoginDto = {
        client_id: 'web_frontend',
        client_secret: 'secret',
      };

      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'CLIENT_2_SECRET') return 'secret';
        if (key === 'JWT_EXPIRATION') return '24h';
      });

      mockJwtService.sign.mockReturnValue('token');

      localService.login(loginDto).then((result) => {
        expect(result.expires_in).toBe(86400); // 24 * 3600
      });
    });

    it('deve converter dias para segundos', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'CLIENT_2_SECRET') return 'secret';
        if (key === 'JWT_EXPIRATION') return '7d';
      });

      mockJwtService.sign.mockReturnValue('token');

      service.login({
        client_id: 'web_frontend',
        client_secret: 'secret',
      }).then((result) => {
        expect(result.expires_in).toBe(604800); // 7 * 86400
      });
    });
  });
});

