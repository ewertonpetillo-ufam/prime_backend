import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendPasswordResetEmail(
    to: string,
    name: string | null,
    resetLink: string,
  ): Promise<void> {
    const appName =
      this.configService.get<string>('APP_NAME') || 'Projeto Prime';

    try {
      await this.mailerService.sendMail({
        to,
        subject: `${appName} - Redefinição de senha`,
        text: [
          `Olá${name ? ` ${name}` : ''},`,
          '',
          'Recebemos uma solicitação para redefinir a senha da sua conta.',
          'Se você fez essa solicitação, clique no link abaixo para criar uma nova senha:',
          '',
          resetLink,
          '',
          'Se você não solicitou a redefinição, ignore este email. Sua senha continuará a mesma.',
          '',
          `Atenciosamente,`,
          `${appName}`,
        ].join('\n'),
      });
    } catch (error) {
      this.logger.error('Erro ao enviar email de redefinição de senha', {
        error: (error as Error).message,
      });
      // Não propagar detalhes de erro de email para o cliente final
    }
  }
}

