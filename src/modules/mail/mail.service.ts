import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getTransporter(): Transporter {
    if (!this.transporter) {
      const host = this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com');
      const port = this.configService.get<number>('SMTP_PORT', 587);
      const secure = this.configService.get<string>('SMTP_SECURE', 'false') === 'true';
      const user = this.configService.get<string>('SMTP_USER');
      const pass = this.configService.get<string>('SMTP_PASS');

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: user && pass ? { user, pass } : undefined,
      });
    }
    return this.transporter;
  }

  async sendPasswordResetEmail(
    to: string,
    resetLink: string,
    expirationMinutes: number,
  ): Promise<void> {
    const fromName = this.configService.get<string>('SMTP_FROM_NAME', 'PRIME - UFAM');
    const from = this.configService.get<string>('SMTP_FROM', 'prime.coleta@icomp.ufam.edu.br');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #1e3a5f;">PRIME - Recuperação de senha</h2>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta no sistema PRIME.</p>
        <p>Clique no botão abaixo para criar uma nova senha:</p>
        <p style="margin: 24px 0;">
          <a href="${resetLink}"
             style="background-color: #2563eb; color: #ffffff; padding: 12px 24px;
                    text-decoration: none; border-radius: 8px; display: inline-block;">
            Redefinir senha
          </a>
        </p>
        <p style="font-size: 14px; color: #666;">
          Este link expira em <strong>${expirationMinutes} minutos</strong>.
        </p>
        <p style="font-size: 14px; color: #666;">
          Se você não solicitou esta alteração, ignore este e-mail. Sua senha permanecerá inalterada.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="font-size: 12px; color: #999;">
          Se o botão não funcionar, copie e cole este link no navegador:<br />
          <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
        </p>
      </div>
    `;

    const text = [
      'PRIME - Recuperação de senha',
      '',
      'Recebemos uma solicitação para redefinir a senha da sua conta no sistema PRIME.',
      '',
      `Acesse o link abaixo para criar uma nova senha (expira em ${expirationMinutes} minutos):`,
      resetLink,
      '',
      'Se você não solicitou esta alteração, ignore este e-mail.',
    ].join('\n');

    try {
      await this.getTransporter().sendMail({
        from: `"${fromName}" <${from}>`,
        to,
        subject: 'PRIME - Recuperação de senha',
        text,
        html,
      });
    } catch (error) {
      this.logger.error(`Falha ao enviar e-mail de recuperação para ${to}`, error);
      throw error;
    }
  }
}
