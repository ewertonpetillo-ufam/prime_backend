import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { LoginDto } from './dto/login.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { PasswordResetToken } from '../../entities/password-reset-token.entity';

const FORGOT_PASSWORD_GENERIC_MESSAGE =
  'Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
    private mailService: MailService,
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepository: Repository<PasswordResetToken>,
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
      // Remove $wp$ prefix and restore the $ for bcrypt format
      passwordHash = '$' + passwordHash.substring(4);
    }

    const isPasswordValid = await bcrypt.compare(password, passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login timestamp
    user.last_login = new Date();
    await this.usersService.update(user.id, { last_login: user.last_login });

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
        first_login: user.first_login,
      },
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    // Find user by ID
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    let passwordHash = user.password_hash;
    if (passwordHash.startsWith('$wp$')) {
      // Remove $wp$ prefix and restore the $ for bcrypt format
      passwordHash = '$' + passwordHash.substring(4);
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update user password and set first_login to false
    await this.usersService.updatePassword(userId, newPasswordHash, false);

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.usersService.findByEmail(email);

    if (user && user.active) {
      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = this.hashResetToken(rawToken);
      const expirationMinutes = this.getPasswordResetExpirationMinutes();
      const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

      await this.passwordResetTokenRepository.update(
        { user_id: user.id, used_at: IsNull() },
        { used_at: new Date() },
      );

      const resetToken = this.passwordResetTokenRepository.create({
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      });
      await this.passwordResetTokenRepository.save(resetToken);

      const frontendUrl = this.configService.get<string>(
        'FRONTEND_PUBLIC_URL',
        'http://localhost:3000',
      );
      const resetLink = `${frontendUrl.replace(/\/$/, '')}/redefinir-senha?token=${rawToken}`;

      await this.mailService.sendPasswordResetEmail(
        user.email,
        resetLink,
        expirationMinutes,
      );
    }

    return {
      success: true,
      message: FORGOT_PASSWORD_GENERIC_MESSAGE,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;
    const tokenHash = this.hashResetToken(token);

    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: {
        token_hash: tokenHash,
        used_at: IsNull(),
        expires_at: MoreThan(new Date()),
      },
    });

    if (!resetToken) {
      throw new BadRequestException(
        'Token inválido ou expirado. Solicite uma nova recuperação de senha.',
      );
    }

    const user = await this.usersService.findOne(resetToken.user_id);
    if (!user || !user.active) {
      throw new BadRequestException(
        'Token inválido ou expirado. Solicite uma nova recuperação de senha.',
      );
    }

    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
    await this.usersService.updatePassword(user.id, newPasswordHash, false);

    resetToken.used_at = new Date();
    await this.passwordResetTokenRepository.save(resetToken);

    return {
      success: true,
      message: 'Senha redefinida com sucesso. Você já pode fazer login.',
    };
  }

  private hashResetToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private getPasswordResetExpirationMinutes(): number {
    const raw = this.configService.get<string>(
      'PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES',
      '60',
    );
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 60;
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
