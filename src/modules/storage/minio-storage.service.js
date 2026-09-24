"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinioStorageService = void 0;
var common_1 = require("@nestjs/common");
var config_1 = require("@nestjs/config");
var client_s3_1 = require("@aws-sdk/client-s3");
var lib_storage_1 = require("@aws-sdk/lib-storage");
var s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
var node_http_handler_1 = require("@smithy/node-http-handler");
var http = __importStar(require("node:http"));
var https = __importStar(require("node:https"));
var fs_1 = require("fs");
var promises_1 = require("stream/promises");
/** HTTP(S) com timeouts relaxados e keep-alive — reduz ECONNRESET em túnel SSH / rede lenta. */
function createS3NodeHttpHandler() {
    return new node_http_handler_1.NodeHttpHandler({
        connectionTimeout: 120000,
        requestTimeout: 0,
        socketTimeout: 0,
        httpAgent: new http.Agent({ keepAlive: true, keepAliveMsecs: 30000 }),
        httpsAgent: new https.Agent({ keepAlive: true, keepAliveMsecs: 30000 }),
    });
}
var MinioStorageService = /** @class */ (function () {
    function MinioStorageService(config) {
        var _a, _b, _c, _d, _e, _f;
        this.config = config;
        var endpoint = (_a = config.get('MINIO_ENDPOINT')) === null || _a === void 0 ? void 0 : _a.trim();
        this.endpoint = endpoint || '';
        var publicBase = ((_b = config.get('MINIO_PUBLIC_BASE_URL')) === null || _b === void 0 ? void 0 : _b.trim()) || endpoint || '';
        var accessKey = (_c = config.get('MINIO_ACCESS_KEY')) === null || _c === void 0 ? void 0 : _c.trim();
        var secretKey = (_d = config.get('MINIO_SECRET_KEY')) === null || _d === void 0 ? void 0 : _d.trim();
        this.bucket = ((_e = config.get('MINIO_BUCKET')) === null || _e === void 0 ? void 0 : _e.trim()) || 'prime-coleta';
        var region = ((_f = config.get('MINIO_REGION')) === null || _f === void 0 ? void 0 : _f.trim()) || 'us-east-1';
        var forcePathStyle = config.get('MINIO_FORCE_PATH_STYLE') !== 'false';
        this.presignedEnabled = config.get('MINIO_PRESIGNED_ENABLED') !== 'false';
        this.enabled = !!(endpoint && accessKey && secretKey);
        if (this.enabled) {
            var requestHandler = createS3NodeHttpHandler();
            this.internalClient = new client_s3_1.S3Client({
                region: region,
                endpoint: endpoint,
                credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
                forcePathStyle: forcePathStyle,
                requestHandler: requestHandler,
            });
            this.presignClient = new client_s3_1.S3Client({
                region: region,
                endpoint: publicBase || endpoint,
                credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
                forcePathStyle: forcePathStyle,
                requestHandler: createS3NodeHttpHandler(),
            });
        }
        else {
            this.internalClient = null;
            this.presignClient = null;
        }
    }
    MinioStorageService.prototype.getBucket = function () {
        return this.bucket;
    };
    MinioStorageService.prototype.isEnabled = function () {
        return this.enabled;
    };
    MinioStorageService.prototype.isPresignedEnabled = function () {
        return this.presignedEnabled;
    };
    MinioStorageService.prototype.getEndpoint = function () {
        return this.endpoint;
    };
    MinioStorageService.prototype.ping = function () {
        return __awaiter(this, arguments, void 0, function (timeoutMs) {
            var _a;
            if (timeoutMs === void 0) { timeoutMs = 5000; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.enabled)
                            return [2 /*return*/, false];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, Promise.race([
                                this.internalClient.send(new client_s3_1.HeadBucketCommand({ Bucket: this.bucket })),
                                new Promise(function (_, reject) {
                                    return setTimeout(function () { return reject(new Error('MinIO ping timeout')); }, timeoutMs);
                                }),
                            ])];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, true];
                    case 3:
                        _a = _b.sent();
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MinioStorageService.prototype.assertEnabled = function () {
        if (!this.enabled) {
            throw new Error('MinIO storage is not configured');
        }
    };
    /**
     * Aceita chaves legadas em formatos diferentes e normaliza para object key:
     * - baiobit/arquivo.pdf (formato esperado)
     * - /prime-coleta/baiobit/arquivo.pdf
     * - https://host/minio/prime-coleta/baiobit/arquivo.pdf
     */
    MinioStorageService.prototype.normalizeObjectKey = function (rawKey) {
        var trimmed = rawKey.trim();
        if (!trimmed) {
            return trimmed;
        }
        var candidate = trimmed;
        // Se veio URL completa, usa apenas o pathname.
        if (/^https?:\/\//i.test(candidate)) {
            try {
                var url = new URL(candidate);
                candidate = decodeURIComponent(url.pathname || '');
            }
            catch (_a) {
                // mantém candidate original se URL inválida
            }
        }
        // Remove barra inicial
        candidate = candidate.replace(/^\/+/, '');
        // Remove prefixos comuns de proxy (ex.: /minio/...)
        candidate = candidate.replace(/^minio\/+/, '');
        // Remove bucket explícito no começo (ex.: prime-coleta/...)
        var bucketPrefix = "".concat(this.bucket, "/");
        if (candidate.startsWith(bucketPrefix)) {
            candidate = candidate.slice(bucketPrefix.length);
        }
        return candidate;
    };
    MinioStorageService.prototype.putObject = function (key, body, contentType) {
        return __awaiter(this, void 0, void 0, function () {
            var normalizedKey, largeObjectThreshold, upload;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assertEnabled();
                        normalizedKey = this.normalizeObjectKey(key);
                        largeObjectThreshold = 50 * 1024 * 1024;
                        if (!(body.length > largeObjectThreshold)) return [3 /*break*/, 2];
                        upload = new lib_storage_1.Upload({
                            client: this.internalClient,
                            queueSize: 4,
                            partSize: 10 * 1024 * 1024,
                            params: {
                                Bucket: this.bucket,
                                Key: normalizedKey,
                                Body: body,
                                ContentType: contentType,
                            },
                        });
                        return [4 /*yield*/, upload.done()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2: return [4 /*yield*/, this.internalClient.send(new client_s3_1.PutObjectCommand({
                            Bucket: this.bucket,
                            Key: normalizedKey,
                            Body: body,
                            ContentType: contentType,
                        }))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MinioStorageService.prototype.deleteObject = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assertEnabled();
                        return [4 /*yield*/, this.internalClient.send(new client_s3_1.DeleteObjectCommand({
                                Bucket: this.bucket,
                                Key: this.normalizeObjectKey(key),
                            }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MinioStorageService.prototype.getObjectBuffer = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var out, stream, chunks, _a, stream_1, stream_1_1, chunk, e_1_1;
            var _b, e_1, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        this.assertEnabled();
                        return [4 /*yield*/, this.internalClient.send(new client_s3_1.GetObjectCommand({
                                Bucket: this.bucket,
                                Key: this.normalizeObjectKey(key),
                            }))];
                    case 1:
                        out = _e.sent();
                        stream = out.Body;
                        chunks = [];
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 7, 8, 13]);
                        _a = true, stream_1 = __asyncValues(stream);
                        _e.label = 3;
                    case 3: return [4 /*yield*/, stream_1.next()];
                    case 4:
                        if (!(stream_1_1 = _e.sent(), _b = stream_1_1.done, !_b)) return [3 /*break*/, 6];
                        _d = stream_1_1.value;
                        _a = false;
                        chunk = _d;
                        chunks.push(Buffer.from(chunk));
                        _e.label = 5;
                    case 5:
                        _a = true;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 13];
                    case 7:
                        e_1_1 = _e.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 13];
                    case 8:
                        _e.trys.push([8, , 11, 12]);
                        if (!(!_a && !_b && (_c = stream_1.return))) return [3 /*break*/, 10];
                        return [4 /*yield*/, _c.call(stream_1)];
                    case 9:
                        _e.sent();
                        _e.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 12: return [7 /*endfinally*/];
                    case 13: return [2 /*return*/, Buffer.concat(chunks)];
                }
            });
        });
    };
    MinioStorageService.prototype.getObjectStream = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var out;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assertEnabled();
                        return [4 /*yield*/, this.internalClient.send(new client_s3_1.GetObjectCommand({
                                Bucket: this.bucket,
                                Key: this.normalizeObjectKey(key),
                            }))];
                    case 1:
                        out = _a.sent();
                        return [2 /*return*/, out.Body];
                }
            });
        });
    };
    /** Grava o objeto direto em disco — evita Buffer.concat de PDFs/EDFs grandes na heap. */
    MinioStorageService.prototype.getObjectToFile = function (key, destPath) {
        return __awaiter(this, void 0, void 0, function () {
            var stream;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getObjectStream(key)];
                    case 1:
                        stream = _a.sent();
                        return [4 /*yield*/, (0, promises_1.pipeline)(stream, (0, fs_1.createWriteStream)(destPath))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Faz upload de um Readable stream para o MinIO via multipart upload.
     * Não requer ContentLength antecipado — compatível com streams on-the-fly (archiver, etc.).
     */
    MinioStorageService.prototype.putObjectStream = function (key, stream, contentType) {
        return __awaiter(this, void 0, void 0, function () {
            var upload;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assertEnabled();
                        upload = new lib_storage_1.Upload({
                            client: this.internalClient,
                            queueSize: 4,
                            partSize: 10 * 1024 * 1024, // 10 MB por parte
                            params: {
                                Bucket: this.bucket,
                                Key: this.normalizeObjectKey(key),
                                Body: stream,
                                ContentType: contentType,
                            },
                        });
                        return [4 /*yield*/, upload.done()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MinioStorageService.prototype.getPresignedGetUrl = function (key, expiresInSeconds) {
        return __awaiter(this, void 0, void 0, function () {
            var command;
            return __generator(this, function (_a) {
                this.assertEnabled();
                if (!this.presignedEnabled) {
                    throw new Error('Presigned URLs disabled by environment');
                }
                command = new client_s3_1.GetObjectCommand({
                    Bucket: this.bucket,
                    Key: this.normalizeObjectKey(key),
                });
                return [2 /*return*/, (0, s3_request_presigner_1.getSignedUrl)(this.presignClient, command, { expiresIn: expiresInSeconds })];
            });
        });
    };
    MinioStorageService = __decorate([
        (0, common_1.Injectable)(),
        __metadata("design:paramtypes", [config_1.ConfigService])
    ], MinioStorageService);
    return MinioStorageService;
}());
exports.MinioStorageService = MinioStorageService;
