"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtifactoryService = void 0;
var common_1 = require("@nestjs/common");
var config_1 = require("@nestjs/config");
var crypto_1 = require("crypto");
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var http = __importStar(require("http"));
var https = __importStar(require("https"));
var os_1 = require("os");
var path_1 = require("path");
var promises_2 = require("stream/promises");
var url_1 = require("url");
var ArtifactoryService = /** @class */ (function () {
    function ArtifactoryService(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ArtifactoryService_1.name);
        this.baseUrl = (this.configService.get('ARTIFACTORY_URL') || '').replace(/\/$/, '');
        this.user = this.configService.get('ARTIFACTORY_USER') || '';
        this.token = this.configService.get('ARTIFACTORY_TOKEN') || '';
    }
    ArtifactoryService_1 = ArtifactoryService;
    Object.defineProperty(ArtifactoryService.prototype, "authHeaders", {
        get: function () {
            var basicAuth = Buffer.from("".concat(this.user, ":").concat(this.token)).toString('base64');
            return {
                Authorization: "Basic ".concat(basicAuth),
            };
        },
        enumerable: false,
        configurable: true
    });
    ArtifactoryService.prototype.ensureReady = function () {
        if (!this.baseUrl || !this.user || !this.token) {
            throw new Error('Configuração do Artifactory incompleta. Verifique ARTIFACTORY_URL, ARTIFACTORY_USER e ARTIFACTORY_TOKEN.');
        }
    };
    ArtifactoryService.prototype.buildStorageUrl = function (repo, artifactPath) {
        var encodedPath = artifactPath
            .split('/')
            .filter(Boolean)
            .map(function (part) { return encodeURIComponent(part); })
            .join('/');
        return "".concat(this.baseUrl, "/api/storage/").concat(repo, "/").concat(encodedPath);
    };
    ArtifactoryService.prototype.getPublicBaseUrl = function () {
        return this.baseUrl;
    };
    ArtifactoryService.prototype.getArtifactDownloadUrl = function (repo, artifactPath) {
        return this.buildArtifactUrl(repo, artifactPath);
    };
    ArtifactoryService.prototype.buildArtifactUrl = function (repo, artifactPath) {
        var encodedPath = artifactPath
            .split('/')
            .filter(Boolean)
            .map(function (part) { return encodeURIComponent(part); })
            .join('/');
        return "".concat(this.baseUrl, "/").concat(repo, "/").concat(encodedPath);
    };
    ArtifactoryService.prototype.requestWithRetry = function (url_2, init_1) {
        return __awaiter(this, arguments, void 0, function (url, init, options) {
            var retries, timeoutMs, lastError, _loop_1, this_1, attempt, state_1;
            var _a, _b, _c, _d, _e, _f;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        retries = (_a = options.retries) !== null && _a !== void 0 ? _a : 2;
                        timeoutMs = (_b = options.timeoutMs) !== null && _b !== void 0 ? _b : 30000;
                        _loop_1 = function (attempt) {
                            var controller, timer, onExternalAbort, response, error_1;
                            return __generator(this, function (_h) {
                                switch (_h.label) {
                                    case 0:
                                        controller = new AbortController();
                                        timer = setTimeout(function () { return controller.abort(); }, timeoutMs);
                                        onExternalAbort = function () { return controller.abort(); };
                                        (_c = options.signal) === null || _c === void 0 ? void 0 : _c.addEventListener('abort', onExternalAbort);
                                        _h.label = 1;
                                    case 1:
                                        _h.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, fetch(url, __assign(__assign({}, init), { signal: controller.signal }))];
                                    case 2:
                                        response = _h.sent();
                                        clearTimeout(timer);
                                        (_d = options.signal) === null || _d === void 0 ? void 0 : _d.removeEventListener('abort', onExternalAbort);
                                        if (response.status >= 500 && attempt < retries) {
                                            this_1.logger.warn("Artifactory ".concat(init.method || 'GET', " ").concat(url, " retornou ").concat(response.status, "; tentativa ").concat(attempt + 1, "/").concat(retries + 1));
                                            return [2 /*return*/, "continue"];
                                        }
                                        return [2 /*return*/, { value: response }];
                                    case 3:
                                        error_1 = _h.sent();
                                        clearTimeout(timer);
                                        (_e = options.signal) === null || _e === void 0 ? void 0 : _e.removeEventListener('abort', onExternalAbort);
                                        if ((_f = options.signal) === null || _f === void 0 ? void 0 : _f.aborted) {
                                            throw new Error('Upload cancelado pelo usuário');
                                        }
                                        lastError = error_1;
                                        if (attempt < retries) {
                                            this_1.logger.warn("Falha de rede em ".concat(init.method || 'GET', " ").concat(url, "; tentativa ").concat(attempt + 1, "/").concat(retries + 1));
                                            return [2 /*return*/, "continue"];
                                        }
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        attempt = 0;
                        _g.label = 1;
                    case 1:
                        if (!(attempt <= retries)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(attempt)];
                    case 2:
                        state_1 = _g.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        _g.label = 3;
                    case 3:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 4: throw lastError instanceof Error
                        ? lastError
                        : new Error('Erro desconhecido na comunicação com Artifactory');
                }
            });
        });
    };
    ArtifactoryService.prototype.getSha256 = function (buffer) {
        return (0, crypto_1.createHash)('sha256').update(buffer).digest('hex');
    };
    ArtifactoryService.prototype.logUploadMemory = function (context, zipBytes) {
        var mem = process.memoryUsage();
        this.logger.log("".concat(context, " zip=").concat((zipBytes / 1048576).toFixed(1), "MB heap=").concat((mem.heapUsed / 1048576).toFixed(0), "MB rss=").concat((mem.rss / 1048576).toFixed(0), "MB"));
    };
    /**
     * PUT nativo (http/https), uma passada: hasheia enquanto envia.
     * Não usa fetch/undici — o body streaming do fetch bufferiza ZIPs grandes e estoura o cgroup.
     */
    ArtifactoryService.prototype.uploadFileFromPath = function (repo_1, artifactPath_1, filePath_1) {
        return __awaiter(this, arguments, void 0, function (repo, artifactPath, filePath, mimeType, timeoutMs, signal) {
            var fileStat, retries, lastError, attempt, sha256, error_2, message, clientError;
            if (mimeType === void 0) { mimeType = 'application/octet-stream'; }
            if (timeoutMs === void 0) { timeoutMs = 60 * 60 * 1000; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureReady();
                        if (signal === null || signal === void 0 ? void 0 : signal.aborted) {
                            throw new Error('Upload cancelado pelo usuário');
                        }
                        return [4 /*yield*/, (0, promises_1.stat)(filePath)];
                    case 1:
                        fileStat = _a.sent();
                        if (!fileStat.isFile() || fileStat.size === 0) {
                            throw new Error("Arquivo inv\u00E1lido para upload: ".concat(filePath));
                        }
                        this.logUploadMemory("PUT ".concat(repo, "/").concat(artifactPath), fileStat.size);
                        retries = 2;
                        attempt = 0;
                        _a.label = 2;
                    case 2:
                        if (!(attempt <= retries)) return [3 /*break*/, 7];
                        if (signal === null || signal === void 0 ? void 0 : signal.aborted) {
                            throw new Error('Upload cancelado pelo usuário');
                        }
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.putFileStreamOnce(repo, artifactPath, filePath, fileStat.size, mimeType, timeoutMs, signal)];
                    case 4:
                        sha256 = _a.sent();
                        this.logger.log("Upload conclu\u00EDdo (stream): ".concat(repo, "/").concat(artifactPath));
                        return [2 /*return*/, sha256];
                    case 5:
                        error_2 = _a.sent();
                        lastError = error_2;
                        message = error_2 instanceof Error ? error_2.message : String(error_2);
                        if ((signal === null || signal === void 0 ? void 0 : signal.aborted) || /cancelad/i.test(message)) {
                            throw new Error('Upload cancelado pelo usuário');
                        }
                        clientError = /HTTP 4\d\d/.test(message);
                        if (clientError || attempt >= retries) {
                            return [3 /*break*/, 7];
                        }
                        this.logger.warn("PUT ".concat(repo, "/").concat(artifactPath, " falhou (").concat(message, "); reabrindo arquivo, tentativa ").concat(attempt + 2, "/").concat(retries + 1));
                        return [3 /*break*/, 6];
                    case 6:
                        attempt++;
                        return [3 /*break*/, 2];
                    case 7: throw lastError instanceof Error
                        ? lastError
                        : new Error("Falha no upload ".concat(repo, "/").concat(artifactPath));
                }
            });
        });
    };
    ArtifactoryService.prototype.putFileStreamOnce = function (repo, artifactPath, filePath, fileSize, mimeType, timeoutMs, signal) {
        var _this = this;
        var target = new url_1.URL(this.buildArtifactUrl(repo, artifactPath));
        var lib = target.protocol === 'https:' ? https : http;
        var sha256 = (0, crypto_1.createHash)('sha256');
        return new Promise(function (resolve, reject) {
            var readStream = (0, fs_1.createReadStream)(filePath, { highWaterMark: 256 * 1024 });
            var settled = false;
            var fail = function (error) {
                if (settled)
                    return;
                settled = true;
                readStream.destroy();
                reject(error);
            };
            var succeed = function (value) {
                if (settled)
                    return;
                settled = true;
                resolve(value);
            };
            var req = lib.request({
                protocol: target.protocol,
                hostname: target.hostname,
                port: target.port || (target.protocol === 'https:' ? 443 : 80),
                path: "".concat(target.pathname).concat(target.search),
                method: 'PUT',
                headers: __assign(__assign({}, _this.authHeaders), { 'Content-Type': mimeType, 'Content-Length': String(fileSize) }),
            }, function (res) {
                var chunks = [];
                res.on('data', function (chunk) { return chunks.push(chunk); });
                res.on('error', function (error) { return fail(error); });
                res.on('end', function () {
                    var _a;
                    var status = res.statusCode || 0;
                    var body = Buffer.concat(chunks).toString('utf8');
                    if (status < 200 || status >= 300) {
                        fail(new Error("Falha no upload ".concat(repo, "/").concat(artifactPath, ": HTTP ").concat(status)));
                        return;
                    }
                    var localSha = sha256.digest('hex');
                    try {
                        var parsed = JSON.parse(body);
                        var remoteSha = (_a = parsed.checksums) === null || _a === void 0 ? void 0 : _a.sha256;
                        if (remoteSha && remoteSha !== localSha) {
                            fail(new Error("Checksum Artifactory diverge do SHA256 local em ".concat(repo, "/").concat(artifactPath)));
                            return;
                        }
                    }
                    catch (_b) {
                        // Resposta sem JSON: usamos o SHA256 local.
                    }
                    succeed(localSha);
                });
            });
            req.setTimeout(timeoutMs, function () {
                req.destroy();
                fail(new Error('Timeout no upload para o Artifactory'));
            });
            req.on('error', function (error) { return fail(error instanceof Error ? error : new Error(String(error))); });
            var onAbort = function () {
                req.destroy();
                fail(new Error('Upload cancelado pelo usuário'));
            };
            signal === null || signal === void 0 ? void 0 : signal.addEventListener('abort', onAbort, { once: true });
            req.on('close', function () { return signal === null || signal === void 0 ? void 0 : signal.removeEventListener('abort', onAbort); });
            readStream.on('data', function (chunk) {
                sha256.update(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            });
            readStream.on('error', function (error) {
                req.destroy();
                fail(error);
            });
            readStream.pipe(req);
        });
    };
    /** Upload a partir de Readable — grava em temp e reutiliza uploadFileFromPath. */
    ArtifactoryService.prototype.uploadFileStream = function (repo_1, artifactPath_1, source_1) {
        return __awaiter(this, arguments, void 0, function (repo, artifactPath, source, mimeType, timeoutMs) {
            var tmpPath;
            if (mimeType === void 0) { mimeType = 'application/octet-stream'; }
            if (timeoutMs === void 0) { timeoutMs = 60 * 60 * 1000; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tmpPath = (0, path_1.join)((0, os_1.tmpdir)(), "artifactory-upload-".concat((0, crypto_1.randomUUID)()));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 4, 6]);
                        return [4 /*yield*/, (0, promises_2.pipeline)(source, (0, fs_1.createWriteStream)(tmpPath))];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.uploadFileFromPath(repo, artifactPath, tmpPath, mimeType, timeoutMs)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4: return [4 /*yield*/, (0, promises_1.unlink)(tmpPath).catch(function () { return undefined; })];
                    case 5:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ArtifactoryService.prototype.ping = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureReady();
                        return [4 /*yield*/, this.requestWithRetry("".concat(this.baseUrl, "/api/system/ping"), {
                                method: 'GET',
                                headers: this.authHeaders,
                            }, { timeoutMs: 15000, retries: 1 })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.ok];
                }
            });
        });
    };
    ArtifactoryService.prototype.getFileInfo = function (repo, artifactPath) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.ensureReady();
                        return [4 /*yield*/, this.requestWithRetry(this.buildStorageUrl(repo, artifactPath), {
                                method: 'GET',
                                headers: this.authHeaders,
                            }, { timeoutMs: 20000, retries: 1 })];
                    case 1:
                        response = _b.sent();
                        if (response.status === 404) {
                            return [2 /*return*/, null];
                        }
                        if (!response.ok) {
                            throw new Error("Falha ao consultar artefato ".concat(repo, "/").concat(artifactPath, ": HTTP ").concat(response.status));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = (_b.sent());
                        return [2 /*return*/, { sha256: ((_a = data.checksums) === null || _a === void 0 ? void 0 : _a.sha256) || null }];
                }
            });
        });
    };
    ArtifactoryService.prototype.uploadFile = function (repo_1, artifactPath_1, buffer_1) {
        return __awaiter(this, arguments, void 0, function (repo, artifactPath, buffer, mimeType) {
            var sha256, sha1, md5, response;
            if (mimeType === void 0) { mimeType = 'application/octet-stream'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureReady();
                        sha256 = this.getSha256(buffer);
                        sha1 = (0, crypto_1.createHash)('sha1').update(buffer).digest('hex');
                        md5 = (0, crypto_1.createHash)('md5').update(buffer).digest('hex');
                        return [4 /*yield*/, this.requestWithRetry(this.buildArtifactUrl(repo, artifactPath), {
                                method: 'PUT',
                                headers: __assign(__assign({}, this.authHeaders), { 'Content-Type': mimeType, 'X-Checksum-Deploy': 'false', 'X-Checksum-Sha256': sha256, 'X-Checksum-Sha1': sha1, 'X-Checksum-Md5': md5 }),
                                body: new Uint8Array(buffer),
                            }, { timeoutMs: 180000, retries: 2 })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Falha no upload ".concat(repo, "/").concat(artifactPath, ": HTTP ").concat(response.status));
                        }
                        this.logger.log("Upload conclu\u00EDdo: ".concat(repo, "/").concat(artifactPath));
                        return [2 /*return*/, sha256];
                }
            });
        });
    };
    ArtifactoryService.prototype.uploadIfChanged = function (repo_1, artifactPath_1, buffer_1, knownHash_1) {
        return __awaiter(this, arguments, void 0, function (repo, artifactPath, buffer, knownHash, mimeType) {
            var sha256, remote;
            if (mimeType === void 0) { mimeType = 'application/octet-stream'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sha256 = this.getSha256(buffer);
                        if (knownHash && knownHash === sha256) {
                            return [2 /*return*/, { uploaded: false, sha256: sha256 }];
                        }
                        return [4 /*yield*/, this.getFileInfo(repo, artifactPath)];
                    case 1:
                        remote = _a.sent();
                        if ((remote === null || remote === void 0 ? void 0 : remote.sha256) && remote.sha256 === sha256) {
                            return [2 /*return*/, { uploaded: false, sha256: sha256 }];
                        }
                        return [4 /*yield*/, this.uploadFile(repo, artifactPath, buffer, mimeType)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, { uploaded: true, sha256: sha256 }];
                }
            });
        });
    };
    ArtifactoryService.prototype.deleteFile = function (repo, artifactPath) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureReady();
                        return [4 /*yield*/, this.requestWithRetry(this.buildArtifactUrl(repo, artifactPath), {
                                method: 'DELETE',
                                headers: this.authHeaders,
                            }, { timeoutMs: 30000, retries: 2 })];
                    case 1:
                        response = _a.sent();
                        if (response.status === 404)
                            return [2 /*return*/];
                        if (!response.ok) {
                            throw new Error("Falha ao remover ".concat(repo, "/").concat(artifactPath, ": HTTP ").concat(response.status));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    ArtifactoryService.prototype.listStorage = function (repo, folderPath) {
        return __awaiter(this, void 0, void 0, function () {
            var cleaned, url, response, payload, files;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureReady();
                        cleaned = folderPath.replace(/^\/+|\/+$/g, '');
                        url = cleaned
                            ? "".concat(this.baseUrl, "/api/storage/").concat(repo, "/").concat(cleaned, "?list&deep=0&listFolders=1")
                            : "".concat(this.baseUrl, "/api/storage/").concat(repo, "?list&deep=0&listFolders=1");
                        return [4 /*yield*/, this.requestWithRetry(url, {
                                method: 'GET',
                                headers: this.authHeaders,
                            }, { timeoutMs: 30000, retries: 2 })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            if (response.status === 404)
                                return [2 /*return*/, []];
                            throw new Error("Falha ao listar storage ".concat(repo, "/").concat(cleaned || '/', ": HTTP ").concat(response.status));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        payload = (_a.sent());
                        files = Array.isArray(payload.files) ? payload.files : [];
                        return [2 /*return*/, files
                                .map(function (item) {
                                var _a;
                                var rawName = ((_a = item.uri) === null || _a === void 0 ? void 0 : _a.replace(/^\//, '')) || '';
                                var isFolder = Boolean(item.folder) || rawName.endsWith('/');
                                var name = rawName.replace(/\/$/, '');
                                var path = cleaned ? "".concat(cleaned, "/").concat(name) : name;
                                return {
                                    name: name,
                                    path: path,
                                    folder: isFolder,
                                    size: Number(item.size || 0),
                                    last_modified: item.lastModified || null,
                                };
                            })
                                .filter(function (item) { return item.name.length > 0; })
                                .sort(function (a, b) {
                                if (a.folder !== b.folder)
                                    return a.folder ? -1 : 1;
                                return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
                            })];
                }
            });
        });
    };
    ArtifactoryService.prototype.listArtifacts = function (repo, basePath) {
        return __awaiter(this, void 0, void 0, function () {
            var cleaned, url, response, payload, files;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureReady();
                        cleaned = basePath.replace(/^\/+|\/+$/g, '');
                        url = "".concat(this.baseUrl, "/api/storage/").concat(repo, "/").concat(cleaned, "?list&deep=0&listFolders=0");
                        return [4 /*yield*/, this.requestWithRetry(url, {
                                method: 'GET',
                                headers: this.authHeaders,
                            }, { timeoutMs: 30000, retries: 2 })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            if (response.status === 404)
                                return [2 /*return*/, []];
                            throw new Error("Falha ao listar artefatos ".concat(repo, "/").concat(cleaned, ": HTTP ").concat(response.status));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        payload = (_a.sent());
                        files = Array.isArray(payload.files) ? payload.files : [];
                        return [2 /*return*/, files
                                .filter(function (item) { return !item.folder; })
                                .map(function (item) {
                                var _a;
                                var rawName = ((_a = item.uri) === null || _a === void 0 ? void 0 : _a.replace(/^\//, '')) || '';
                                var path = "".concat(cleaned, "/").concat(rawName);
                                return {
                                    name: rawName,
                                    path: path,
                                    size: Number(item.size || 0),
                                    last_modified: item.lastModified || null,
                                    download_url: _this.buildArtifactUrl(repo, path),
                                };
                            })];
                }
            });
        });
    };
    ArtifactoryService.prototype.downloadFile = function (repo, artifactPath) {
        return __awaiter(this, void 0, void 0, function () {
            var response, ab;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureReady();
                        return [4 /*yield*/, this.requestWithRetry(this.buildArtifactUrl(repo, artifactPath), {
                                method: 'GET',
                                headers: this.authHeaders,
                            }, { timeoutMs: 120000, retries: 1 })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Falha ao baixar ".concat(repo, "/").concat(artifactPath, ": HTTP ").concat(response.status));
                        }
                        return [4 /*yield*/, response.arrayBuffer()];
                    case 2:
                        ab = _a.sent();
                        return [2 /*return*/, {
                                buffer: Buffer.from(ab),
                                contentType: response.headers.get('content-type') || 'application/octet-stream',
                            }];
                }
            });
        });
    };
    var ArtifactoryService_1;
    ArtifactoryService = ArtifactoryService_1 = __decorate([
        (0, common_1.Injectable)(),
        __metadata("design:paramtypes", [config_1.ConfigService])
    ], ArtifactoryService);
    return ArtifactoryService;
}());
exports.ArtifactoryService = ArtifactoryService;
