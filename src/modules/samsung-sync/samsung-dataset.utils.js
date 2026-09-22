"use strict";
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
exports.getUniqueFilename = exports.sanitizeExternalDocBaseName = exports.isSamsungExcludedPsgLaudo = exports.isPolysomnographyEdfFile = exports.samsungPdfReportDataPath = exports.buildSamsungActiveTaskFilename = exports.toStageFolder = exports.toSamsungDeviceFolder = exports.inferSamsungDevice = exports.inferSamsungProtocol = exports.isSamsungSmartphoneTask = exports.isSpeechTask = exports.normalizeSamsungTa = exports.extractTaskCodeFromFilename = exports.isSamsungExcludedPublicIdentifier = exports.toSamsungSubjectId = exports.deviceGroupKey = exports.openDeliveryZipWriter = exports.createZipFileFromEntries = exports.cleanupSamsungSyncTempDir = exports.ensureSamsungSyncTempDir = exports.isDeliveryZipReady = exports.getDeliveryZipFilePath = exports.getSamsungSyncTempDir = exports.getSamsungSyncTempRoot = exports.createZipBufferFromEntries = exports.buildDeliveryMetadataCsv = exports.buildDeviceSubZipPath = exports.buildSamsungDataFileZipPath = exports.buildClinicalDataZipPath = exports.buildSubjectDataZipPath = exports.buildArtifactoryArtifactPath = exports.buildArchiveEntryDownloadUrl = exports.buildMetadataCsvArtifactPath = exports.buildDataZipArtifactPath = exports.buildDeliveryZipFileName = exports.formatCollectionDateForMetadata = exports.getDeliveryDateFolder = exports.toDateFolder = exports.samsungStep = exports.SAMSUNG_SYNC_PROGRESS_STEPS = exports.DELIVERY_METADATA_PROJECT_NAME = exports.DELIVERY_METADATA_SOURCE = exports.CLINICAL_DATA_FOLDER = exports.SUBJECT_DATA_FOLDER = void 0;
var archiver = require("archiver");
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var os_1 = require("os");
var path_1 = require("path");
exports.SUBJECT_DATA_FOLDER = 'Subject_Data';
/** @deprecated Use SUBJECT_DATA_FOLDER */
exports.CLINICAL_DATA_FOLDER = exports.SUBJECT_DATA_FOLDER;
exports.DELIVERY_METADATA_SOURCE = 'UFAM';
exports.DELIVERY_METADATA_PROJECT_NAME = 'PRIME';
/**
 * Nomenclatura de CSV de tarefas ativas (lateralidade, INERTIAL/SDK, STA, Rep):
 * manter alinhado com prime/lib/samsungActiveTaskFilename.ts
 */
