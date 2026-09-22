"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.PdfReportsService = void 0;
var common_1 = require("@nestjs/common");
var bullmq_1 = require("@nestjs/bullmq");
var typeorm_1 = require("@nestjs/typeorm");
var bullmq_2 = require("bullmq");
var typeorm_2 = require("typeorm");
var crypto_1 = require("crypto");
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var stream_1 = require("stream");
var pdf_report_entity_1 = require("../../entities/pdf-report.entity");
var questionnaire_entity_1 = require("../../entities/questionnaire.entity");
var minio_storage_service_1 = require("../storage/minio-storage.service");
var queues_module_1 = require("../queues/queues.module");
function pdfReportTypeToFolder(reportType) {
    var map = {
        BIOBIT: 'baiobit',
        DELSYS: 'delsys',
        POLYSOMNOGRAPHY: 'polysomnograph',
        OTHER: 'other',
    };
    return map[reportType] || 'other';
}
function sanitizeOriginalFileName(name) {
    var base = name
        .replace(/[/\\]/g, '_')
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_+/g, '_');
    var trimmed = base.replace(/^_|_$/g, '').slice(0, 180);
    return trimmed || 'file';
}
/** Rede / processo: MinIO inacessível (não confundir com “arquivo não existe”). */
function isMinioConnectivityError(e) {
    var err = e;
    var cause = err === null || err === void 0 ? void 0 : err.cause;
    var code = (err === null || err === void 0 ? void 0 : err.code) || (cause === null || cause === void 0 ? void 0 : cause.code);
    if (typeof code === 'string') {
        return ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN', 'EHOSTUNREACH', 'EPIPE'].includes(code);
    }
    var msg = ((err === null || err === void 0 ? void 0 : err.message) || '').toLowerCase();
    return /connect econnrefused|econnrefused|network|timed out|timeout exceeded|getaddrinfo|fetch failed|socket hang up/i.test(msg);
}
function isStorageObjectMissing(e) {
    var _a;
    var err = e;
    if ((err === null || err === void 0 ? void 0 : err.name) === 'NotFound' || (err === null || err === void 0 ? void 0 : err.name) === 'NoSuchKey')
        return true;
    if ((err === null || err === void 0 ? void 0 : err.Code) === 'NoSuchKey')
        return true;
    if (((_a = err === null || err === void 0 ? void 0 : err.$metadata) === null || _a === void 0 ? void 0 : _a.httpStatusCode) === 404)
        return true;
    return false;
}
var PdfReportsService = /** @class */ (function () {
    function PdfReportsService(pdfReportRepository, questionnaireRepository, minioStorage, uploadQueue) {
        this.pdfReportRepository = pdfReportRepository;
        this.questionnaireRepository = questionnaireRepository;
        this.minioStorage = minioStorage;
        this.uploadQueue = uploadQueue;
    }
    PdfReportsService.prototype.assertQuestionnaireExists = function (questionnaireId) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaire;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.questionnaireRepository.findOne({
                            where: { id: questionnaireId },
                        })];
                    case 1:
                        questionnaire = _a.sent();
                        if (!questionnaire) {
                            throw new common_1.NotFoundException("Questionnaire with ID ".concat(questionnaireId, " not found"));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    PdfReportsService.prototype.preflightUpload = function (dto) {
        return __awaiter(this, void 0, void 0, function () {
            var items;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertQuestionnaireExists(dto.questionnaireId)];
                    case 1:
                        _a.sent();
                        items = dto.files.map(function (file) { return ({
                            fileName: file.fileName,
                            fileSizeBytes: file.fileSizeBytes,
                            action: 'upload',
                        }); });
                        return [2 /*return*/, { items: items }];
                }
            });
        });
    };
    PdfReportsService.prototype.enqueueUploadReport = function (dto, file, uploadedBy) {
        return __awaiter(this, void 0, void 0, function () {
            var job;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(file === null || file === void 0 ? void 0 : file.path)) {
                            throw new common_1.BadRequestException('Arquivo temporário inválido após upload');
                        }
                        if (!!this.minioStorage.isEnabled()) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, promises_1.unlink)(file.path).catch(function () { return undefined; })];
                    case 1:
                        _b.sent();
                        throw new common_1.BadRequestException('Armazenamento de arquivos (MinIO) não está configurado. Defina MINIO_* no ambiente.');
                    case 2: return [4 /*yield*/, this.assertQuestionnaireExists(dto.questionnaireId)];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, this.uploadQueue.add('process-upload', {
                                tempPath: file.path,
                                questionnaireId: dto.questionnaireId,
                                reportType: dto.reportType,
                                fileName: file.originalname,
                                fileSizeBytes: file.size,
                                mimeType: file.mimetype || 'application/octet-stream',
                                notes: (_a = dto.notes) !== null && _a !== void 0 ? _a : null,
                                uploadedBy: uploadedBy !== null && uploadedBy !== void 0 ? uploadedBy : null,
                            }, {
                                removeOnComplete: { age: 3600 },
                                removeOnFail: { age: 86400 },
                            })];
                    case 4:
                        job = _b.sent();
                        return [2 /*return*/, {
                                jobId: String(job.id),
                                statusUrl: "/pdf-reports/upload/status/".concat(job.id),
                            }];
                }
            });
        });
    };
    /** Persiste relatório a partir de arquivo temporário (worker assíncrono). Não lê file_data legado. */
    PdfReportsService.prototype.persistUploadFromTemp = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var id, folder, safeName, key, stream, e_1, err, msg, pdfReport, saved, fileDownloadUrl;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        id = (0, crypto_1.randomUUID)();
                        folder = pdfReportTypeToFolder(data.reportType);
                        safeName = sanitizeOriginalFileName(data.fileName);
                        key = "".concat(folder, "/").concat(data.questionnaireId, "/").concat(id, "_").concat(safeName);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, 4, 6]);
                        stream = (0, fs_1.createReadStream)(data.tempPath);
                        return [4 /*yield*/, this.minioStorage.putObjectStream(key, stream, data.mimeType)];
                    case 2:
                        _c.sent();
                        return [3 /*break*/, 6];
                    case 3:
                        e_1 = _c.sent();
                        err = e_1;
                        msg = e_1 instanceof Error ? e_1.message : 'Falha ao enviar arquivo ao MinIO';
                        console.error('[pdf-reports] MinIO upload failed (async)', {
                            key: key,
                            fileSizeBytes: data.fileSizeBytes,
                            message: msg,
                            code: err.code,
                            name: err.name,
                        });
                        if (isMinioConnectivityError(e_1)) {
                            throw new common_1.ServiceUnavailableException("Armazenamento de arquivos (MinIO) indispon\u00EDvel: ".concat(msg, ". Verifique MINIO_ENDPOINT e se o servi\u00E7o MinIO est\u00E1 acess\u00EDvel a partir do container do backend."));
                        }
                        throw new common_1.InternalServerErrorException(msg);
                    case 4: return [4 /*yield*/, (0, promises_1.unlink)(data.tempPath).catch(function () { return undefined; })];
                    case 5:
                        _c.sent();
                        return [7 /*endfinally*/];
                    case 6:
                        pdfReport = this.pdfReportRepository.create({
                            id: id,
                            questionnaire_id: data.questionnaireId,
                            report_type: data.reportType,
                            file_name: data.fileName,
                            file_size_bytes: data.fileSizeBytes,
                            mime_type: data.mimeType,
                            file_path: key,
                            file_data: null,
                            file_sync_pending: false,
                            file_synced_at: new Date(),
                            notes: (_a = data.notes) !== null && _a !== void 0 ? _a : null,
                            uploaded_by: (_b = data.uploadedBy) !== null && _b !== void 0 ? _b : null,
                        });
                        return [4 /*yield*/, this.pdfReportRepository.save(pdfReport)];
                    case 7:
                        saved = _c.sent();
                        return [4 /*yield*/, this.getPresignedDownloadUrl(saved.file_path)];
                    case 8:
                        fileDownloadUrl = _c.sent();
                        return [2 /*return*/, {
                                id: saved.id,
                                fileName: saved.file_name,
                                fileDownloadUrl: fileDownloadUrl,
                            }];
                }
            });
        });
    };
    PdfReportsService.prototype.uploadReport = function (dto, file, uploadedBy) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaire, id, folder, safeName, key, tempPath, mimeType, stream, e_2, err, msg, pdfReport, saved, fileDownloadUrl;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!file) {
                            throw new common_1.BadRequestException('Arquivo é obrigatório');
                        }
                        if (!this.minioStorage.isEnabled()) {
                            throw new common_1.BadRequestException('Armazenamento de arquivos (MinIO) não está configurado. Defina MINIO_* no ambiente.');
                        }
                        return [4 /*yield*/, this.questionnaireRepository.findOne({
                                where: { id: dto.questionnaireId },
                            })];
                    case 1:
                        questionnaire = _a.sent();
                        if (!questionnaire) {
                            throw new common_1.NotFoundException("Questionnaire with ID ".concat(dto.questionnaireId, " not found"));
                        }
                        id = (0, crypto_1.randomUUID)();
                        folder = pdfReportTypeToFolder(dto.reportType);
                        safeName = sanitizeOriginalFileName(file.originalname);
                        key = "".concat(folder, "/").concat(dto.questionnaireId, "/").concat(id, "_").concat(safeName);
                        tempPath = file.path;
                        mimeType = file.mimetype || 'application/octet-stream';
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 8, 9, 12]);
                        if (!tempPath) return [3 /*break*/, 4];
                        stream = (0, fs_1.createReadStream)(tempPath);
                        return [4 /*yield*/, this.minioStorage.putObjectStream(key, stream, mimeType)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 4:
                        if (!file.buffer) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.minioStorage.putObject(key, file.buffer, mimeType)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6: throw new common_1.BadRequestException('Arquivo temporário inválido após upload');
                    case 7: return [3 /*break*/, 12];
                    case 8:
                        e_2 = _a.sent();
                        err = e_2;
                        msg = e_2 instanceof Error ? e_2.message : 'Falha ao enviar arquivo ao MinIO';
                        console.error('[pdf-reports] MinIO upload failed', {
                            key: key,
                            fileSizeBytes: file.size,
                            message: msg,
                            code: err.code,
                            name: err.name,
                        });
                        if (isMinioConnectivityError(e_2)) {
                            throw new common_1.ServiceUnavailableException("Armazenamento de arquivos (MinIO) indispon\u00EDvel: ".concat(msg, ". Verifique MINIO_ENDPOINT e se o servi\u00E7o MinIO est\u00E1 acess\u00EDvel a partir do container do backend."));
                        }
                        throw new common_1.InternalServerErrorException(msg);
                    case 9:
                        if (!tempPath) return [3 /*break*/, 11];
                        return [4 /*yield*/, (0, promises_1.unlink)(tempPath).catch(function () { return undefined; })];
                    case 10:
                        _a.sent();
                        _a.label = 11;
                    case 11: return [7 /*endfinally*/];
                    case 12:
                        pdfReport = this.pdfReportRepository.create({
                            id: id,
                            questionnaire_id: dto.questionnaireId,
                            report_type: dto.reportType,
                            file_name: file.originalname,
                            file_size_bytes: file.size,
                            mime_type: file.mimetype || 'application/octet-stream',
                            file_path: key,
                            file_data: null,
                            notes: dto.notes || null,
                            uploaded_by: uploadedBy || null,
                        });
                        return [4 /*yield*/, this.pdfReportRepository.save(pdfReport)];
                    case 13:
                        saved = _a.sent();
                        return [4 /*yield*/, this.getPresignedDownloadUrl(saved.file_path)];
                    case 14:
                        fileDownloadUrl = _a.sent();
                        return [2 /*return*/, Object.assign(saved, { fileDownloadUrl: fileDownloadUrl })];
                }
            });
        });
    };
    PdfReportsService.prototype.getReportById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var report, buffer, e_3, msg_1, msg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.pdfReportRepository
                            .createQueryBuilder('report')
                            .addSelect('report.file_data')
                            .where('report.id = :id', { id: id })
                            .getOne()];
                    case 1:
                        report = _a.sent();
                        if (!report) {
                            throw new common_1.NotFoundException("Relat\u00F3rio com ID ".concat(id, " n\u00E3o encontrado"));
                        }
                        if (!report.file_path) return [3 /*break*/, 5];
                        if (!this.minioStorage.isEnabled()) {
                            throw new common_1.InternalServerErrorException('Arquivo está no MinIO mas o storage não está configurado neste ambiente.');
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.minioStorage.getObjectBuffer(report.file_path)];
                    case 3:
                        buffer = _a.sent();
                        return [2 /*return*/, Object.assign(report, { file_data: buffer })];
                    case 4:
                        e_3 = _a.sent();
                        if (isMinioConnectivityError(e_3)) {
                            msg_1 = e_3 instanceof Error ? e_3.message : 'MinIO indisponível';
                            throw new common_1.ServiceUnavailableException("Armazenamento de arquivos (MinIO) indispon\u00EDvel: ".concat(msg_1, ". Verifique MINIO_ENDPOINT e se o servi\u00E7o est\u00E1 acess\u00EDvel a partir deste backend."));
                        }
                        if (isStorageObjectMissing(e_3)) {
                            throw new common_1.NotFoundException("Arquivo do relat\u00F3rio ".concat(id, " n\u00E3o encontrado no storage"));
                        }
                        msg = e_3 instanceof Error ? e_3.message : 'Falha ao ler arquivo no storage';
                        console.error('[pdf-reports] MinIO getObjectBuffer failed', {
                            reportId: id,
                            filePath: report.file_path,
                            message: msg,
                        });
                        throw new common_1.InternalServerErrorException(msg);
                    case 5: return [2 /*return*/, report];
                }
            });
        });
    };
    PdfReportsService.prototype.getReportForDownload = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var report, stream, e_4, err;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.pdfReportRepository.findOne({ where: { id: id } })];
                    case 1:
                        report = _b.sent();
                        if (!report) {
                            throw new common_1.NotFoundException("Relat\u00F3rio com ID ".concat(id, " n\u00E3o encontrado"));
                        }
                        if (!report.file_path) return [3 /*break*/, 5];
                        if (!this.minioStorage.isEnabled()) {
                            throw new common_1.InternalServerErrorException('Arquivo está no MinIO mas o storage não está configurado neste ambiente.');
                        }
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.minioStorage.getObjectStream(report.file_path)];
                    case 3:
                        stream = _b.sent();
                        return [2 /*return*/, { report: report, stream: stream }];
                    case 4:
                        e_4 = _b.sent();
                        err = e_4;
                        console.error('[pdf-reports] MinIO getObjectStream failed', {
                            reportId: id,
                            filePath: report.file_path,
                            message: err === null || err === void 0 ? void 0 : err.message,
                            code: err === null || err === void 0 ? void 0 : err.code,
                        });
                        if (isMinioConnectivityError(e_4)) {
                            throw new common_1.ServiceUnavailableException("Armazenamento de arquivos (MinIO) indispon\u00EDvel: ".concat((err === null || err === void 0 ? void 0 : err.message) || 'falha de conexão', ". Verifique se o MinIO est\u00E1 em execu\u00E7\u00E3o e se MINIO_ENDPOINT \u00E9 alcan\u00E7\u00E1vel a partir deste servidor."));
                        }
                        if (isStorageObjectMissing(e_4)) {
                            throw new common_1.NotFoundException("Arquivo do relat\u00F3rio ".concat(id, " n\u00E3o encontrado no storage"));
                        }
                        throw new common_1.InternalServerErrorException((err === null || err === void 0 ? void 0 : err.message) || 'Falha ao abrir stream do arquivo no storage');
                    case 5: return [2 /*return*/, { report: report, stream: stream_1.Readable.from((_a = report.file_data) !== null && _a !== void 0 ? _a : Buffer.from([])) }];
                }
            });
        });
    };
    PdfReportsService.prototype.deleteReport = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.pdfReportRepository.findOne({ where: { id: id } })];
                    case 1:
                        existing = _b.sent();
                        if (!existing) {
                            return [2 /*return*/, { success: true, alreadyDeleted: true }];
                        }
                        if (!(existing.file_path && this.minioStorage.isEnabled())) return [3 /*break*/, 5];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.minioStorage.deleteObject(existing.file_path)];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        _a = _b.sent();
                        return [3 /*break*/, 5];
                    case 5: return [4 /*yield*/, this.pdfReportRepository.delete(id)];
                    case 6:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    };
    /** URL pré-assinada para download direto no navegador (null se legado só com BYTEA ou MinIO desligado). */
    PdfReportsService.prototype.getPresignedDownloadUrl = function (filePath_1) {
        return __awaiter(this, arguments, void 0, function (filePath, expiresInSeconds) {
            var _a;
            if (expiresInSeconds === void 0) { expiresInSeconds = 3600; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!filePath ||
                            !this.minioStorage.isEnabled() ||
                            !this.minioStorage.isPresignedEnabled()) {
                            return [2 /*return*/, null];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.minioStorage.getPresignedGetUrl(filePath, expiresInSeconds)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3:
                        _a = _b.sent();
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /** Lê bytes do MinIO ou do BYTEA legado. */
    PdfReportsService.prototype.readStoredFileBuffer = function (report) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!report.file_path) return [3 /*break*/, 4];
                        if (!this.minioStorage.isEnabled()) {
                            return [2 /*return*/, null];
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.minioStorage.getObjectBuffer(report.file_path)];
                    case 2: return [2 /*return*/, _c.sent()];
                    case 3:
                        _a = _c.sent();
                        return [2 /*return*/, null];
                    case 4:
                        if ((_b = report.file_data) === null || _b === void 0 ? void 0 : _b.length) {
                            return [2 /*return*/, report.file_data];
                        }
                        return [2 /*return*/, null];
                }
            });
        });
    };
    PdfReportsService = __decorate([
        (0, common_1.Injectable)(),
        __param(0, (0, typeorm_1.InjectRepository)(pdf_report_entity_1.PdfReport)),
        __param(1, (0, typeorm_1.InjectRepository)(questionnaire_entity_1.Questionnaire)),
        __param(3, (0, bullmq_1.InjectQueue)(queues_module_1.PDF_REPORT_UPLOAD_QUEUE)),
        __metadata("design:paramtypes", [typeorm_2.Repository,
            typeorm_2.Repository,
            minio_storage_service_1.MinioStorageService,
            bullmq_2.Queue])
    ], PdfReportsService);
    return PdfReportsService;
}());
exports.PdfReportsService = PdfReportsService;
