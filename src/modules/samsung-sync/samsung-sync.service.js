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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SamsungSyncService = void 0;
var common_1 = require("@nestjs/common");
var config_1 = require("@nestjs/config");
var typeorm_1 = require("@nestjs/typeorm");
var typeorm_2 = require("typeorm");
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var crypto_1 = require("crypto");
var pLimit = require("p-limit");
var samsung_sync_run_entity_1 = require("../../entities/samsung-sync-run.entity");
var samsung_sync_run_item_entity_1 = require("../../entities/samsung-sync-run-item.entity");
var pg_transient_1 = require("../../common/database/pg-transient");
var questionnaires_service_1 = require("../questionnaires/questionnaires.service");
var freeliving_service_1 = require("../freeliving/freeliving.service");
var minio_storage_service_1 = require("../storage/minio-storage.service");
var artifactory_service_1 = require("./artifactory.service");
var export_guidelines_1 = require("../export-guidelines");
var samsung_dataset_utils_1 = require("./samsung-dataset.utils");
// DATASET_ROOT is now computed per-run from the ZIP name (see executeRun)
var SamsungSyncService = /** @class */ (function () {
    function SamsungSyncService(db, syncRunRepository, syncRunItemRepository, questionnairesService, freelivingService, artifactoryService, configService, minioService) {
        this.db = db;
        this.syncRunRepository = syncRunRepository;
        this.syncRunItemRepository = syncRunItemRepository;
        this.questionnairesService = questionnairesService;
        this.freelivingService = freelivingService;
        this.artifactoryService = artifactoryService;
        this.configService = configService;
        this.minioService = minioService;
        this.logger = new common_1.Logger(SamsungSyncService_1.name);
        this.cancelledRunIds = new Set();
        this.runAbortControllers = new Map();
        this.repoPatients =
            this.configService.get('ARTIFACTORY_REPO_PATIENTS') ||
                'srbr-ufamprime-generic-local';
        this.repoCollections =
            this.configService.get('ARTIFACTORY_REPO_COLLECTIONS') ||
                this.repoPatients;
        this.repoZip =
            this.configService.get('ARTIFACTORY_REPO_ZIP') || this.repoCollections;
        this.basePath = (this.configService.get('ARTIFACTORY_BASE_PATH') || 'test_api').replace(/^\/+|\/+$/g, '');
        this.zipBasePath = (this.configService.get('ARTIFACTORY_ZIP_BASE_PATH') ||
            this.basePath).replace(/^\/+|\/+$/g, '');
    }
    SamsungSyncService_1 = SamsungSyncService;
    SamsungSyncService.prototype.onModuleInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var enabled, intervalMs;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.attachPoolErrorHandler();
                        return [4 /*yield*/, this.recoverStaleRuns()];
                    case 1:
                        _a.sent();
                        enabled = (this.configService.get('SAMSUNG_SYNC_CRON_ENABLED') || 'false') ===
                            'true';
                        if (!enabled)
                            return [2 /*return*/];
                        intervalMs = Number(this.configService.get('SAMSUNG_SYNC_INTERVAL_MS') ||
                            6 * 60 * 60 * 1000);
                        this.logger.log("Scheduler de sync Samsung habilitado. intervalMs=".concat(intervalMs));
                        setInterval(function () {
                            _this.logger.log('Disparando sync Samsung por scheduler');
                            void _this.runSync(null, 'scheduler', {});
                        }, intervalMs);
                        return [2 /*return*/];
                }
            });
        });
    };
    /** Evita que erros assíncronos do pg-pool derrubem o processo Nest. */
    SamsungSyncService.prototype.attachPoolErrorHandler = function () {
        var _this = this;
        var driver = this.db.driver;
        var pool = driver === null || driver === void 0 ? void 0 : driver.master;
        if (!pool || typeof pool.on !== 'function')
            return;
        pool.on('error', function (error) {
            _this.logger.error("Erro no pool PostgreSQL (n\u00E3o fatal): ".concat((error === null || error === void 0 ? void 0 : error.message) || String(error)));
        });
    };
    SamsungSyncService.prototype.recoverStaleRuns = function () {
        return __awaiter(this, void 0, void 0, function () {
            var running, _loop_1, this_1, _i, running_1, run;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.syncRunRepository.find({
                            where: { status: samsung_sync_run_entity_1.SamsungSyncRunStatus.RUNNING },
                        })];
                    case 1:
                        running = _a.sent();
                        _loop_1 = function (run) {
                            var zipReady;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        this_1.cancelledRunIds.delete(run.id);
                                        this_1.runAbortControllers.delete(run.id);
                                        return [4 /*yield*/, (0, samsung_dataset_utils_1.isDeliveryZipReady)(run.id)];
                                    case 1:
                                        zipReady = _b.sent();
                                        if (this_1.canResumeZipUpload(run, zipReady)) {
                                            this_1.logger.warn("Run ".concat(run.id, ": ZIP de entrega ainda no disco \u2014 retomando PUT para o BART ap\u00F3s rein\u00EDcio"));
                                            setTimeout(function () {
                                                void _this.resumeZipUpload(run).catch(function (error) {
                                                    var message = error instanceof Error ? error.message : String(error);
                                                    _this.logger.error("Run ".concat(run.id, ": falha ao retomar upload do ZIP: ").concat(message));
                                                });
                                            }, 0);
                                            return [2 /*return*/, "continue"];
                                        }
                                        return [4 /*yield*/, this_1.syncRunRepository.update(run.id, {
                                                status: samsung_sync_run_entity_1.SamsungSyncRunStatus.FAILED,
                                                finished_at: new Date(),
                                                error_message: 'Interrompido por reinício do servidor',
                                            })];
                                    case 2:
                                        _b.sent();
                                        return [4 /*yield*/, (0, samsung_dataset_utils_1.cleanupSamsungSyncTempDir)(run.id)];
                                    case 3:
                                        _b.sent();
                                        this_1.logger.warn("Run \u00F3rf\u00E3o ".concat(run.id, " marcado como failed ap\u00F3s rein\u00EDcio"));
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, running_1 = running;
                        _a.label = 2;
                    case 2:
                        if (!(_i < running_1.length)) return [3 /*break*/, 5];
                        run = running_1[_i];
                        return [5 /*yield**/, _loop_1(run)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SamsungSyncService.prototype.canResumeZipUpload = function (run, zipReady) {
        var _a;
        var summary = (run.summary || {});
        var step = Number((_a = summary.currentStepIndex) !== null && _a !== void 0 ? _a : 0);
        return (zipReady &&
            step >= 6 &&
            typeof summary.zipPath === 'string' &&
            typeof summary.zipName === 'string' &&
            typeof summary.deliveryDate === 'string' &&
            Array.isArray(summary.metadataRows) &&
            Array.isArray(summary.patientsReadyForConfirm));
    };
    SamsungSyncService.prototype.findActiveRunningRun = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.syncRunRepository.findOne({
                        where: { status: samsung_sync_run_entity_1.SamsungSyncRunStatus.RUNNING },
                        order: { started_at: 'DESC' },
                    })];
            });
        });
    };
    SamsungSyncService.prototype.toDateFolder = function (value) {
        return (0, samsung_dataset_utils_1.toDateFolder)(value);
    };
    SamsungSyncService.prototype.isSamsungExcludedPublicIdentifier = function (publicIdentifier) {
        return (0, samsung_dataset_utils_1.isSamsungExcludedPublicIdentifier)(publicIdentifier);
    };
    SamsungSyncService.prototype.extractTaskCodeFromFilename = function (fileName) {
        return (0, samsung_dataset_utils_1.extractTaskCodeFromFilename)(fileName);
    };
    SamsungSyncService.prototype.isSpeechTask = function (taskCode) {
        return (0, samsung_dataset_utils_1.isSpeechTask)(taskCode);
    };
    SamsungSyncService.prototype.isSamsungSmartphoneTask = function (taskCode) {
        return (0, samsung_dataset_utils_1.isSamsungSmartphoneTask)(taskCode);
    };
    SamsungSyncService.prototype.inferSamsungProtocol = function (taskCode, fileName) {
        return (0, samsung_dataset_utils_1.inferSamsungProtocol)(taskCode, fileName);
    };
    SamsungSyncService.prototype.inferSamsungDevice = function (fileName, taskCode) {
        return (0, samsung_dataset_utils_1.inferSamsungDevice)(fileName, taskCode);
    };
    SamsungSyncService.prototype.toStageFolder = function (protocol) {
        return (0, samsung_dataset_utils_1.toStageFolder)(protocol);
    };
    SamsungSyncService.prototype.toSamsungDeviceFolder = function (device) {
        return (0, samsung_dataset_utils_1.toSamsungDeviceFolder)(device);
    };
    SamsungSyncService.prototype.buildSamsungActiveTaskFilename = function (rawFileName, subjectId, collectionDate, file, device, trustedTaskCode) {
        return (0, samsung_dataset_utils_1.buildSamsungActiveTaskFilename)(rawFileName, subjectId, collectionDate, file, device, trustedTaskCode);
    };
    SamsungSyncService.prototype.toSubjectId = function (publicIdentifier) {
        return (0, export_guidelines_1.toGuidelinesSubjectId)(publicIdentifier);
    };
    SamsungSyncService.prototype.getPatientPath = function (patient) {
        var subjectId = this.toSubjectId(patient.public_identifier);
        var dateFolder = this.toDateFolder(patient.sync_pending_at);
        return {
            subjectId: subjectId,
            dateFolder: dateFolder,
        };
    };
    SamsungSyncService.prototype.resolveTaskCode = function (metadata, activeTask, fileName) {
        return (0, export_guidelines_1.resolveGuidelinesTaskCode)(metadata, activeTask, fileName);
    };
    SamsungSyncService.prototype.getCollectionPath = function (patient, file, fixedDate, includeBasePath) {
        var _a;
        if (includeBasePath === void 0) { includeBasePath = true; }
        var originalName = ((_a = file.metadata) === null || _a === void 0 ? void 0 : _a.file_name) || "".concat(file.id, ".csv");
        var taskCode = this.resolveTaskCode(file.metadata, null, originalName);
        if (!(0, export_guidelines_1.shouldIncludeSpeechBinary)(taskCode, originalName)) {
            return '';
        }
        var collectionDate = fixedDate || (0, samsung_dataset_utils_1.getDeliveryDateFolder)();
        var zipPath = (0, export_guidelines_1.buildGuidelinesCollectionZipPath)({
            publicIdentifier: patient.public_identifier,
            fileName: originalName,
            taskCode: taskCode,
            sessionDate: file.collected_at || collectionDate,
        });
        if (!zipPath)
            return '';
        var prefix = includeBasePath ? "".concat(this.basePath, "/") : '';
        return "".concat(prefix).concat(zipPath);
    };
    SamsungSyncService.prototype.getCollectionPathInZip = function (patient, file, fixedDate) {
        var path = this.getCollectionPath(patient, file, fixedDate, false);
        if (!path)
            return '';
        return path;
    };
    SamsungSyncService.prototype.samsungPdfReportDataPath = function (reportType) {
        return (0, samsung_dataset_utils_1.samsungPdfReportDataPath)(reportType);
    };
    SamsungSyncService.prototype.sanitizeExternalDocBaseName = function (rawName, cpfHash) {
        return (0, samsung_dataset_utils_1.sanitizeExternalDocBaseName)(rawName, cpfHash);
    };
    SamsungSyncService.prototype.getUniqueFilename = function (baseName, counters, scope) {
        if (scope === void 0) { scope = ''; }
        return (0, samsung_dataset_utils_1.getUniqueFilename)(baseName, counters, scope);
    };
    SamsungSyncService.prototype.downloadFileAsBuffer = function (primaryUrl, fallbackUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var candidates, _i, candidates_1, url, maxAttempts, _loop_2, attempt, state_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        candidates = [primaryUrl, fallbackUrl].filter(Boolean);
                        _i = 0, candidates_1 = candidates;
                        _a.label = 1;
                    case 1:
                        if (!(_i < candidates_1.length)) return [3 /*break*/, 6];
                        url = candidates_1[_i];
                        maxAttempts = 3;
                        _loop_2 = function (attempt) {
                            var res, ab, error_1, retriable;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 3, , 5]);
                                        return [4 /*yield*/, fetch(url, { method: 'GET' })];
                                    case 1:
                                        res = _b.sent();
                                        if (!res.ok)
                                            return [2 /*return*/, "break"];
                                        return [4 /*yield*/, res.arrayBuffer()];
                                    case 2:
                                        ab = _b.sent();
                                        return [2 /*return*/, { value: Buffer.from(ab) }];
                                    case 3:
                                        error_1 = _b.sent();
                                        retriable = attempt < maxAttempts &&
                                            (error_1 instanceof TypeError ||
                                                (error_1 instanceof Error &&
                                                    /fetch|network|aborted|Failed to fetch|ECONNRESET|ERR_NETWORK/i.test(error_1.message)));
                                        if (!retriable)
                                            return [2 /*return*/, "break"];
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, attempt * 300); })];
                                    case 4:
                                        _b.sent();
                                        return [3 /*break*/, 5];
                                    case 5: return [2 /*return*/];
                                }
                            });
                        };
                        attempt = 1;
                        _a.label = 2;
                    case 2:
                        if (!(attempt <= maxAttempts)) return [3 /*break*/, 5];
                        return [5 /*yield**/, _loop_2(attempt)];
                    case 3:
                        state_1 = _a.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        if (state_1 === "break")
                            return [3 /*break*/, 5];
                        _a.label = 4;
                    case 4:
                        attempt += 1;
                        return [3 /*break*/, 2];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, null];
                }
            });
        });
    };
    SamsungSyncService.prototype.validateMinioConnectivityQuick = function () {
        return __awaiter(this, arguments, void 0, function (timeoutMs) {
            var endpoint, pingOk;
            if (timeoutMs === void 0) { timeoutMs = 5000; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.minioService.isEnabled()) {
                            return [2 /*return*/, { ok: false, warning: 'MinIO não configurado (MINIO_* ausente).' }];
                        }
                        endpoint = this.minioService.getEndpoint();
                        return [4 /*yield*/, this.minioService.ping(timeoutMs)];
                    case 1:
                        pingOk = _a.sent();
                        if (pingOk) {
                            return [2 /*return*/, { ok: true }];
                        }
                        return [2 /*return*/, {
                                ok: false,
                                warning: "MinIO inacess\u00EDvel em ".concat(endpoint, ". PDFs (Baiobit, EMG, PSG) n\u00E3o ser\u00E3o inclu\u00EDdos. ") +
                                    'Em dev local, mantenha o túnel SSH: ssh -N -L 9000:127.0.0.1:9000 -L 9001:127.0.0.1:9001 usuario@servidor',
                            }];
                }
            });
        });
    };
    SamsungSyncService.prototype.validateBartConnectivityQuick = function () {
        return __awaiter(this, arguments, void 0, function (timeoutMs) {
            var pingResult, error_2, message;
            if (timeoutMs === void 0) { timeoutMs = 5000; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.race([
                                this.artifactoryService.ping(),
                                new Promise(function (resolve) { return setTimeout(function () { return resolve(false); }, timeoutMs); }),
                            ])];
                    case 1:
                        pingResult = _a.sent();
                        if (pingResult) {
                            return [2 /*return*/, { ok: true }];
                        }
                        return [2 /*return*/, {
                                ok: false,
                                warning: "Valida\u00E7\u00E3o r\u00E1pida do BART excedeu ".concat(timeoutMs, "ms; seguindo execu\u00E7\u00E3o e validando novamente no upload."),
                            }];
                    case 2:
                        error_2 = _a.sent();
                        message = error_2 instanceof Error ? error_2.message : 'falha desconhecida na conectividade';
                        return [2 /*return*/, {
                                ok: false,
                                warning: "Falha na valida\u00E7\u00E3o r\u00E1pida do BART (".concat(message, "); seguindo execu\u00E7\u00E3o e validando novamente no upload."),
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SamsungSyncService.prototype.logMem = function (context, zipBytes) {
        var mem = process.memoryUsage();
        var zipPart = zipBytes != null ? " zip=".concat((zipBytes / 1048576).toFixed(1), "MB") : '';
        this.logger.log("".concat(context).concat(zipPart, " heap=").concat((mem.heapUsed / 1048576).toFixed(0), "MB rss=").concat((mem.rss / 1048576).toFixed(0), "MB"));
    };
    SamsungSyncService.prototype.downloadMinioToTempFile = function (tempDir, objectKey) {
        return __awaiter(this, void 0, void 0, function () {
            var destPath, error_3, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        destPath = (0, path_1.join)(tempDir, "minio-".concat((0, crypto_1.randomUUID)()));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 5]);
                        return [4 /*yield*/, this.minioService.getObjectToFile(objectKey, destPath)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, destPath];
                    case 3:
                        error_3 = _a.sent();
                        return [4 /*yield*/, (0, promises_1.unlink)(destPath).catch(function () { return undefined; })];
                    case 4:
                        _a.sent();
                        message = error_3 instanceof Error ? error_3.message : String(error_3);
                        this.logger.warn("MinIO ".concat(objectKey, ": ").concat(message));
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SamsungSyncService.prototype.flushDeviceGroupsToArchive = function (runId, tempDir, deviceGroups, archive, metadataRows, deliveryDate, summary) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, _b, groupKey, entries, _c, subjectId, stageFolder, deviceFolder, subZipTempPath, subZipInnerPath, subZipGenerationDate;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _i = 0, _a = deviceGroups.entries();
                        _d.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 10];
                        _b = _a[_i], groupKey = _b[0], entries = _b[1];
                        if (entries.length === 0)
                            return [3 /*break*/, 9];
                        _c = groupKey.split('::'), subjectId = _c[0], stageFolder = _c[1], deviceFolder = _c[2];
                        if (!subjectId || !stageFolder || !deviceFolder)
                            return [3 /*break*/, 9];
                        subZipTempPath = (0, path_1.join)(tempDir, "sub-".concat((0, crypto_1.randomUUID)(), ".zip"));
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, , 5, 8]);
                        return [4 /*yield*/, (0, samsung_dataset_utils_1.createZipFileFromEntries)(entries, subZipTempPath)];
                    case 3:
                        _d.sent();
                        subZipInnerPath = (0, samsung_dataset_utils_1.buildDeviceSubZipPath)(deliveryDate, subjectId, stageFolder, deviceFolder);
                        archive.append((0, fs_1.createReadStream)(subZipTempPath), { name: subZipInnerPath });
                        subZipGenerationDate = deliveryDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
                        this.registerDeliveryMetadataEntry(metadataRows, deliveryDate, subZipInnerPath, subZipGenerationDate);
                        summary.uploadedFiles += 1;
                        return [4 /*yield*/, this.appendRunItem({
                                runId: runId,
                                action: samsung_sync_run_item_entity_1.SamsungSyncItemAction.METADATA,
                                repo: this.repoZip,
                                path: subZipInnerPath,
                                uploaded: false,
                                message: "Sub-ZIP do dispositivo ".concat(deviceFolder, " inclu\u00EDdo no ZIP de entrega"),
                            })];
                    case 4:
                        _d.sent();
                        return [3 /*break*/, 8];
                    case 5: return [4 /*yield*/, (0, promises_1.unlink)(subZipTempPath).catch(function () { return undefined; })];
                    case 6:
                        _d.sent();
                        return [4 /*yield*/, Promise.all(entries.map(function (entry) {
                                return entry.filePath ? (0, promises_1.unlink)(entry.filePath).catch(function () { return undefined; }) : Promise.resolve();
                            }))];
                    case 7:
                        _d.sent();
                        return [7 /*endfinally*/];
                    case 8:
                        deviceGroups.delete(groupKey);
                        _d.label = 9;
                    case 9:
                        _i++;
                        return [3 /*break*/, 1];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    SamsungSyncService.prototype.appendGuidelinesEntries = function (runId, patientId, entries, archive, metadataRows, deliveryDate, summary) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, entries_1, entry, generationDate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, entries_1 = entries;
                        _a.label = 1;
                    case 1:
                        if (!(_i < entries_1.length)) return [3 /*break*/, 5];
                        entry = entries_1[_i];
                        if (entry.filePath) {
                            archive.append((0, fs_1.createReadStream)(entry.filePath), { name: entry.zipPath });
                        }
                        else if (entry.buffer) {
                            archive.append(entry.buffer, { name: entry.zipPath });
                        }
                        else {
                            return [3 /*break*/, 4];
                        }
                        generationDate = entry.generationDate ||
                            deliveryDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
                        this.registerDeliveryMetadataEntry(metadataRows, deliveryDate, entry.zipPath, generationDate);
                        summary.uploadedFiles += 1;
                        return [4 /*yield*/, this.appendRunItem({
                                runId: runId,
                                patientId: patientId,
                                action: samsung_sync_run_item_entity_1.SamsungSyncItemAction.METADATA,
                                repo: this.repoZip,
                                path: entry.zipPath,
                                uploaded: false,
                                message: entry.message || 'Arquivo Guidelines incluído no ZIP',
                            })];
                    case 2:
                        _a.sent();
                        if (!entry.filePath) return [3 /*break*/, 4];
                        return [4 /*yield*/, (0, promises_1.unlink)(entry.filePath).catch(function () { return undefined; })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SamsungSyncService.prototype.buildDeliveryZipName = function (deliveryDate) {
        return (0, samsung_dataset_utils_1.buildDeliveryZipFileName)(deliveryDate);
    };
    SamsungSyncService.prototype.registerDeliveryMetadataEntry = function (metadataRows, deliveryDate, entryPathInsideZip, generationDate) {
        metadataRows.push({
            generation_date: generationDate,
            download_url: (0, samsung_dataset_utils_1.buildArchiveEntryDownloadUrl)(this.artifactoryService.getPublicBaseUrl(), this.repoZip, this.basePath, deliveryDate, entryPathInsideZip),
        });
    };
    SamsungSyncService.prototype.normalizePdfReportType = function (report) {
        var _a;
        var raw = (_a = report === null || report === void 0 ? void 0 : report.report_type) !== null && _a !== void 0 ? _a : report === null || report === void 0 ? void 0 : report.reportType;
        return raw != null ? String(raw) : undefined;
    };
    SamsungSyncService.prototype.isExcludedPsgLaudo = function (report) {
        return (0, samsung_dataset_utils_1.isSamsungExcludedPsgLaudo)(this.normalizePdfReportType(report), report.file_name || '', report.mime_type);
    };
    SamsungSyncService.prototype.getPendingPdfReportsForPatient = function (patientId, patientEverSynced) {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.query("\n      SELECT pr.id,\n             pr.report_type,\n             pr.file_name,\n             pr.mime_type,\n             pr.file_path,\n             pr.file_sync_pending,\n             q.collection_date,\n             q.created_at AS questionnaire_created_at,\n             p.cpf_hash\n        FROM pdf_reports pr\n        JOIN questionnaires q ON q.id = pr.questionnaire_id\n        JOIN patients p ON p.id = q.patient_id\n       WHERE q.patient_id = $1::uuid\n         AND pr.file_path IS NOT NULL\n         AND ($2::boolean = FALSE OR pr.file_sync_pending = TRUE)\n         AND NOT pdf_report_is_samsung_psg_laudo_excluded(\n           pr.report_type, pr.file_name, pr.mime_type\n         )\n       ORDER BY q.created_at ASC\n      ", [patientId, patientEverSynced])];
                    case 1:
                        rows = _a.sent();
                        return [2 /*return*/, rows || []];
                }
            });
        });
    };
    SamsungSyncService.prototype.sanitizeStorageRelativePath = function (relativePath) {
        var normalized = (relativePath || '')
            .replace(/\\/g, '/')
            .replace(/^\/+|\/+$/g, '');
        var parts = normalized.split('/').filter(function (p) { return p && p !== '.' && p !== '..'; });
        return parts.join('/');
    };
    SamsungSyncService.prototype.getBinaryPayloadMap = function (binaryIds) {
        return __awaiter(this, void 0, void 0, function () {
            var rows, map, _i, rows_1, row;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (binaryIds.length === 0)
                            return [2 /*return*/, new Map()];
                        return [4 /*yield*/, this.db.query("\n      SELECT id, csv_data\n        FROM binary_collections\n       WHERE id = ANY($1::uuid[])\n      ", [binaryIds])];
                    case 1:
                        rows = _a.sent();
                        map = new Map();
                        for (_i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
                            row = rows_1[_i];
                            if ((row === null || row === void 0 ? void 0 : row.id) && (row === null || row === void 0 ? void 0 : row.csv_data)) {
                                map.set(row.id, Buffer.from(row.csv_data));
                            }
                        }
                        return [2 /*return*/, map];
                }
            });
        });
    };
    SamsungSyncService.prototype.parseIdentifierRange = function (raw) {
        if (!raw)
            return null;
        var digits = raw.replace(/\D/g, '');
        if (!digits)
            return null;
        var parsed = Number(digits);
        return Number.isFinite(parsed) ? parsed : null;
    };
    SamsungSyncService.prototype.normalizeFilters = function (filters) {
        var _a, _b, _c, _d;
        return {
            patientStart: ((_a = filters === null || filters === void 0 ? void 0 : filters.patientStart) === null || _a === void 0 ? void 0 : _a.trim()) || undefined,
            patientEnd: ((_b = filters === null || filters === void 0 ? void 0 : filters.patientEnd) === null || _b === void 0 ? void 0 : _b.trim()) || undefined,
            dateStart: ((_c = filters === null || filters === void 0 ? void 0 : filters.dateStart) === null || _c === void 0 ? void 0 : _c.trim()) || undefined,
            dateEnd: ((_d = filters === null || filters === void 0 ? void 0 : filters.dateEnd) === null || _d === void 0 ? void 0 : _d.trim()) || undefined,
        };
    };
    SamsungSyncService.prototype.appendRunItem = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0: return [4 /*yield*/, this.syncRunItemRepository.save(this.syncRunItemRepository.create({
                            run_id: params.runId,
                            patient_id: (_a = params.patientId) !== null && _a !== void 0 ? _a : null,
                            binary_collection_id: (_b = params.collectionId) !== null && _b !== void 0 ? _b : null,
                            action: params.action,
                            artifact_repo: params.repo,
                            artifact_path: params.path,
                            sha256: (_c = params.sha256) !== null && _c !== void 0 ? _c : null,
                            uploaded: Boolean(params.uploaded),
                            message: (_d = params.message) !== null && _d !== void 0 ? _d : null,
                            error_message: (_e = params.error) !== null && _e !== void 0 ? _e : null,
                        }))];
                    case 1:
                        _f.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SamsungSyncService.prototype.getPendingSummary = function () {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.query("\n      WITH pending_bc AS (\n        SELECT\n          bc.patient_cpf_hash,\n          COUNT(*)::int AS pending_files\n        FROM binary_collections bc\n        WHERE (bc.file_sync_pending = TRUE OR bc.deleted_pending = TRUE)\n          AND NOT binary_collection_is_samsung_speech_excluded(bc.task_id, bc.metadata)\n        GROUP BY bc.patient_cpf_hash\n      ),\n      pending_pdf AS (\n        SELECT\n          q.patient_id,\n          COUNT(*)::int AS pending_pdf_reports\n        FROM pdf_reports pr\n        JOIN questionnaires q ON q.id = pr.questionnaire_id\n        WHERE pr.file_sync_pending = TRUE\n          AND NOT pdf_report_is_samsung_psg_laudo_excluded(\n            pr.report_type, pr.file_name, pr.mime_type\n          )\n        GROUP BY q.patient_id\n      )\n      SELECT\n        p.id,\n        p.full_name,\n        p.public_identifier,\n        p.sync_pending,\n        p.sync_pending_at,\n        p.synced_at,\n        COALESCE(pb.pending_files, 0)::int AS pending_files,\n        COALESCE(pp.pending_pdf_reports, 0)::int AS pending_pdf_reports,\n        (\n          p.synced_at IS NOT NULL\n          AND COALESCE(pb.pending_files, 0) = 0\n          AND COALESCE(pp.pending_pdf_reports, 0) = 0\n        ) AS is_bart_synced\n      FROM patients p\n      LEFT JOIN pending_bc pb ON pb.patient_cpf_hash = p.cpf_hash\n      LEFT JOIN pending_pdf pp ON pp.patient_id = p.id\n      WHERE UPPER(COALESCE(p.public_identifier, '')) NOT IN ('P000', 'P00')\n      ORDER BY\n        (\n          p.sync_pending = TRUE\n          OR p.synced_at IS NULL\n          OR COALESCE(pb.pending_files, 0) > 0\n          OR COALESCE(pp.pending_pdf_reports, 0) > 0\n        ) DESC,\n        p.sync_pending DESC,\n        p.sync_pending_at ASC NULLS LAST,\n        p.synced_at DESC NULLS LAST\n    ")];
                    case 1:
                        rows = _a.sent();
                        return [2 /*return*/, rows];
                }
            });
        });
    };
    SamsungSyncService.prototype.getHistory = function () {
        return __awaiter(this, arguments, void 0, function (limit) {
            var runs;
            if (limit === void 0) { limit = 20; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.syncRunRepository.find({
                            order: { started_at: 'DESC' },
                            take: Math.min(Math.max(limit, 1), 100),
                        })];
                    case 1:
                        runs = _a.sent();
                        return [2 /*return*/, runs];
                }
            });
        });
    };
    SamsungSyncService.prototype.getRunStatus = function (runId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.syncRunRepository.findOne({ where: { id: runId } })];
            });
        });
    };
    SamsungSyncService.prototype.getDirectoryTree = function () {
        return __awaiter(this, arguments, void 0, function (limit) {
            var items;
            if (limit === void 0) { limit = 500; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.syncRunItemRepository.find({
                            order: { created_at: 'DESC' },
                            take: Math.min(Math.max(limit, 10), 2000),
                        })];
                    case 1:
                        items = _a.sent();
                        return [2 /*return*/, items.map(function (item) { return ({
                                run_id: item.run_id,
                                action: item.action,
                                repo: item.artifact_repo,
                                path: item.artifact_path,
                                uploaded: item.uploaded,
                                created_at: item.created_at,
                                sha256: item.sha256,
                                error_message: item.error_message,
                            }); })];
                }
            });
        });
    };
    SamsungSyncService.prototype.patientHadPriorBartSync = function (patient) {
        var v = patient.synced_at;
        if (v == null)
            return false;
        if (typeof v === 'string')
            return v.trim().length > 0;
        if (v instanceof Date)
            return !Number.isNaN(v.getTime());
        return true;
    };
    SamsungSyncService.prototype.getPendingPatients = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var normalized, patientStart, patientEnd, rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        normalized = this.normalizeFilters(filters);
                        patientStart = this.parseIdentifierRange(normalized.patientStart);
                        patientEnd = this.parseIdentifierRange(normalized.patientEnd);
                        if (patientStart != null &&
                            patientEnd != null &&
                            Number.isFinite(patientStart) &&
                            Number.isFinite(patientEnd) &&
                            patientStart > patientEnd) {
                            throw new Error('Faixa de pacientes inválida: início maior que o fim.');
                        }
                        if (normalized.dateStart && normalized.dateEnd && normalized.dateStart > normalized.dateEnd) {
                            throw new Error('Faixa de datas inválida: início maior que o fim.');
                        }
                        return [4 /*yield*/, this.db.query("\n      SELECT\n        p.id,\n        p.full_name,\n        p.public_identifier,\n        p.sync_version,\n        p.sync_pending_at,\n        p.synced_at,\n        COALESCE(\n          json_agg(\n            json_build_object(\n              'id', bc.id,\n              'patient_cpf_hash', bc.patient_cpf_hash,\n              'metadata', bc.metadata,\n              'file_hash', bc.file_hash,\n              'file_sync_pending', bc.file_sync_pending,\n              'deleted_pending', bc.deleted_pending,\n              'collected_at', bc.collected_at\n            )\n          ) FILTER (\n            WHERE bc.id IS NOT NULL\n              AND (\n                bc.file_sync_pending = TRUE\n                OR bc.deleted_pending = TRUE\n              )\n          ),\n          '[]'::json\n        ) AS files\n      FROM patients p\n      LEFT JOIN binary_collections bc ON bc.patient_cpf_hash = p.cpf_hash\n        AND NOT binary_collection_is_samsung_speech_excluded(bc.task_id, bc.metadata)\n      WHERE UPPER(COALESCE(p.public_identifier, '')) NOT IN ('P000', 'P00')\n        AND (\n          p.synced_at IS NULL\n          OR EXISTS (\n            SELECT 1\n              FROM binary_collections bc2\n             WHERE bc2.patient_cpf_hash = p.cpf_hash\n               AND NOT binary_collection_is_samsung_speech_excluded(bc2.task_id, bc2.metadata)\n               AND (bc2.file_sync_pending = TRUE OR bc2.deleted_pending = TRUE)\n          )\n          OR EXISTS (\n            SELECT 1\n              FROM pdf_reports pr2\n              JOIN questionnaires q2 ON q2.id = pr2.questionnaire_id\n             WHERE q2.patient_id = p.id\n               AND pr2.file_sync_pending = TRUE\n               AND NOT pdf_report_is_samsung_psg_laudo_excluded(\n                 pr2.report_type, pr2.file_name, pr2.mime_type\n               )\n          )\n        )\n        AND ($1::int IS NULL OR COALESCE(NULLIF(regexp_replace(p.public_identifier, '\\D', '', 'g'), ''), '0')::int >= $1::int)\n        AND ($2::int IS NULL OR COALESCE(NULLIF(regexp_replace(p.public_identifier, '\\D', '', 'g'), ''), '0')::int <= $2::int)\n        AND ($3::date IS NULL OR DATE(COALESCE(p.sync_pending_at, p.synced_at, NOW())) >= $3::date)\n        AND ($4::date IS NULL OR DATE(COALESCE(p.sync_pending_at, p.synced_at, NOW())) <= $4::date)\n      GROUP BY p.id\n      ORDER BY p.sync_pending_at ASC NULLS LAST\n    ", [patientStart, patientEnd, normalized.dateStart || null, normalized.dateEnd || null])];
                    case 1:
                        rows = _a.sent();
                        return [2 /*return*/, rows.map(function (row) { return (__assign(__assign({}, row), { files: Array.isArray(row.files) ? row.files : [] })); })];
                }
            });
        });
    };
    SamsungSyncService.prototype.createRun = function (triggeredByUserId, triggerType) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.syncRunRepository.save(this.syncRunRepository.create({
                        status: samsung_sync_run_entity_1.SamsungSyncRunStatus.RUNNING,
                        triggered_by_user_id: triggeredByUserId,
                        trigger_type: triggerType,
                    }))];
            });
        });
    };
    SamsungSyncService.prototype.runSyncAsync = function (triggeredByUserId_1) {
        return __awaiter(this, arguments, void 0, function (triggeredByUserId, triggerType, filters) {
            var existing, run;
            var _this = this;
            if (triggerType === void 0) { triggerType = 'manual'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findActiveRunningRun()];
                    case 1:
                        existing = _a.sent();
                        if (existing) {
                            this.logger.warn("Sync Samsung j\u00E1 em execu\u00E7\u00E3o (run ".concat(existing.id, "); reutilizando run existente."));
                            return [2 /*return*/, { run_id: existing.id, status: 'running', alreadyRunning: true }];
                        }
                        this.logger.log("Iniciando runSyncAsync. triggerType=".concat(triggerType, " userId=").concat(triggeredByUserId !== null && triggeredByUserId !== void 0 ? triggeredByUserId : 'n/a'));
                        return [4 /*yield*/, this.createRun(triggeredByUserId, triggerType)];
                    case 2:
                        run = _a.sent();
                        this.cancelledRunIds.delete(run.id);
                        setTimeout(function () {
                            void _this.executeRun(run, filters).catch(function (error) {
                                var message = error instanceof Error ? error.message : 'Erro desconhecido';
                                if (/cancelada manualmente/i.test(message)) {
                                    _this.logger.warn("Run ".concat(run.id, " interrompida por cancelamento manual."));
                                    return;
                                }
                                _this.logger.error("Falha n\u00E3o tratada na execu\u00E7\u00E3o ass\u00EDncrona ".concat(run.id, ": ").concat(message));
                            });
                        }, 0);
                        return [2 /*return*/, { run_id: run.id, status: 'running' }];
                }
            });
        });
    };
    SamsungSyncService.prototype.runSync = function (triggeredByUserId_1) {
        return __awaiter(this, arguments, void 0, function (triggeredByUserId, triggerType, filters) {
            var existing, run;
            if (triggerType === void 0) { triggerType = 'manual'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findActiveRunningRun()];
                    case 1:
                        existing = _a.sent();
                        if (existing) {
                            throw new Error("J\u00E1 existe sync Samsung em execu\u00E7\u00E3o: ".concat(existing.id));
                        }
                        this.logger.log("Iniciando runSync. triggerType=".concat(triggerType, " userId=").concat(triggeredByUserId !== null && triggeredByUserId !== void 0 ? triggeredByUserId : 'n/a'));
                        return [4 /*yield*/, this.createRun(triggeredByUserId, triggerType)];
                    case 2:
                        run = _a.sent();
                        this.cancelledRunIds.delete(run.id);
                        return [2 /*return*/, this.executeRun(run, filters)];
                }
            });
        });
    };
    SamsungSyncService.prototype.cancelRun = function (runId, requestedByUserId) {
        return __awaiter(this, void 0, void 0, function () {
            var run, runSummary, summary, syncFilters, reset, error_4, message, zipPath;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.syncRunRepository.findOne({ where: { id: runId } })];
                    case 1:
                        run = _b.sent();
                        if (!run) {
                            throw new Error('Execução de sincronização não encontrada');
                        }
                        if (run.status !== samsung_sync_run_entity_1.SamsungSyncRunStatus.RUNNING) {
                            return [2 /*return*/, {
                                    run_id: runId,
                                    status: run.status,
                                    cancelled: false,
                                    reset: { patients: 0, binary_collections: 0, pdf_reports: 0 },
                                }];
                        }
                        this.cancelledRunIds.add(runId);
                        (_a = this.runAbortControllers.get(runId)) === null || _a === void 0 ? void 0 : _a.abort();
                        runSummary = (run.summary || {});
                        summary = __assign(__assign({}, runSummary), { currentStep: 'Cancelamento solicitado pelo usuário', cancelRequestedAt: new Date().toISOString(), cancelRequestedBy: requestedByUserId || null });
                        syncFilters = runSummary.syncFilters || {};
                        reset = { patients: 0, binary_collections: 0, pdf_reports: 0 };
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.resetSyncPending(syncFilters)];
                    case 3:
                        reset = _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _b.sent();
                        message = error_4 instanceof Error ? error_4.message : String(error_4);
                        this.logger.warn("Run ".concat(runId, ": falha ao redefinir pend\u00EAncias ap\u00F3s cancelamento: ").concat(message));
                        return [3 /*break*/, 5];
                    case 5:
                        zipPath = typeof runSummary.zipPath === 'string' && runSummary.zipPath.trim()
                            ? runSummary.zipPath.trim()
                            : null;
                        if (!zipPath) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.artifactoryService.deleteFile(this.repoZip, zipPath).catch(function (error) {
                                var message = error instanceof Error ? error.message : String(error);
                                _this.logger.warn("Run ".concat(runId, ": n\u00E3o foi poss\u00EDvel remover ZIP parcial (").concat(zipPath, "): ").concat(message));
                            })];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: return [4 /*yield*/, (0, samsung_dataset_utils_1.cleanupSamsungSyncTempDir)(runId)];
                    case 8:
                        _b.sent();
                        this.runAbortControllers.delete(runId);
                        return [4 /*yield*/, this.syncRunRepository.update(runId, {
                                status: samsung_sync_run_entity_1.SamsungSyncRunStatus.FAILED,
                                finished_at: new Date(),
                                error_message: 'Cancelado pelo usuário',
                                summary: summary,
                            })];
                    case 9:
                        _b.sent();
                        this.logger.warn("Run ".concat(runId, " cancelado. Pend\u00EAncias redefinidas: ").concat(reset.patients, " paciente(s)."));
                        return [2 /*return*/, { run_id: runId, status: 'failed', cancelled: true, reset: reset }];
                }
            });
        });
    };
    SamsungSyncService.prototype.ensureRunNotCancelled = function (runId) {
        if (this.cancelledRunIds.has(runId)) {
            throw new Error('Execução cancelada manualmente');
        }
    };
    SamsungSyncService.prototype.updateRunProgress = function (runId, summary) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.syncRunRepository.update(runId, {
                            total_patients: summary.totalPatients,
                            synced_patients: summary.syncedPatients,
                            errored_patients: summary.erroredPatients,
                            uploaded_files: summary.uploadedFiles,
                            skipped_files: summary.skippedFiles,
                            deleted_files: summary.deletedFiles,
                            error_files: summary.errorFiles,
                            summary: summary,
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SamsungSyncService.prototype.executeRun = function (run, filters) {
        return __awaiter(this, void 0, void 0, function () {
            var runAbort, normalizedFilters, summary, setCurrentStep, heartbeatTimer, startHeartbeat, stopHeartbeat, connectivity, patients, runPatientIds, patientsReadyForConfirm, pdfReportIdsByPatient, deliveryDate, zipName, zipArtifactPath, metadataRows, syncTempDir_1, _a, archive, archiveFinished, zipFilePath, minioDownloadLimit, questionnaireIds, exportedBySubject, _i, questionnaireIds_1, questionnaireId, item, publicId, subjectId, current, _b, _c, _d, subjectId, items, speechSkipCountedIds, minioConnectivity, projectInfoEntry, _e, patients_1, patient, patientHasCriticalError, patientEverSynced, subjectId, subjectExportItems, pdfTempPathByReportId, _f, subjectExportItems_1, exportedItem, _loop_3, this_2, _g, _h, report, dbPdfReports, synthetic, _loop_4, this_3, _j, dbPdfReports_1, report, exportItemsForPack, seenBinaryIds, _k, exportItemsForPack_1, item, _l, _m, bc, pendingAsBinary, _o, _p, file, fileIsPending, allBinaryIds, binaryPayloadMap, _q, _r, file, artifactPath, freeLivingDiaryCsv, lines, err_1, packed, _s, _t, skippedId, _u, exportItemsForPack_2, item, _v, _w, collection, fileName, taskCode, _x, _y, reportId, set, error_5, message, runStatus, statusLabel, error_6, message, cancelled;
            var _this = this;
            var _z, _0, _1, _2;
            return __generator(this, function (_3) {
                switch (_3.label) {
                    case 0:
                        runAbort = new AbortController();
                        this.runAbortControllers.set(run.id, runAbort);
                        normalizedFilters = this.normalizeFilters(filters);
                        summary = {
                            totalPatients: 0,
                            syncedPatients: 0,
                            erroredPatients: 0,
                            uploadedFiles: 0,
                            skippedFiles: 0,
                            deletedFiles: 0,
                            errorFiles: 0,
                            zipName: null,
                            zipPath: null,
                            syncFilters: normalizedFilters,
                            currentStep: (0, samsung_dataset_utils_1.samsungStep)(0),
                            currentStepIndex: 0,
                            stepLabels: samsung_dataset_utils_1.SAMSUNG_SYNC_PROGRESS_STEPS,
                            lastHeartbeatAt: new Date().toISOString(),
                        };
                        setCurrentStep = function (stepIndex, customMessage) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        summary.currentStepIndex = stepIndex;
                                        summary.currentStep = customMessage || (0, samsung_dataset_utils_1.samsungStep)(stepIndex);
                                        summary.lastHeartbeatAt = new Date().toISOString();
                                        return [4 /*yield*/, this.updateRunProgress(run.id, summary)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        heartbeatTimer = null;
                        startHeartbeat = function () {
                            heartbeatTimer = setInterval(function () {
                                summary.lastHeartbeatAt = new Date().toISOString();
                                void _this.updateRunProgress(run.id, summary).catch(function (error) {
                                    var message = error instanceof Error ? error.message : String(error);
                                    _this.logger.warn("Run ".concat(run.id, ": falha no heartbeat: ").concat(message));
                                });
                            }, 10000);
                        };
                        stopHeartbeat = function () {
                            if (heartbeatTimer) {
                                clearInterval(heartbeatTimer);
                                heartbeatTimer = null;
                            }
                        };
                        _3.label = 1;
                    case 1:
                        _3.trys.push([1, 72, 74, 76]);
                        return [4 /*yield*/, this.syncRunRepository.update(run.id, { summary: summary })];
                    case 2:
                        _3.sent();
                        return [4 /*yield*/, setCurrentStep(0)];
                    case 3:
                        _3.sent();
                        startHeartbeat();
                        this.ensureRunNotCancelled(run.id);
                        return [4 /*yield*/, this.validateBartConnectivityQuick(5000)];
                    case 4:
                        connectivity = _3.sent();
                        if (!(!connectivity.ok && connectivity.warning)) return [3 /*break*/, 6];
                        this.logger.warn("Run ".concat(run.id, ": ").concat(connectivity.warning));
                        return [4 /*yield*/, this.appendRunItem({
                                runId: run.id,
                                action: samsung_sync_run_item_entity_1.SamsungSyncItemAction.SKIP,
                                repo: this.repoZip,
                                path: this.basePath,
                                uploaded: false,
                                message: connectivity.warning,
                            })];
                    case 5:
                        _3.sent();
                        _3.label = 6;
                    case 6: return [4 /*yield*/, setCurrentStep(0, 'Listando pacientes pendentes')];
                    case 7:
                        _3.sent();
                        return [4 /*yield*/, this.getPendingPatients(filters)];
                    case 8:
                        patients = _3.sent();
                        this.ensureRunNotCancelled(run.id);
                        summary.totalPatients = patients.length;
                        return [4 /*yield*/, this.updateRunProgress(run.id, summary)];
                    case 9:
                        _3.sent();
                        this.logger.log("Run ".concat(run.id, ": ").concat(patients.length, " paciente(s) pendente(s) para sincroniza\u00E7\u00E3o"));
                        if (!(patients.length === 0)) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.syncRunRepository.update(run.id, {
                                status: samsung_sync_run_entity_1.SamsungSyncRunStatus.SUCCESS,
                                finished_at: new Date(),
                                total_patients: 0,
                                synced_patients: 0,
                                errored_patients: 0,
                                uploaded_files: 0,
                                skipped_files: 0,
                                deleted_files: 0,
                                error_files: 0,
                                summary: summary,
                            })];
                    case 10:
                        _3.sent();
                        return [2 /*return*/, { run_id: run.id, status: 'success', summary: summary }];
                    case 11:
                        runPatientIds = new Set();
                        patientsReadyForConfirm = [];
                        pdfReportIdsByPatient = new Map();
                        deliveryDate = (0, samsung_dataset_utils_1.getDeliveryDateFolder)();
                        zipName = this.buildDeliveryZipName(deliveryDate);
                        summary.zipName = zipName;
                        zipArtifactPath = (0, samsung_dataset_utils_1.buildDataZipArtifactPath)(this.basePath, deliveryDate);
                        summary.zipPath = zipArtifactPath;
                        metadataRows = [];
                        return [4 /*yield*/, (0, samsung_dataset_utils_1.ensureSamsungSyncTempDir)(run.id)];
                    case 12:
                        syncTempDir_1 = _3.sent();
                        _a = (0, samsung_dataset_utils_1.openDeliveryZipWriter)(run.id), archive = _a.archive, archiveFinished = _a.finished, zipFilePath = _a.filePath;
                        minioDownloadLimit = pLimit(2);
                        return [4 /*yield*/, setCurrentStep(1)];
                    case 13:
                        _3.sent();
                        return [4 /*yield*/, this.questionnairesService.listQuestionnaireIdsForExport(filters)];
                    case 14:
                        questionnaireIds = _3.sent();
                        exportedBySubject = new Map();
                        _i = 0, questionnaireIds_1 = questionnaireIds;
                        _3.label = 15;
                    case 15:
                        if (!(_i < questionnaireIds_1.length)) return [3 /*break*/, 18];
                        questionnaireId = questionnaireIds_1[_i];
                        this.ensureRunNotCancelled(run.id);
                        return [4 /*yield*/, this.questionnairesService.exportQuestionnaireData(questionnaireId)];
                    case 16:
                        item = (_3.sent());
                        publicId = ((_0 = (_z = item === null || item === void 0 ? void 0 : item.questionnaire) === null || _z === void 0 ? void 0 : _z.patient) === null || _0 === void 0 ? void 0 : _0.public_identifier) ||
                            ((_1 = item === null || item === void 0 ? void 0 : item.questionnaire) === null || _1 === void 0 ? void 0 : _1.public_identifier) ||
                            '';
                        if (this.isSamsungExcludedPublicIdentifier(publicId))
                            return [3 /*break*/, 17];
                        subjectId = this.toSubjectId(publicId);
                        current = exportedBySubject.get(subjectId) || [];
                        current.push(item);
                        exportedBySubject.set(subjectId, current);
                        _3.label = 17;
                    case 17:
                        _i++;
                        return [3 /*break*/, 15];
                    case 18:
                        this.ensureRunNotCancelled(run.id);
                        for (_b = 0, _c = exportedBySubject.entries(); _b < _c.length; _b++) {
                            _d = _c[_b], subjectId = _d[0], items = _d[1];
                            items.sort(function (a, b) {
                                var _a, _b;
                                var aTs = new Date(((_a = a === null || a === void 0 ? void 0 : a.questionnaire) === null || _a === void 0 ? void 0 : _a.createdAt) || 0).getTime();
                                var bTs = new Date(((_b = b === null || b === void 0 ? void 0 : b.questionnaire) === null || _b === void 0 ? void 0 : _b.createdAt) || 0).getTime();
                                return aTs - bTs;
                            });
                            exportedBySubject.set(subjectId, items);
                        }
                        speechSkipCountedIds = new Set();
                        return [4 /*yield*/, this.validateMinioConnectivityQuick(8000)];
                    case 19:
                        minioConnectivity = _3.sent();
                        if (!(!minioConnectivity.ok && minioConnectivity.warning)) return [3 /*break*/, 21];
                        this.logger.warn("[Run ".concat(run.id, "] ").concat(minioConnectivity.warning));
                        return [4 /*yield*/, this.appendRunItem({
                                runId: run.id,
                                action: samsung_sync_run_item_entity_1.SamsungSyncItemAction.SKIP,
                                repo: this.repoZip,
                                path: this.basePath,
                                uploaded: false,
                                message: minioConnectivity.warning,
                            })];
                    case 20:
                        _3.sent();
                        _3.label = 21;
                    case 21:
                        projectInfoEntry = (0, export_guidelines_1.buildGuidelinesProjectInfoEntry)();
                        archive.append(projectInfoEntry.buffer, { name: projectInfoEntry.zipPath });
                        this.registerDeliveryMetadataEntry(metadataRows, deliveryDate, projectInfoEntry.zipPath, deliveryDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
                        summary.uploadedFiles += 1;
                        return [4 /*yield*/, this.appendRunItem({
                                runId: run.id,
                                action: samsung_sync_run_item_entity_1.SamsungSyncItemAction.METADATA,
                                repo: this.repoZip,
                                path: projectInfoEntry.zipPath,
                                uploaded: false,
                                message: 'project_info.md incluído no ZIP Guidelines',
                            })];
                    case 22:
                        _3.sent();
                        _e = 0, patients_1 = patients;
                        _3.label = 23;
                    case 23:
                        if (!(_e < patients_1.length)) return [3 /*break*/, 61];
                        patient = patients_1[_e];
                        this.ensureRunNotCancelled(run.id);
                        if (this.isSamsungExcludedPublicIdentifier(patient.public_identifier))
                            return [3 /*break*/, 60];
                        runPatientIds.add(patient.id);
                        _3.label = 24;
                    case 24:
                        _3.trys.push([24, 57, , 60]);
                        patientHasCriticalError = false;
                        patientEverSynced = this.patientHadPriorBartSync(patient);
                        subjectId = this.toSubjectId(patient.public_identifier);
                        subjectExportItems = (exportedBySubject.get(subjectId) ||
                            []);
                        return [4 /*yield*/, setCurrentStep(2, "".concat((0, samsung_dataset_utils_1.samsungStep)(2), " (").concat(subjectId, ")"))];
                    case 25:
                        _3.sent();
                        return [4 /*yield*/, setCurrentStep(3, "".concat((0, samsung_dataset_utils_1.samsungStep)(3), " (").concat(subjectId, ")"))];
                    case 26:
                        _3.sent();
                        pdfTempPathByReportId = new Map();
                        _f = 0, subjectExportItems_1 = subjectExportItems;
                        _3.label = 27;
                    case 27:
                        if (!(_f < subjectExportItems_1.length)) return [3 /*break*/, 32];
                        exportedItem = subjectExportItems_1[_f];
                        _loop_3 = function (report) {
                            var pdfPath, pdfFilePath;
                            return __generator(this, function (_4) {
                                switch (_4.label) {
                                    case 0:
                                        this_2.ensureRunNotCancelled(run.id);
                                        if (patientEverSynced &&
                                            report.file_sync_pending !== true) {
                                            return [2 /*return*/, "continue"];
                                        }
                                        if (!this_2.isExcludedPsgLaudo(report)) return [3 /*break*/, 2];
                                        summary.skippedFiles += 1;
                                        return [4 /*yield*/, this_2.appendRunItem({
                                                runId: run.id,
                                                patientId: patient.id,
                                                action: samsung_sync_run_item_entity_1.SamsungSyncItemAction.SKIP,
                                                repo: this_2.repoZip,
                                                path: (report === null || report === void 0 ? void 0 : report.file_name) || 'laudo.pdf',
                                                uploaded: false,
                                                message: 'Laudo PDF de polissonografia excluído da entrega Guidelines (dados pessoais)',
                                            })];
                                    case 1:
                                        _4.sent();
                                        return [2 /*return*/, "continue"];
                                    case 2:
                                        pdfPath = report === null || report === void 0 ? void 0 : report.file_path;
                                        if (!pdfPath || !(report === null || report === void 0 ? void 0 : report.id))
                                            return [2 /*return*/, "continue"];
                                        return [4 /*yield*/, minioDownloadLimit(function () {
                                                return _this.downloadMinioToTempFile(syncTempDir_1, pdfPath);
                                            })];
                                    case 3:
                                        pdfFilePath = _4.sent();
                                        if (!!pdfFilePath) return [3 /*break*/, 5];
                                        patientHasCriticalError = true;
                                        summary.errorFiles += 1;
                                        return [4 /*yield*/, this_2.appendRunItem({
                                                runId: run.id,
                                                patientId: patient.id,
                                                action: samsung_sync_run_item_entity_1.SamsungSyncItemAction.ERROR,
                                                repo: this_2.repoZip,
                                                path: report.file_name || 'relatorio.pdf',
                                                uploaded: false,
                                                error: 'Falha ao baixar PDF do MinIO para inclusão no ZIP Guidelines.',
                                            })];
                                    case 4:
                                        _4.sent();
                                        return [2 /*return*/, "continue"];
                                    case 5:
                                        pdfTempPathByReportId.set(String(report.id), pdfFilePath);
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_2 = this;
                        _g = 0, _h = (exportedItem === null || exportedItem === void 0 ? void 0 : exportedItem.pdfReports) || [];
                        _3.label = 28;
                    case 28:
                        if (!(_g < _h.length)) return [3 /*break*/, 31];
                        report = _h[_g];
                        return [5 /*yield**/, _loop_3(report)];
                    case 29:
                        _3.sent();
                        _3.label = 30;
                    case 30:
                        _g++;
                        return [3 /*break*/, 28];
                    case 31:
                        _f++;
                        return [3 /*break*/, 27];
                    case 32:
                        if (!(subjectExportItems.length === 0)) return [3 /*break*/, 38];
                        return [4 /*yield*/, this.getPendingPdfReportsForPatient(patient.id, patientEverSynced)];
                    case 33:
                        dbPdfReports = _3.sent();
                        synthetic = {
                            questionnaire: {
                                public_identifier: patient.public_identifier,
                                patient: { public_identifier: patient.public_identifier },
                            },
                            csvFiles: {},
                            pdfReports: [],
                            binaryCollections: [],
                        };
                        _loop_4 = function (report) {
                            var dbPdfPath, pdfFilePath;
                            return __generator(this, function (_5) {
                                switch (_5.label) {
                                    case 0:
                                        if (this_3.isExcludedPsgLaudo(report)) {
                                            summary.skippedFiles += 1;
                                            return [2 /*return*/, "continue"];
                                        }
                                        dbPdfPath = report === null || report === void 0 ? void 0 : report.file_path;
                                        if (!dbPdfPath)
                                            return [2 /*return*/, "continue"];
                                        return [4 /*yield*/, minioDownloadLimit(function () {
                                                return _this.downloadMinioToTempFile(syncTempDir_1, dbPdfPath);
                                            })];
                                    case 1:
                                        pdfFilePath = _5.sent();
                                        if (!pdfFilePath) {
                                            patientHasCriticalError = true;
                                            summary.errorFiles += 1;
                                            return [2 /*return*/, "continue"];
                                        }
                                        pdfTempPathByReportId.set(String(report.id), pdfFilePath);
                                        synthetic.pdfReports.push({
                                            id: report.id,
                                            report_type: report.report_type,
                                            file_name: report.file_name,
                                            file_path: report.file_path,
                                            file_sync_pending: true,
                                            mime_type: report.mime_type,
                                        });
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_3 = this;
                        _j = 0, dbPdfReports_1 = dbPdfReports;
                        _3.label = 34;
                    case 34:
                        if (!(_j < dbPdfReports_1.length)) return [3 /*break*/, 37];
                        report = dbPdfReports_1[_j];
                        return [5 /*yield**/, _loop_4(report)];
                    case 35:
                        _3.sent();
                        _3.label = 36;
                    case 36:
                        _j++;
                        return [3 /*break*/, 34];
                    case 37:
                        if ((synthetic.pdfReports || []).length > 0) {
                            subjectExportItems.push(synthetic);
                        }
                        _3.label = 38;
                    case 38: return [4 /*yield*/, setCurrentStep(4, "".concat((0, samsung_dataset_utils_1.samsungStep)(4), " (").concat(subjectId, ")"))];
                    case 39:
                        _3.sent();
                        exportItemsForPack = subjectExportItems.map(function (item) { return (__assign(__assign({}, item), { binaryCollections: __spreadArray([], (item.binaryCollections || []), true) })); });
                        if (exportItemsForPack.length === 0) {
                            exportItemsForPack.push({
                                questionnaire: {
                                    public_identifier: patient.public_identifier,
                                    patient: { public_identifier: patient.public_identifier },
                                },
                                csvFiles: {},
                                pdfReports: [],
                                binaryCollections: [],
                            });
                        }
                        seenBinaryIds = new Set();
                        for (_k = 0, exportItemsForPack_1 = exportItemsForPack; _k < exportItemsForPack_1.length; _k++) {
                            item = exportItemsForPack_1[_k];
                            for (_l = 0, _m = item.binaryCollections || []; _l < _m.length; _l++) {
                                bc = _m[_l];
                                if (bc === null || bc === void 0 ? void 0 : bc.id)
                                    seenBinaryIds.add(bc.id);
                            }
                        }
                        pendingAsBinary = [];
                        for (_o = 0, _p = patient.files || []; _o < _p.length; _o++) {
                            file = _p[_o];
                            if (!(file === null || file === void 0 ? void 0 : file.id) || seenBinaryIds.has(file.id))
                                continue;
                            fileIsPending = file.deleted_pending === true || file.file_sync_pending === true;
                            if (patientEverSynced && !fileIsPending)
                                continue;
                            pendingAsBinary.push({
                                id: file.id,
                                metadata: file.metadata,
                                collected_at: file.collected_at,
                                file_sync_pending: file.file_sync_pending,
                                deleted_pending: file.deleted_pending,
                            });
                        }
                        exportItemsForPack[0].binaryCollections = __spreadArray(__spreadArray([], (exportItemsForPack[0].binaryCollections || []), true), pendingAsBinary, true);
                        allBinaryIds = exportItemsForPack
                            .flatMap(function (i) { return i.binaryCollections || []; })
                            .map(function (b) { return b.id; })
                            .filter(Boolean);
                        return [4 /*yield*/, this.getBinaryPayloadMap(allBinaryIds)];
                    case 40:
                        binaryPayloadMap = _3.sent();
                        _q = 0, _r = patient.files || [];
                        _3.label = 41;
                    case 41:
                        if (!(_q < _r.length)) return [3 /*break*/, 44];
                        file = _r[_q];
                        if (!file.deleted_pending)
                            return [3 /*break*/, 43];
                        artifactPath = this.getCollectionPath(patient, file, deliveryDate, true);
                        summary.deletedFiles += 1;
                        return [4 /*yield*/, this.appendRunItem({
                                runId: run.id,
                                patientId: patient.id,
                                collectionId: file.id,
                                action: samsung_sync_run_item_entity_1.SamsungSyncItemAction.DELETE,
                                repo: this.repoCollections,
                                path: artifactPath || file.id,
                                uploaded: false,
                                message: 'Arquivo marcado para remoção — será excluído ao confirmar entrega',
                            })];
                    case 42:
                        _3.sent();
                        _3.label = 43;
                    case 43:
                        _q++;
                        return [3 /*break*/, 41];
                    case 44:
                        freeLivingDiaryCsv = null;
                        _3.label = 45;
                    case 45:
                        _3.trys.push([45, 47, , 48]);
                        return [4 /*yield*/, this.freelivingService.buildDiaryQuestionnaireCsvForPatient(patient.id, patient.public_identifier)];
                    case 46:
                        freeLivingDiaryCsv =
                            _3.sent();
                        lines = (freeLivingDiaryCsv || '').trim().split('\n');
                        if (lines.length <= 1)
                            freeLivingDiaryCsv = null;
                        return [3 /*break*/, 48];
                    case 47:
                        err_1 = _3.sent();
                        this.logger.warn("Run ".concat(run.id, ": falha ao montar di\u00E1rio Free Living de ").concat(subjectId, ": ").concat(err_1 instanceof Error ? err_1.message : String(err_1)));
                        return [3 /*break*/, 48];
                    case 48:
                        packed = (0, export_guidelines_1.buildGuidelinesPatientEntries)({
                            publicIdentifier: patient.public_identifier,
                            exportItems: exportItemsForPack,
                            binaryPayloadById: binaryPayloadMap,
                            pdfTempPathByReportId: pdfTempPathByReportId,
                            freeLivingDiaryCsv: freeLivingDiaryCsv,
                            onlyPendingBinaries: true,
                            patientEverSynced: patientEverSynced,
                        });
                        for (_s = 0, _t = packed.skippedSpeechAudioIds; _s < _t.length; _s++) {
                            skippedId = _t[_s];
                            if (!speechSkipCountedIds.has(skippedId)) {
                                speechSkipCountedIds.add(skippedId);
                                summary.skippedFiles += 1;
                            }
                        }
                        _u = 0, exportItemsForPack_2 = exportItemsForPack;
                        _3.label = 49;
                    case 49:
                        if (!(_u < exportItemsForPack_2.length)) return [3 /*break*/, 54];
                        item = exportItemsForPack_2[_u];
                        _v = 0, _w = item.binaryCollections || [];
                        _3.label = 50;
                    case 50:
                        if (!(_v < _w.length)) return [3 /*break*/, 53];
                        collection = _w[_v];
                        if (collection.deleted_pending)
                            return [3 /*break*/, 52];
                        if (patientEverSynced &&
                            collection.file_sync_pending !== true) {
                            return [3 /*break*/, 52];
                        }
                        fileName = (((_2 = collection === null || collection === void 0 ? void 0 : collection.metadata) === null || _2 === void 0 ? void 0 : _2.file_name) || '').toString();
                        taskCode = this.resolveTaskCode(collection.metadata, collection.active_task, fileName);
                        if (!(0, export_guidelines_1.shouldIncludeSpeechBinary)(taskCode, fileName))
                            return [3 /*break*/, 52];
                        if (packed.includedCollectionIds.has(collection.id))
                            return [3 /*break*/, 52];
                        if (packed.skippedSpeechAudioIds.includes(collection.id))
                            return [3 /*break*/, 52];
                        if (!fileName)
                            return [3 /*break*/, 52];
                        if (!!binaryPayloadMap.get(collection.id)) return [3 /*break*/, 52];
                        patientHasCriticalError = true;
                        summary.errorFiles += 1;
                        return [4 /*yield*/, this.appendRunItem({
                                runId: run.id,
                                patientId: patient.id,
                                collectionId: collection.id,
                                action: samsung_sync_run_item_entity_1.SamsungSyncItemAction.ERROR,
                                repo: this.repoCollections,
                                path: fileName,
                                uploaded: false,
                                error: 'Payload da tarefa ativa não encontrado para inclusão no ZIP Guidelines',
                            })];
                    case 51:
                        _3.sent();
                        _3.label = 52;
                    case 52:
                        _v++;
                        return [3 /*break*/, 50];
                    case 53:
                        _u++;
                        return [3 /*break*/, 49];
                    case 54:
                        for (_x = 0, _y = packed.pdfReportIds; _x < _y.length; _x++) {
                            reportId = _y[_x];
                            set = pdfReportIdsByPatient.get(patient.id);
                            if (!set) {
                                set = new Set();
                                pdfReportIdsByPatient.set(patient.id, set);
                            }
                            set.add(reportId);
                        }
                        return [4 /*yield*/, this.appendGuidelinesEntries(run.id, patient.id, packed.entries, archive, metadataRows, deliveryDate, summary)];
                    case 55:
                        _3.sent();
                        if (patientHasCriticalError) {
                            summary.erroredPatients += 1;
                        }
                        else {
                            summary.syncedPatients += 1;
                            patientsReadyForConfirm.push(patient.id);
                        }
                        this.logMem("Run ".concat(run.id, ": ").concat(subjectId, " processado (Guidelines)"));
                        return [4 /*yield*/, this.updateRunProgress(run.id, summary)];
                    case 56:
                        _3.sent();
                        return [3 /*break*/, 60];
                    case 57:
                        error_5 = _3.sent();
                        summary.erroredPatients += 1;
                        summary.errorFiles += 1;
                        message = error_5 instanceof Error ? error_5.message : 'Erro desconhecido';
                        return [4 /*yield*/, this.appendRunItem({
                                runId: run.id,
                                patientId: patient.id,
                                action: samsung_sync_run_item_entity_1.SamsungSyncItemAction.ERROR,
                                repo: this.repoZip,
                                path: this.basePath,
                                uploaded: false,
                                error: message,
                            })];
                    case 58:
                        _3.sent();
                        return [4 /*yield*/, this.updateRunProgress(run.id, summary)];
                    case 59:
                        _3.sent();
                        return [3 /*break*/, 60];
                    case 60:
                        _e++;
                        return [3 /*break*/, 23];
                    case 61: return [4 /*yield*/, setCurrentStep(5)];
                    case 62:
                        _3.sent();
                        this.ensureRunNotCancelled(run.id);
                        return [4 /*yield*/, archive.finalize()];
                    case 63:
                        _3.sent();
                        return [4 /*yield*/, archiveFinished];
                    case 64:
                        _3.sent();
                        summary.deliveryDate = deliveryDate;
                        summary.metadataRows = metadataRows;
                        summary.patientsReadyForConfirm = patientsReadyForConfirm;
                        return [4 /*yield*/, setCurrentStep(6)];
                    case 65:
                        _3.sent();
                        this.ensureRunNotCancelled(run.id);
                        return [4 /*yield*/, this.uploadZipAndMetadata(run, summary, zipFilePath, zipArtifactPath, zipName, metadataRows, deliveryDate, runAbort.signal)];
                    case 66:
                        _3.sent();
                        return [4 /*yield*/, setCurrentStep(7)];
                    case 67:
                        _3.sent();
                        this.ensureRunNotCancelled(run.id);
                        if (!(patientsReadyForConfirm.length > 0)) return [3 /*break*/, 69];
                        return [4 /*yield*/, this.confirmRunDelivery(patientsReadyForConfirm)];
                    case 68:
                        _3.sent();
                        _3.label = 69;
                    case 69: return [4 /*yield*/, setCurrentStep(8, 'Sincronização concluída')];
                    case 70:
                        _3.sent();
                        runStatus = summary.erroredPatients > 0 && patientsReadyForConfirm.length === 0
                            ? samsung_sync_run_entity_1.SamsungSyncRunStatus.FAILED
                            : samsung_sync_run_entity_1.SamsungSyncRunStatus.SUCCESS;
                        return [4 /*yield*/, this.syncRunRepository.update(run.id, {
                                status: runStatus,
                                finished_at: new Date(),
                                total_patients: summary.totalPatients,
                                synced_patients: patientsReadyForConfirm.length,
                                errored_patients: summary.erroredPatients,
                                uploaded_files: summary.uploadedFiles,
                                skipped_files: summary.skippedFiles,
                                deleted_files: summary.deletedFiles,
                                error_files: summary.errorFiles,
                                summary: summary,
                            })];
                    case 71:
                        _3.sent();
                        stopHeartbeat();
                        this.cancelledRunIds.delete(run.id);
                        statusLabel = runStatus === samsung_sync_run_entity_1.SamsungSyncRunStatus.SUCCESS ? 'success' : 'failed';
                        return [2 /*return*/, { run_id: run.id, status: statusLabel, summary: summary }];
                    case 72:
                        error_6 = _3.sent();
                        stopHeartbeat();
                        message = error_6 instanceof Error ? error_6.message : 'Erro desconhecido';
                        cancelled = this.cancelledRunIds.has(run.id) || /cancelad/i.test(message);
                        return [4 /*yield*/, this.syncRunRepository.update(run.id, {
                                status: samsung_sync_run_entity_1.SamsungSyncRunStatus.FAILED,
                                finished_at: new Date(),
                                total_patients: summary.totalPatients,
                                synced_patients: summary.syncedPatients,
                                errored_patients: summary.erroredPatients,
                                uploaded_files: summary.uploadedFiles,
                                skipped_files: summary.skippedFiles,
                                deleted_files: summary.deletedFiles,
                                error_files: cancelled ? summary.errorFiles : summary.errorFiles + 1,
                                summary: summary,
                                error_message: cancelled ? 'Cancelado pelo usuário' : message,
                            })];
                    case 73:
                        _3.sent();
                        this.cancelledRunIds.delete(run.id);
                        this.runAbortControllers.delete(run.id);
                        if (cancelled) {
                            return [2 /*return*/, { run_id: run.id, status: 'failed', summary: summary }];
                        }
                        throw error_6;
                    case 74:
                        this.runAbortControllers.delete(run.id);
                        return [4 /*yield*/, (0, samsung_dataset_utils_1.cleanupSamsungSyncTempDir)(run.id)];
                    case 75:
                        _3.sent();
                        return [7 /*endfinally*/];
                    case 76: return [2 /*return*/];
                }
            });
        });
    };
    SamsungSyncService.prototype.uploadZipAndMetadata = function (run, summary, zipFilePath, zipArtifactPath, zipName, metadataRows, deliveryDate, signal) {
        return __awaiter(this, void 0, void 0, function () {
            var zipStat, zipSha256, metadataCsvPath, metadataCsvBuffer, metadataCsvSha256;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, promises_1.stat)(zipFilePath)];
                    case 1:
                        zipStat = _a.sent();
                        this.logMem("Run ".concat(run.id, ": enviando ZIP ").concat(zipName, " para o BART"), zipStat.size);
                        return [4 /*yield*/, this.artifactoryService.uploadFileFromPath(this.repoZip, zipArtifactPath, zipFilePath, 'application/zip', 60 * 60 * 1000, signal)];
                    case 2:
                        zipSha256 = _a.sent();
                        return [4 /*yield*/, this.appendRunItem({
                                runId: run.id,
                                action: samsung_sync_run_item_entity_1.SamsungSyncItemAction.UPLOAD,
                                repo: this.repoZip,
                                path: zipArtifactPath,
                                sha256: zipSha256,
                                uploaded: true,
                                message: "ZIP de entrega ".concat(zipName, " enviado com sucesso"),
                            })];
                    case 3:
                        _a.sent();
                        metadataCsvPath = (0, samsung_dataset_utils_1.buildMetadataCsvArtifactPath)(this.basePath, deliveryDate);
                        metadataCsvBuffer = Buffer.from((0, samsung_dataset_utils_1.buildDeliveryMetadataCsv)(metadataRows), 'utf-8');
                        return [4 /*yield*/, this.artifactoryService.uploadFile(this.repoZip, metadataCsvPath, metadataCsvBuffer, 'text/csv')];
                    case 4:
                        metadataCsvSha256 = _a.sent();
                        return [4 /*yield*/, this.appendRunItem({
                                runId: run.id,
                                action: samsung_sync_run_item_entity_1.SamsungSyncItemAction.METADATA,
                                repo: this.repoZip,
                                path: metadataCsvPath,
                                sha256: metadataCsvSha256,
                                uploaded: true,
                                message: "CSV de metadata da entrega ".concat(deliveryDate, " enviado"),
                            })];
                    case 5:
                        _a.sent();
                        this.logMem("Run ".concat(run.id, ": ZIP e metadata enviados"));
                        return [2 /*return*/];
                }
            });
        });
    };
    SamsungSyncService.prototype.resumeZipUpload = function (run) {
        return __awaiter(this, void 0, void 0, function () {
            var summary, runAbort, zipFilePath, patientsReadyForConfirm, runStatus, error_7, message, cancelled;
            var _a, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        summary = __assign({}, (run.summary || {}));
                        runAbort = new AbortController();
                        this.runAbortControllers.set(run.id, runAbort);
                        zipFilePath = (0, samsung_dataset_utils_1.getDeliveryZipFilePath)(run.id);
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 6, 8, 10]);
                        this.ensureRunNotCancelled(run.id);
                        return [4 /*yield*/, this.uploadZipAndMetadata(run, summary, zipFilePath, summary.zipPath, summary.zipName, summary.metadataRows, summary.deliveryDate, runAbort.signal)];
                    case 2:
                        _g.sent();
                        patientsReadyForConfirm = summary.patientsReadyForConfirm || [];
                        if (!(patientsReadyForConfirm.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.confirmRunDelivery(patientsReadyForConfirm)];
                    case 3:
                        _g.sent();
                        _g.label = 4;
                    case 4:
                        runStatus = (summary.erroredPatients || 0) > 0 && patientsReadyForConfirm.length === 0
                            ? samsung_sync_run_entity_1.SamsungSyncRunStatus.FAILED
                            : samsung_sync_run_entity_1.SamsungSyncRunStatus.SUCCESS;
                        return [4 /*yield*/, this.syncRunRepository.update(run.id, {
                                status: runStatus,
                                finished_at: new Date(),
                                total_patients: (_a = summary.totalPatients) !== null && _a !== void 0 ? _a : 0,
                                synced_patients: patientsReadyForConfirm.length,
                                errored_patients: (_b = summary.erroredPatients) !== null && _b !== void 0 ? _b : 0,
                                uploaded_files: (_c = summary.uploadedFiles) !== null && _c !== void 0 ? _c : 0,
                                skipped_files: (_d = summary.skippedFiles) !== null && _d !== void 0 ? _d : 0,
                                deleted_files: (_e = summary.deletedFiles) !== null && _e !== void 0 ? _e : 0,
                                error_files: (_f = summary.errorFiles) !== null && _f !== void 0 ? _f : 0,
                                summary: __assign(__assign({}, summary), { currentStepIndex: 8, currentStep: 'Sincronização concluída' }),
                            })];
                    case 5:
                        _g.sent();
                        this.logger.log("Run ".concat(run.id, ": upload retomado ap\u00F3s rein\u00EDcio (").concat(runStatus, ")"));
                        return [3 /*break*/, 10];
                    case 6:
                        error_7 = _g.sent();
                        message = error_7 instanceof Error ? error_7.message : 'Erro desconhecido';
                        cancelled = this.cancelledRunIds.has(run.id) || /cancelad/i.test(message);
                        return [4 /*yield*/, this.syncRunRepository.update(run.id, {
                                status: samsung_sync_run_entity_1.SamsungSyncRunStatus.FAILED,
                                finished_at: new Date(),
                                error_message: cancelled ? 'Cancelado pelo usuário' : message,
                            })];
                    case 7:
                        _g.sent();
                        throw error_7;
                    case 8:
                        this.cancelledRunIds.delete(run.id);
                        this.runAbortControllers.delete(run.id);
                        return [4 /*yield*/, (0, samsung_dataset_utils_1.cleanupSamsungSyncTempDir)(run.id)];
                    case 9:
                        _g.sent();
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /** Após entrega bem-sucedida no BART: marca pacientes e limpa pendências no banco. */
    SamsungSyncService.prototype.confirmRunDelivery = function (patientIds) {
        return __awaiter(this, void 0, void 0, function () {
            var batchSize, _loop_5, i;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (patientIds.length === 0)
                            return [2 /*return*/];
                        batchSize = 5;
                        _loop_5 = function (i) {
                            var batch;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        batch = patientIds.slice(i, i + batchSize);
                                        return [4 /*yield*/, (0, pg_transient_1.withPgRetry)(function () { return _this.confirmRunDeliveryBatch(batch); }, {
                                                onRetry: function (error, attempt, delayMs) {
                                                    _this.logger.warn("confirmRunDelivery: PostgreSQL transiente (lote ".concat(i / batchSize + 1, ", tentativa ").concat(attempt, "), nova em ").concat(delayMs, "ms: ").concat(error instanceof Error ? error.message : String(error)));
                                                },
                                            })];
                                    case 1:
                                        _b.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < patientIds.length)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_5(i)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i += batchSize;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SamsungSyncService.prototype.confirmRunDeliveryBatch = function (patientIds) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.query("\n      UPDATE patients\n         SET sync_pending = FALSE,\n             synced_at = NOW()\n       WHERE id = ANY($1::uuid[])\n      ", [patientIds])];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.db.transaction(function (manager) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, manager.query("SET LOCAL app.hard_delete = 'true'")];
                                        case 1:
                                            _a.sent();
                                            return [4 /*yield*/, manager.query("\n        DELETE FROM binary_collections bc\n         USING patients p\n         WHERE bc.patient_cpf_hash = p.cpf_hash\n           AND p.id = ANY($1::uuid[])\n           AND bc.deleted_pending = TRUE\n        ", [patientIds])];
                                        case 2:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        // Só linhas ainda pendentes — speech excluída já deve ter file_sync_pending=FALSE.
                        return [4 /*yield*/, this.db.query("\n      UPDATE binary_collections bc\n         SET file_sync_pending = FALSE,\n             file_synced_at = NOW(),\n             deleted_pending = FALSE\n        FROM patients p\n       WHERE bc.patient_cpf_hash = p.cpf_hash\n         AND p.id = ANY($1::uuid[])\n         AND (bc.file_sync_pending = TRUE OR bc.deleted_pending = TRUE)\n      ", [patientIds])];
                    case 3:
                        // Só linhas ainda pendentes — speech excluída já deve ter file_sync_pending=FALSE.
                        _a.sent();
                        return [4 /*yield*/, this.db.query("\n      UPDATE pdf_reports pr\n         SET file_sync_pending = FALSE,\n             file_synced_at = NOW()\n        FROM questionnaires q\n       WHERE q.id = pr.questionnaire_id\n         AND q.patient_id = ANY($1::uuid[])\n         AND pr.file_sync_pending = TRUE\n      ", [patientIds])];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SamsungSyncService.prototype.resetSyncPending = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var normalized, patientStart, patientEnd, patientRows, patientIds, bcRows, pdfRows;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        normalized = this.normalizeFilters(filters);
                        patientStart = this.parseIdentifierRange(normalized.patientStart);
                        patientEnd = this.parseIdentifierRange(normalized.patientEnd);
                        if (patientStart != null &&
                            patientEnd != null &&
                            Number.isFinite(patientStart) &&
                            Number.isFinite(patientEnd) &&
                            patientStart > patientEnd) {
                            throw new Error('Faixa de pacientes inválida: início maior que o fim.');
                        }
                        if (normalized.dateStart && normalized.dateEnd && normalized.dateStart > normalized.dateEnd) {
                            throw new Error('Faixa de datas inválida: início maior que o fim.');
                        }
                        return [4 /*yield*/, this.db.query("\n      SELECT p.id\n        FROM patients p\n       WHERE UPPER(COALESCE(p.public_identifier, '')) NOT IN ('P000', 'P00')\n         AND ($1::int IS NULL OR COALESCE(NULLIF(regexp_replace(p.public_identifier, '\\D', '', 'g'), ''), '0')::int >= $1::int)\n         AND ($2::int IS NULL OR COALESCE(NULLIF(regexp_replace(p.public_identifier, '\\D', '', 'g'), ''), '0')::int <= $2::int)\n         AND ($3::date IS NULL OR DATE(COALESCE(p.sync_pending_at, p.synced_at, NOW())) >= $3::date)\n         AND ($4::date IS NULL OR DATE(COALESCE(p.sync_pending_at, p.synced_at, NOW())) <= $4::date)\n      ", [
                                patientStart,
                                patientEnd,
                                normalized.dateStart || null,
                                normalized.dateEnd || null,
                            ])];
                    case 1:
                        patientRows = _c.sent();
                        patientIds = (patientRows || [])
                            .map(function (r) { return r === null || r === void 0 ? void 0 : r.id; })
                            .filter(function (id) { return Boolean(id); });
                        if (patientIds.length === 0) {
                            return [2 /*return*/, { patients: 0, binary_collections: 0, pdf_reports: 0 }];
                        }
                        return [4 /*yield*/, this.db.query("\n      UPDATE patients\n         SET sync_pending = TRUE,\n             sync_pending_at = NOW(),\n             synced_at = NULL,\n             sync_version = COALESCE(sync_version, 0) + 1\n       WHERE id = ANY($1::uuid[])\n      ", [patientIds])];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, this.db.query("\n      UPDATE binary_collections bc\n         SET file_sync_pending = TRUE,\n             deleted_pending = FALSE\n        FROM patients p\n       WHERE bc.patient_cpf_hash = p.cpf_hash\n         AND p.id = ANY($1::uuid[])\n         AND NOT binary_collection_is_samsung_speech_excluded(bc.task_id, bc.metadata)\n      RETURNING bc.id\n      ", [patientIds])];
                    case 3:
                        bcRows = _c.sent();
                        return [4 /*yield*/, this.db.query("\n      UPDATE pdf_reports pr\n         SET file_sync_pending = TRUE,\n             file_synced_at = NULL\n        FROM questionnaires q\n       WHERE q.id = pr.questionnaire_id\n         AND q.patient_id = ANY($1::uuid[])\n         AND NOT pdf_report_is_samsung_psg_laudo_excluded(\n           pr.report_type, pr.file_name, pr.mime_type\n         )\n      RETURNING pr.id\n      ", [patientIds])];
                    case 4:
                        pdfRows = _c.sent();
                        return [2 /*return*/, {
                                patients: patientIds.length,
                                binary_collections: (_a = bcRows === null || bcRows === void 0 ? void 0 : bcRows.length) !== null && _a !== void 0 ? _a : 0,
                                pdf_reports: (_b = pdfRows === null || pdfRows === void 0 ? void 0 : pdfRows.length) !== null && _b !== void 0 ? _b : 0,
                            }];
                }
            });
        });
    };
    SamsungSyncService.prototype.getStorageConfig = function () {
        return {
            basePath: this.basePath,
            repo: this.repoZip,
        };
    };
    SamsungSyncService.prototype.browseStorage = function (relativePath) {
        return __awaiter(this, void 0, void 0, function () {
            var safeRelative, fullPath, items;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        safeRelative = this.sanitizeStorageRelativePath(relativePath || '');
                        fullPath = safeRelative ? "".concat(this.basePath, "/").concat(safeRelative) : this.basePath;
                        return [4 /*yield*/, this.artifactoryService.listStorage(this.repoZip, fullPath)];
                    case 1:
                        items = _a.sent();
                        return [2 /*return*/, {
                                basePath: this.basePath,
                                repo: this.repoZip,
                                path: safeRelative,
                                items: items,
                            }];
                }
            });
        });
    };
    SamsungSyncService.prototype.downloadStorageItem = function (relativePath) {
        return __awaiter(this, void 0, void 0, function () {
            var safeRelative, fullPath;
            return __generator(this, function (_a) {
                safeRelative = this.sanitizeStorageRelativePath(relativePath);
                if (!safeRelative) {
                    throw new Error('Caminho inválido');
                }
                fullPath = "".concat(this.basePath, "/").concat(safeRelative);
                return [2 /*return*/, this.artifactoryService.downloadFile(this.repoZip, fullPath)];
            });
        });
    };
    SamsungSyncService.prototype.deleteStorageItem = function (relativePath) {
        return __awaiter(this, void 0, void 0, function () {
            var safeRelative, fullPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        safeRelative = this.sanitizeStorageRelativePath(relativePath);
                        if (!safeRelative) {
                            throw new Error('Caminho inválido');
                        }
                        fullPath = "".concat(this.basePath, "/").concat(safeRelative);
                        return [4 /*yield*/, this.artifactoryService.deleteFile(this.repoZip, fullPath)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SamsungSyncService.prototype.listZipArtifacts = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dataPath;
            return __generator(this, function (_a) {
                dataPath = "".concat(this.basePath, "/Data");
                return [2 /*return*/, this.artifactoryService.listArtifacts(this.repoZip, dataPath)];
            });
        });
    };
    SamsungSyncService.prototype.downloadZipArtifact = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var safeName;
            return __generator(this, function (_a) {
                safeName = (name || '').split('/').pop() || '';
                if (!safeName.endsWith('.zip')) {
                    throw new Error('Artefato inválido');
                }
                return [2 /*return*/, this.artifactoryService.downloadFile(this.repoZip, (0, samsung_dataset_utils_1.buildDataZipArtifactPath)(this.basePath, safeName.replace(/\.zip$/i, '')))];
            });
        });
    };
    SamsungSyncService.prototype.deleteZipArtifact = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var safeName, deliveryDate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        safeName = (name || '').split('/').pop() || '';
                        if (!safeName.endsWith('.zip')) {
                            throw new Error('Artefato inválido');
                        }
                        deliveryDate = safeName.replace(/\.zip$/i, '');
                        return [4 /*yield*/, this.artifactoryService.deleteFile(this.repoZip, (0, samsung_dataset_utils_1.buildDataZipArtifactPath)(this.basePath, deliveryDate))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    var SamsungSyncService_1;
    SamsungSyncService = SamsungSyncService_1 = __decorate([
        (0, common_1.Injectable)(),
        __param(0, (0, typeorm_1.InjectDataSource)()),
        __param(1, (0, typeorm_1.InjectRepository)(samsung_sync_run_entity_1.SamsungSyncRun)),
        __param(2, (0, typeorm_1.InjectRepository)(samsung_sync_run_item_entity_1.SamsungSyncRunItem)),
        __metadata("design:paramtypes", [typeorm_2.DataSource,
            typeorm_2.Repository,
            typeorm_2.Repository,
            questionnaires_service_1.QuestionnairesService,
            freeliving_service_1.FreelivingService,
            artifactory_service_1.ArtifactoryService,
            config_1.ConfigService,
            minio_storage_service_1.MinioStorageService])
    ], SamsungSyncService);
    return SamsungSyncService;
}());
exports.SamsungSyncService = SamsungSyncService;