exports.SAMSUNG_SYNC_PROGRESS_STEPS = [
    'Validando conectividade com o BART',
    'Carregando exportação Guidelines',
    'Processando metadados e questionários',
    'Baixando relatórios PDF do MinIO',
    'Processando binary collections (Study/Session/Device)',
    'Compactando ZIP Guidelines',
    'Enviando ZIP para o BART',
    'Confirmando sincronização no banco',
    'Finalizando auditoria',
];
var samsungStep = function (stepIndex) {
    return exports.SAMSUNG_SYNC_PROGRESS_STEPS[Math.max(0, Math.min(stepIndex, exports.SAMSUNG_SYNC_PROGRESS_STEPS.length - 1))];
};
exports.samsungStep = samsungStep;
var toDateFolder = function (value) {
    if (!value)
        return (0, exports.getDeliveryDateFolder)();
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return (0, exports.getDeliveryDateFolder)();
    }
    return date.toISOString().slice(0, 10).replace(/-/g, '');
};
exports.toDateFolder = toDateFolder;
/** Data de entrega (sync) em YYYYMMDD — timezone America/Sao_Paulo. */
var getDeliveryDateFolder = function (date) {
    var _a, _b, _c, _d, _e, _f;
    if (date === void 0) { date = new Date(); }
    var parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date);
    var y = (_b = (_a = parts.find(function (p) { return p.type === 'year'; })) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : '0000';
    var m = (_d = (_c = parts.find(function (p) { return p.type === 'month'; })) === null || _c === void 0 ? void 0 : _c.value) !== null && _d !== void 0 ? _d : '01';
    var d = (_f = (_e = parts.find(function (p) { return p.type === 'day'; })) === null || _e === void 0 ? void 0 : _e.value) !== null && _f !== void 0 ? _f : '01';
    return "".concat(y).concat(m).concat(d);
};
exports.getDeliveryDateFolder = getDeliveryDateFolder;
/** Data de coleta para coluna generation_date do metadata eBART (YYYY-MM-DD). */
var formatCollectionDateForMetadata = function (questionnaire) {
    var _a, _b, _c, _d;
    var raw = (_d = (_c = (_b = (_a = questionnaire === null || questionnaire === void 0 ? void 0 : questionnaire.data) === null || _a === void 0 ? void 0 : _a.dataColeta) !== null && _b !== void 0 ? _b : questionnaire === null || questionnaire === void 0 ? void 0 : questionnaire.collection_date) !== null && _c !== void 0 ? _c : questionnaire === null || questionnaire === void 0 ? void 0 : questionnaire.createdAt) !== null && _d !== void 0 ? _d : questionnaire === null || questionnaire === void 0 ? void 0 : questionnaire.created_at;
    if (!raw)
        return '';
    if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}/.test(raw)) {
        return raw.slice(0, 10);
    }
    var date = new Date(raw);
    if (Number.isNaN(date.getTime()))
        return String(raw).slice(0, 10);
    return date.toISOString().slice(0, 10);
};
exports.formatCollectionDateForMetadata = formatCollectionDateForMetadata;
var buildDeliveryZipFileName = function (deliveryDate) {
    return "".concat(deliveryDate, ".zip");
};
exports.buildDeliveryZipFileName = buildDeliveryZipFileName;
var buildDataZipArtifactPath = function (artifactoryBasePath, deliveryDate) {
    var prefix = (artifactoryBasePath || '').replace(/^\/+|\/+$/g, '');
    return prefix
        ? "".concat(prefix, "/Data/").concat((0, exports.buildDeliveryZipFileName)(deliveryDate))
        : "Data/".concat((0, exports.buildDeliveryZipFileName)(deliveryDate));
};
exports.buildDataZipArtifactPath = buildDataZipArtifactPath;
var buildMetadataCsvArtifactPath = function (artifactoryBasePath, deliveryDate) {
    var prefix = (artifactoryBasePath || '').replace(/^\/+|\/+$/g, '');
    return prefix
        ? "".concat(prefix, "/Metadata/").concat(deliveryDate, "_metadata.csv")
        : "Metadata/".concat(deliveryDate, "_metadata.csv");
};
exports.buildMetadataCsvArtifactPath = buildMetadataCsvArtifactPath;
/** URL Artifactory para entrada dentro do ZIP de entrega (sintaxe !/). */
var buildArchiveEntryDownloadUrl = function (artifactoryBaseUrl, repo, artifactoryBasePath, deliveryDate, entryPathInsideZip) {
    var base = artifactoryBaseUrl.replace(/\/$/, '');
    var zipPath = (0, exports.buildDataZipArtifactPath)(artifactoryBasePath, deliveryDate);
    var encodedZipPath = zipPath
        .split('/')
        .filter(Boolean)
        .map(function (part) { return encodeURIComponent(part); })
        .join('/');
    var inner = entryPathInsideZip.replace(/^\/+/, '');
    return "".concat(base, "/").concat(repo, "/").concat(encodedZipPath, "!/").concat(inner);
};
exports.buildArchiveEntryDownloadUrl = buildArchiveEntryDownloadUrl;
var buildArtifactoryArtifactPath = function (basePath, relativePath) {
    var prefix = (basePath || '').replace(/^\/+|\/+$/g, '');
    var rel = relativePath.replace(/^\/+/, '');
    return prefix ? "".concat(prefix, "/").concat(rel) : rel;
};
exports.buildArtifactoryArtifactPath = buildArtifactoryArtifactPath;
var buildSubjectDataZipPath = function (deliveryDate, subjectId, stageFolder, fileName) {
    return "".concat(deliveryDate, "/").concat(subjectId, "/").concat(stageFolder, "/").concat(exports.SUBJECT_DATA_FOLDER, "/").concat(fileName);
};
exports.buildSubjectDataZipPath = buildSubjectDataZipPath;
/** @deprecated Use buildSubjectDataZipPath */
exports.buildClinicalDataZipPath = exports.buildSubjectDataZipPath;
var buildSamsungDataFileZipPath = function (deliveryDate, subjectId, stageFolder, deviceFolder, fileName) {
    return "".concat(deliveryDate, "/").concat(subjectId, "/").concat(stageFolder, "/").concat(deviceFolder, "/").concat(fileName);
};
exports.buildSamsungDataFileZipPath = buildSamsungDataFileZipPath;
var buildDeviceSubZipPath = function (deliveryDate, subjectId, stageFolder, deviceFolder) {
    return "".concat(deliveryDate, "/").concat(subjectId, "/").concat(stageFolder, "/").concat(deviceFolder, ".zip");
};
exports.buildDeviceSubZipPath = buildDeviceSubZipPath;
var buildDeliveryMetadataCsv = function (rows) {
    var lines = ['generation_date,download_url,source,project_name'];
    for (var _i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
        var row = rows_1[_i];
        var gd = (row.generation_date || '').replace(/"/g, '""');
        var url = (row.download_url || '').replace(/"/g, '""');
        lines.push("\"".concat(gd, "\",\"").concat(url, "\",\"").concat(exports.DELIVERY_METADATA_SOURCE, "\",\"").concat(exports.DELIVERY_METADATA_PROJECT_NAME, "\""));
    }
    return "".concat(lines.join('\n'), "\n");
};
exports.buildDeliveryMetadataCsv = buildDeliveryMetadataCsv;
var createZipBufferFromEntries = function (entries) { return __awaiter(void 0, void 0, void 0, function () {
    var arc, chunks, result, _i, entries_1, entry;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                arc = archiver('zip', { zlib: { level: 1 } });
                chunks = [];
                result = new Promise(function (resolve, reject) {
                    arc.on('data', function (chunk) { return chunks.push(chunk); });
                    arc.on('end', function () { return resolve(Buffer.concat(chunks)); });
                    arc.on('error', reject);
                });
                for (_i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                    entry = entries_1[_i];
                    if (entry.filePath) {
                        arc.append((0, fs_1.createReadStream)(entry.filePath), { name: entry.name });
                    }
                    else if (entry.buffer) {
                        arc.append(entry.buffer, { name: entry.name });
                    }
                }
                return [4 /*yield*/, arc.finalize()];
            case 1:
                _a.sent();
                return [2 /*return*/, result];
        }
    });
}); };
exports.createZipBufferFromEntries = createZipBufferFromEntries;
var getSamsungSyncTempRoot = function () {
    var _a;
    var configured = (_a = process.env.SAMSUNG_SYNC_TEMP_DIR) === null || _a === void 0 ? void 0 : _a.trim();
    return configured || (0, path_1.join)((0, os_1.tmpdir)(), 'prime-samsung-sync');
};
exports.getSamsungSyncTempRoot = getSamsungSyncTempRoot;
var getSamsungSyncTempDir = function (runId) {
    return (0, path_1.join)((0, exports.getSamsungSyncTempRoot)(), runId);
};
exports.getSamsungSyncTempDir = getSamsungSyncTempDir;
var getDeliveryZipFilePath = function (runId) {
    return (0, path_1.join)((0, exports.getSamsungSyncTempDir)(runId), "".concat(runId, ".zip"));
};
exports.getDeliveryZipFilePath = getDeliveryZipFilePath;
var isDeliveryZipReady = function (runId) { return __awaiter(void 0, void 0, void 0, function () {
    var fileStat, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, promises_1.stat)((0, exports.getDeliveryZipFilePath)(runId))];
            case 1:
                fileStat = _b.sent();
                return [2 /*return*/, fileStat.isFile() && fileStat.size > 0];
            case 2:
                _a = _b.sent();
                return [2 /*return*/, false];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.isDeliveryZipReady = isDeliveryZipReady;
var ensureSamsungSyncTempDir = function (runId) { return __awaiter(void 0, void 0, void 0, function () {
    var dir;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                dir = (0, exports.getSamsungSyncTempDir)(runId);
                return [4 /*yield*/, (0, promises_1.mkdir)(dir, { recursive: true })];
            case 1:
                _a.sent();
                return [2 /*return*/, dir];
        }
    });
}); };
exports.ensureSamsungSyncTempDir = ensureSamsungSyncTempDir;
var cleanupSamsungSyncTempDir = function (runId) { return __awaiter(void 0, void 0, void 0, function () {
    var dir;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                dir = (0, exports.getSamsungSyncTempDir)(runId);
                return [4 /*yield*/, (0, promises_1.rm)(dir, { recursive: true, force: true }).catch(function () { return undefined; })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.cleanupSamsungSyncTempDir = cleanupSamsungSyncTempDir;
/** Grava sub-ZIP em disco sem acumular buffers na heap. */
var createZipFileFromEntries = function (entries, destPath) { return __awaiter(void 0, void 0, void 0, function () {
    var arc, output, finished, _i, entries_2, entry;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                arc = archiver('zip', { zlib: { level: 1 } });
                output = (0, fs_1.createWriteStream)(destPath);
                finished = new Promise(function (resolve, reject) {
                    output.on('close', function () { return resolve(); });
                    output.on('error', reject);
                    arc.on('error', reject);
                });
                arc.pipe(output);
                for (_i = 0, entries_2 = entries; _i < entries_2.length; _i++) {
                    entry = entries_2[_i];
                    if (entry.filePath) {
                        arc.append((0, fs_1.createReadStream)(entry.filePath), { name: entry.name });
                    }
                    else if (entry.buffer) {
                        arc.append(entry.buffer, { name: entry.name });
                    }
                }
                return [4 /*yield*/, arc.finalize()];
            case 1:
                _a.sent();
                return [4 /*yield*/, finished];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.createZipFileFromEntries = createZipFileFromEntries;
/** ZIP de entrega principal gravado em disco (streaming). */
var openDeliveryZipWriter = function (runId) {
    var filePath = (0, exports.getDeliveryZipFilePath)(runId);
    var arc = archiver('zip', { zlib: { level: 1 } });
    var output = (0, fs_1.createWriteStream)(filePath);
    var finished = new Promise(function (resolve, reject) {
        output.on('close', function () { return resolve(); });
        output.on('error', reject);
        arc.on('error', reject);
    });
    arc.pipe(output);
    return { archive: arc, finished: finished, filePath: filePath };
};
exports.openDeliveryZipWriter = openDeliveryZipWriter;
var deviceGroupKey = function (subjectId, stageFolder, deviceFolder) { return "".concat(subjectId, "::").concat(stageFolder, "::").concat(deviceFolder); };
exports.deviceGroupKey = deviceGroupKey;
var toSamsungSubjectId = function (publicIdentifier) {
    var digits = (publicIdentifier || '').replace(/\D/g, '');
    var num = digits ? Number(digits) : 0;
    return "S".concat(String(num || 0).padStart(3, '0'));
};
exports.toSamsungSubjectId = toSamsungSubjectId;
var isSamsungExcludedPublicIdentifier = function (publicIdentifier) {
    var normalized = (publicIdentifier || '').trim().toUpperCase();
    return normalized === 'P000' || normalized === 'P00';
};
exports.isSamsungExcludedPublicIdentifier = isSamsungExcludedPublicIdentifier;
var extractTaskCodeFromFilename = function (fileName) {
    var match = /TA\d{1,2}/i.exec(fileName || '');
    return match ? match[0].toUpperCase() : null;
};
exports.extractTaskCodeFromFilename = extractTaskCodeFromFilename;
var normalizeSamsungTa = function (token) {
    var m = /^TA0*(\d{1,2})$/i.exec(token.trim());
    return m ? "TA".concat(parseInt(m[1], 10)) : token.toUpperCase();
};
exports.normalizeSamsungTa = normalizeSamsungTa;
var normalizeSamsungSta = function (token) {
    var m = /^STA0*(\d{1,2})$/i.exec(token.trim());
    return m ? "STA".concat(parseInt(m[1], 10)) : token.toUpperCase();
};
var isSpeechTask = function (taskCode) {
    return taskCode === 'TA10' || taskCode === 'TA11' || taskCode === 'TA12';
};
exports.isSpeechTask = isSpeechTask;
var isSamsungSmartphoneTask = function (taskCode) {
    if (!taskCode)
        return false;
    var normalized = (0, exports.normalizeSamsungTa)(taskCode);
    return normalized === 'TA6' || normalized === 'TA7' || normalized === 'TA8' || normalized === 'TA9';
};
exports.isSamsungSmartphoneTask = isSamsungSmartphoneTask;
var inferSamsungProtocol = function (taskCode, fileName) {
    if (taskCode === 'TA13' || /sleep|sono|psg/i.test(fileName))
        return 'Sleep';
    return 'Clinic';
};
exports.inferSamsungProtocol = inferSamsungProtocol;
var inferSamsungDevice = function (fileName, taskCode) {
    if (/baiobit|biobit/i.test(fileName))
        return 'Baiobit';
    if (/emg|delsys/i.test(fileName))
        return 'EMG';
    if (/ring/i.test(fileName))
        return 'Ring';
    if (/psg|polysomn|polisson/i.test(fileName))
        return 'PSG';
    var normalizedTaskCode = taskCode || (0, exports.extractTaskCodeFromFilename)(fileName);
    if ((0, exports.isSamsungSmartphoneTask)(normalizedTaskCode)) {
        return 'SP';
    }
    return 'SW';
};
exports.inferSamsungDevice = inferSamsungDevice;
var toSamsungDeviceFolder = function (device) {
    var upper = device.toUpperCase();
    if (upper === 'SW')
        return 'SW';
    if (upper === 'SP')
        return 'SP';
    if (upper === 'PSG')
        return 'PSG';
    if (upper === 'EMG')
        return 'EMG';
    if (upper === 'RING')
        return 'Ring';
    if (upper === 'BAIOBIT' || upper === 'BIOBIT')
        return 'Baiobit';
    return device;
};
exports.toSamsungDeviceFolder = toSamsungDeviceFolder;
var toStageFolder = function (protocol) {
    if (protocol === 'Sleep')
        return '2_Sleep';
    if (protocol === 'Free-living')
        return '3_Free-living';
    return '1_In-Clinic';
};
exports.toStageFolder = toStageFolder;
var removeCpfFromFilenameString = function (s) {
    var t = s.replace(/\d{3}\.\d{3}\.\d{3}-\d{2}/g, '');
    t = t.replace(/\b\d{11}\b/g, '');
    return t.replace(/[-_]{2,}/g, '_').replace(/^[-_]+|[-_]+$/g, '');
};
var removeTrailingIdNoise = function (s) {
    var t = s.replace(/[-_]ReS\d+(-\d{8,})?$/i, '');
    t = t.replace(/ReS\d+$/i, '');
    t = t.replace(/[-_](\d{10,})$/g, '');
    return t.replace(/^[-_]+|[-_]+$/g, '');
};
var parseSamsungRepetition = function (rawFullName, ctx) {
    var m = /Rep[_\s-]?(\d{1,3})/i.exec(rawFullName);
    if (m)
        return Math.max(1, parseInt(m[1], 10));
    var meta = ctx === null || ctx === void 0 ? void 0 : ctx.metadata;
    if ((meta === null || meta === void 0 ? void 0 : meta.repetition) != null && String(meta.repetition).match(/^\d+$/)) {
        return Math.max(1, parseInt(String(meta.repetition), 10));
    }
    if ((meta === null || meta === void 0 ? void 0 : meta.rep) != null && String(meta.rep).match(/^\d+$/)) {
        return Math.max(1, parseInt(String(meta.rep), 10));
    }
    if (typeof (ctx === null || ctx === void 0 ? void 0 : ctx.repetitions_count) === 'number' && ctx.repetitions_count >= 1) {
        return Math.max(1, ctx.repetitions_count);
    }
    return 1;
};
var toProtocolLabel = function (protocol) {
    if (protocol === 'Sleep')
        return 'Stage2';
    if (protocol === 'Free-living')
        return 'Stage3';
    return 'Stage1';
};
var toSamsungDeviceCode = function (device) {
    var upper = device.toUpperCase();
    if (upper === 'SW' || upper === 'SP' || upper === 'EMG' || upper === 'PSG')
        return upper;
    if (upper === 'RING')
        return 'RING';
    if (upper === 'BAIOBIT' || upper === 'BIOBIT')
        return 'BAIOBIT';
    return upper;
};
var inferDataTypeFromFilename = function (fileName) {
    if (/(^|[-_\s])(NATIVO|INERTIAL|ACC|GR|GYRO|MAG|IMU)($|[-_\s])/i.test(fileName)) {
        return 'INERTIAL';
    }
    var hasSdk = /(^|[-_\s])(SDK)($|[-_\s])/i.test(fileName);
    if (hasSdk && /(^|[-_\s])(PPG)($|[-_\s])/i.test(fileName))
        return 'SDK_PPG';
    if (hasSdk && /(^|[-_\s])(EDA|IBI|HR)($|[-_\s])/i.test(fileName))
        return 'SDK_Others';
    if (hasSdk)
        return 'SDK';
    return 'SDK_Others';
};
var parseSpecificityToken = function (fileName) {
    if (/(^|[-_\s])(LD|RIGHT|DIREITO|DIREITA)($|[-_\s])/i.test(fileName))
        return 'R';
    if (/(^|[-_\s])(LE|LEFT|ESQUERDO|ESQUERDA)($|[-_\s])/i.test(fileName))
        return 'L';
    return 'NA';
};
var parseSubtaskToken = function (fileName) {
    var match = /(?:^|[-_\s])STA0*(\d{1,2})(?:$|[-_\s])/i.exec(fileName);
    if (!match)
        return '';
    return "[".concat(normalizeSamsungSta("STA".concat(match[1])), "]");
};
var mustIncludeStaInFilename = function (taskCode) {
    return ['TA8', 'TA10', 'TA11', 'TA12', 'TA16'].includes(taskCode);
};
var buildSamsungActiveTaskFilename = function (rawFileName, subjectId, collectionDate, file, device, trustedTaskCode) {
    var fallback = "".concat(file.id, ".csv");
    var base = (rawFileName || '').trim().split(/[/\\]/).pop() || fallback;
    var extMatch = base.match(/(\.[^.]+)$/i);
    var ext = extMatch ? extMatch[1] : '.csv';
    var stemFull = extMatch ? base.slice(0, -ext.length) : base;
    var cleaned = removeTrailingIdNoise(removeCpfFromFilenameString(stemFull));
    var taskMatch = /TA\d{1,2}/i.exec(cleaned);
    var taskCode = trustedTaskCode
        ? (0, exports.normalizeSamsungTa)(trustedTaskCode)
        : taskMatch
            ? (0, exports.normalizeSamsungTa)(taskMatch[0])
            : 'TA0';
    var subtask = parseSubtaskToken(cleaned);
    var repetition = parseSamsungRepetition(stemFull, file);
    var protocol = (0, exports.inferSamsungProtocol)(taskCode === 'TA0' ? null : taskCode, cleaned);
    var protocolLabel = toProtocolLabel(protocol);
    var specificity = parseSpecificityToken(cleaned);
    var dataType = inferDataTypeFromFilename(cleaned);
    var resolvedDevice = (0, exports.isSamsungSmartphoneTask)(taskCode) ? 'SP' : device;
    var deviceCode = toSamsungDeviceCode(resolvedDevice);
    var orderedParts = [
        collectionDate,
        subjectId,
        protocolLabel,
        deviceCode,
        specificity,
        dataType,
        taskCode,
    ];
    if (subtask && mustIncludeStaInFilename(taskCode))
        orderedParts.push(subtask);
    orderedParts.push("Rep".concat(repetition));
    return "".concat(orderedParts.join('-')).concat(ext);
};
exports.buildSamsungActiveTaskFilename = buildSamsungActiveTaskFilename;
var samsungPdfReportDataPath = function (reportType) {
    switch (reportType) {
        case 'BIOBIT':
            return { protocol: 'Clinic', device: 'Baiobit' };
        case 'DELSYS':
            return { protocol: 'Clinic', device: 'EMG' };
        case 'POLYSOMNOGRAPHY':
            return { protocol: 'Sleep', device: 'PSG' };
        default:
            return { protocol: 'Clinic', device: 'Ring' };
    }
};
exports.samsungPdfReportDataPath = samsungPdfReportDataPath;
/** POLYSOMNOGRAPHY conta como EDF se o nome/mime indicar .edf. */
var isPolysomnographyEdfFile = function (fileName, mimeType) {
    var name = (fileName || '').trim();
    if (/\.edf(\.|$)/i.test(name) || /(^|[^a-z])edf([^a-z]|$)/i.test(name)) {
        return true;
    }
    var mime = (mimeType || '').toLowerCase();
    return mime.includes('edf');
};
exports.isPolysomnographyEdfFile = isPolysomnographyEdfFile;
/** Laudo PDF de polissonografia: não entra no BART (dados pessoais). EDF segue. */
var isSamsungExcludedPsgLaudo = function (reportType, fileName, mimeType) {
    var type = (reportType || '').trim().toUpperCase();
    if (type !== 'POLYSOMNOGRAPHY')
        return false;
    return !(0, exports.isPolysomnographyEdfFile)(fileName, mimeType);
};
exports.isSamsungExcludedPsgLaudo = isSamsungExcludedPsgLaudo;
var sanitizeExternalDocBaseName = function (rawName, cpfHash) {
    var base = (rawName || 'documento').split(/[/\\]/).pop() || 'documento';
    var extMatch = base.match(/(\.[^.]+)$/i);
    var ext = extMatch ? extMatch[1] : '.pdf';
    var hash = (cpfHash || '').slice(0, 12) || 'ANON';
    return "DOC-".concat(hash).concat(ext);
};
exports.sanitizeExternalDocBaseName = sanitizeExternalDocBaseName;
var getUniqueFilename = function (baseName, counters, scope) {
    if (scope === void 0) { scope = ''; }
    var safeBase = (baseName || 'arquivo').trim();
    var key = "".concat(scope, "::").concat(safeBase).toLowerCase();
    var current = counters.get(key) || 0;
    counters.set(key, current + 1);
    if (current === 0)
        return safeBase;
    var extMatch = safeBase.match(/(\.[^.]+)$/i);
    var ext = extMatch ? extMatch[1] : '';
    var stem = ext ? safeBase.slice(0, -ext.length) : safeBase;
    return "".concat(stem, " (").concat(current + 1, ")").concat(ext);
};
exports.getUniqueFilename = getUniqueFilename;
