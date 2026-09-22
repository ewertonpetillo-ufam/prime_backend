"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoUtil = void 0;
var crypto_1 = require("crypto");
/**
 * Anonymize CPF using HMAC-SHA256
 * This matches the PostgreSQL function: encode(hmac(cpf, secret, 'sha256'), 'hex')
 */
var CryptoUtil = /** @class */ (function () {
    function CryptoUtil() {
    }
    CryptoUtil.setConfigService = function (configService) {
        this.configService = configService;
    };
    /**
     * Hash CPF with HMAC-SHA256 for patient anonymization
     * @param cpf - The CPF in plain text (can be with or without formatting)
     * @returns Hex-encoded HMAC hash
     */
    CryptoUtil.hashCpf = function (cpf) {
        if (!this.configService) {
            throw new Error('ConfigService not initialized in CryptoUtil');
        }
        var secret = this.configService.get('HMAC_SECRET');
        if (!secret) {
            throw new Error('HMAC_SECRET not configured');
        }
        // Remove all non-numeric characters from CPF
        var cleanCpf = cpf.replace(/\D/g, '');
        // Create HMAC-SHA256 hash
        var hmac = (0, crypto_1.createHmac)('sha256', secret);
        hmac.update(cleanCpf);
        return hmac.digest('hex');
    };
    /**
     * Validate CPF format (basic validation)
     * @param cpf - CPF string
     * @returns true if format is valid
     */
    CryptoUtil.isValidCpfFormat = function (cpf) {
        var cleanCpf = cpf.replace(/\D/g, '');
        return cleanCpf.length === 11 && /^\d+$/.test(cleanCpf);
    };
    return CryptoUtil;
}());
exports.CryptoUtil = CryptoUtil;
