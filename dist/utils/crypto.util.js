"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoUtil = void 0;
const crypto_1 = require("crypto");
class CryptoUtil {
    static setConfigService(configService) {
        this.configService = configService;
    }
    static hashCpf(cpf) {
        if (!this.configService) {
            throw new Error('ConfigService not initialized in CryptoUtil');
        }
        const secret = this.configService.get('HMAC_SECRET');
        if (!secret) {
            throw new Error('HMAC_SECRET not configured');
        }
        const cleanCpf = cpf.replace(/\D/g, '');
        const hmac = (0, crypto_1.createHmac)('sha256', secret);
        hmac.update(cleanCpf);
        return hmac.digest('hex');
    }
    static isValidCpfFormat(cpf) {
        const cleanCpf = cpf.replace(/\D/g, '');
        return cleanCpf.length === 11 && /^\d+$/.test(cleanCpf);
    }
}
exports.CryptoUtil = CryptoUtil;
//# sourceMappingURL=crypto.util.js.map