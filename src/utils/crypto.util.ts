import { createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';

/**
 * Anonymize CPF using HMAC-SHA256
 * This matches the PostgreSQL function: encode(hmac(cpf, secret, 'sha256'), 'hex')
 */
export class CryptoUtil {
  private static configService: ConfigService;

  static setConfigService(configService: ConfigService) {
    this.configService = configService;
  }

  /**
   * Hash CPF with HMAC-SHA256 for patient anonymization
   * @param cpf - The CPF in plain text (can be with or without formatting)
   * @returns Hex-encoded HMAC hash
   */
  static hashCpf(cpf: string): string {
    if (!this.configService) {
      throw new Error('ConfigService not initialized in CryptoUtil');
    }

    const secret = this.configService.get<string>('HMAC_SECRET');
    if (!secret) {
      throw new Error('HMAC_SECRET not configured');
    }

    // Remove all non-numeric characters from CPF
    const cleanCpf = cpf.replace(/\D/g, '');

    // Create HMAC-SHA256 hash
    const hmac = createHmac('sha256', secret);
    hmac.update(cleanCpf);

    return hmac.digest('hex');
  }

  /**
   * Validate CPF format (basic validation)
   * @param cpf - CPF string
   * @returns true if format is valid
   */
  static isValidCpfFormat(cpf: string): boolean {
    const cleanCpf = cpf.replace(/\D/g, '');
    return cleanCpf.length === 11 && /^\d+$/.test(cleanCpf);
  }
}
