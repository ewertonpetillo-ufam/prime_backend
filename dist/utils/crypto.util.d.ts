import { ConfigService } from '@nestjs/config';
export declare class CryptoUtil {
    private static configService;
    static setConfigService(configService: ConfigService): void;
    static hashCpf(cpf: string): string;
    static isValidCpfFormat(cpf: string): boolean;
}
