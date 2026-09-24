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
exports.FreelivingService = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var typeorm_2 = require("typeorm");
var binary_collection_entity_1 = require("../../entities/binary-collection.entity");
var freeliving_action_type_entity_1 = require("../../entities/freeliving-action-type.entity");
var freeliving_collection_event_entity_1 = require("../../entities/freeliving-collection-event.entity");
var freeliving_diary_entity_1 = require("../../entities/freeliving-diary.entity");
var medication_reference_entity_1 = require("../../entities/medication-reference.entity");
var patient_entity_1 = require("../../entities/patient.entity");
var patient_medication_entity_1 = require("../../entities/patient-medication.entity");
var questionnaire_entity_1 = require("../../entities/questionnaire.entity");
var active_task_definition_entity_1 = require("../../entities/active-task-definition.entity");
var crypto_util_1 = require("../../utils/crypto.util");
var expected_binary_files_constants_1 = require("../admin-collection-overview/expected-binary-files.constants");
var freeliving_clinical_medications_1 = require("./freeliving-clinical-medications");
var freeliving_diary_document_1 = require("./freeliving-diary-document");
var freeliving_diary_export_csv_1 = require("./freeliving-diary-export-csv");
var freeliving_diary_types_1 = require("./freeliving-diary.types");
var freeliving_diary_utils_1 = require("./freeliving-diary.utils");
var freeliving_utils_1 = require("./freeliving.utils");
function toIsoDate(value) {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        return value.slice(0, 10);
    }
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        var y = value.getUTCFullYear();
        var m = String(value.getUTCMonth() + 1).padStart(2, '0');
        var d = String(value.getUTCDate()).padStart(2, '0');
        return "".concat(y, "-").concat(m, "-").concat(d);
    }
    return String(value !== null && value !== void 0 ? value : '').slice(0, 10);
}
function toIsoDateTime(value) {
    if (value == null)
        return null;
    var date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime()))
        return null;
    return date.toISOString();
}
function parseDiaryFilterDate(term) {
    var trimmed = term.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed))
        return trimmed;
    var br = trimmed.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/);
    if (!br)
        return null;
    var day = br[1].padStart(2, '0');
    var month = br[2].padStart(2, '0');
    return "".concat(br[3], "-").concat(month, "-").concat(day);
}
function normalizeTaskCode(value) {
    return (value || '').trim().toUpperCase();
}
var FreelivingService = /** @class */ (function () {
    function FreelivingService(dataSource, eventsRepository, actionTypesRepository, diariesRepository, patientsRepository, binaryCollectionsRepository, questionnairesRepository, patientMedicationsRepository) {
        this.dataSource = dataSource;
        this.eventsRepository = eventsRepository;
        this.actionTypesRepository = actionTypesRepository;
        this.diariesRepository = diariesRepository;
        this.patientsRepository = patientsRepository;
        this.binaryCollectionsRepository = binaryCollectionsRepository;
        this.questionnairesRepository = questionnairesRepository;
        this.patientMedicationsRepository = patientMedicationsRepository;
    }
    FreelivingService.prototype.createEvent = function (dto) {
        return __awaiter(this, void 0, void 0, function () {
            var actionCode, actionType, taskCode, existing, cpfHash, patient, occurredAt, collectionDate, entity, saved, error_1, existing;
            var _a, _b, _c, _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        if (!crypto_util_1.CryptoUtil.isValidCpfFormat(dto.patient_cpf)) {
                            throw new common_1.BadRequestException('Invalid CPF format');
                        }
                        actionCode = dto.action_code.trim();
                        return [4 /*yield*/, this.actionTypesRepository.findOne({
                                where: { code: actionCode, active: true },
                            })];
                    case 1:
                        actionType = _h.sent();
                        if (!actionType) {
                            throw new common_1.BadRequestException("A\u00E7\u00E3o FreeLiving desconhecida ou inativa: ".concat(dto.action_code));
                        }
                        taskCode = this.resolveEventTaskCode(dto.task_code);
                        if (!dto.client_event_id) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.eventsRepository.findOne({
                                where: { client_event_id: dto.client_event_id },
                                relations: ['action_type'],
                            })];
                    case 2:
                        existing = _h.sent();
                        if (existing) {
                            return [2 /*return*/, { created: false, event: this.toEventDto(existing, actionType) }];
                        }
                        _h.label = 3;
                    case 3:
                        cpfHash = crypto_util_1.CryptoUtil.hashCpf(dto.patient_cpf);
                        return [4 /*yield*/, this.patientsRepository.findOne({
                                where: { cpf_hash: cpfHash },
                            })];
                    case 4:
                        patient = _h.sent();
                        if (!patient) {
                            throw new common_1.NotFoundException('Patient with this CPF not found');
                        }
                        occurredAt = dto.occurred_at ? new Date(dto.occurred_at) : new Date();
                        if (Number.isNaN(occurredAt.getTime())) {
                            throw new common_1.BadRequestException('occurred_at inválido');
                        }
                        collectionDate = (0, freeliving_utils_1.formatDateInTimeZone)(occurredAt);
                        entity = this.eventsRepository.create({
                            patient_id: patient.id,
                            patient_cpf_hash: cpfHash,
                            action_code: actionType.code,
                            task_code: taskCode,
                            occurred_at: occurredAt,
                            received_at: new Date(),
                            collection_date: collectionDate,
                            client_event_id: (_a = dto.client_event_id) !== null && _a !== void 0 ? _a : null,
                            source: 'collection_app',
                            device_type: (_b = dto.device_type) !== null && _b !== void 0 ? _b : null,
                            device_model: (_c = dto.device_model) !== null && _c !== void 0 ? _c : null,
                            os_version: (_d = dto.os_version) !== null && _d !== void 0 ? _d : null,
                            app_version: (_e = dto.app_version) !== null && _e !== void 0 ? _e : null,
                            metadata: (_f = dto.metadata) !== null && _f !== void 0 ? _f : {},
                        });
                        _h.label = 5;
                    case 5:
                        _h.trys.push([5, 7, , 10]);
                        return [4 /*yield*/, this.eventsRepository.save(entity)];
                    case 6:
                        saved = _h.sent();
                        saved.action_type = actionType;
                        return [2 /*return*/, { created: true, event: this.toEventDto(saved, actionType) }];
                    case 7:
                        error_1 = _h.sent();
                        if (!(dto.client_event_id && (0, freeliving_utils_1.isUniqueViolation)(error_1))) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.eventsRepository.findOne({
                                where: { client_event_id: dto.client_event_id },
                                relations: ['action_type'],
                            })];
                    case 8:
                        existing = _h.sent();
                        if (existing) {
                            return [2 /*return*/, {
                                    created: false,
                                    event: this.toEventDto(existing, (_g = existing.action_type) !== null && _g !== void 0 ? _g : actionType),
                                }];
                        }
                        _h.label = 9;
                    case 9: throw error_1;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    FreelivingService.prototype.upsertDiary = function (dto) {
        return __awaiter(this, void 0, void 0, function () {
            var cpfHash, patient;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!crypto_util_1.CryptoUtil.isValidCpfFormat(dto.patient_cpf)) {
                            throw new common_1.BadRequestException('Invalid CPF format');
                        }
                        if (dto.diary_date && !(0, freeliving_utils_1.isIsoDateOnly)(dto.diary_date)) {
                            throw new common_1.BadRequestException('diary_date deve ser YYYY-MM-DD');
                        }
                        cpfHash = crypto_util_1.CryptoUtil.hashCpf(dto.patient_cpf);
                        return [4 /*yield*/, this.patientsRepository.findOne({
                                where: { cpf_hash: cpfHash },
                            })];
                    case 1:
                        patient = _a.sent();
                        if (!patient) {
                            throw new common_1.NotFoundException('Patient with this CPF not found');
                        }
                        return [2 /*return*/, this.saveDiaryForPatient(patient, {
                                protocol_day: dto.protocol_day,
                                diary_date: dto.diary_date,
                                occurred_at: dto.occurred_at,
                                client_diary_id: dto.client_diary_id,
                                device_type: dto.device_type,
                                device_model: dto.device_model,
                                os_version: dto.os_version,
                                app_version: dto.app_version,
                                payload: dto.payload,
                                source: 'collection_app',
                            })];
                }
            });
        });
    };
    FreelivingService.prototype.upsertDiaryByPatientId = function (dto) {
        return __awaiter(this, void 0, void 0, function () {
            var patient;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(0, freeliving_utils_1.isIsoDateOnly)(dto.diary_date)) {
                            throw new common_1.BadRequestException('diary_date deve ser YYYY-MM-DD');
                        }
                        return [4 /*yield*/, this.requireActivePatient(dto.patientId)];
                    case 1:
                        patient = _a.sent();
                        return [2 /*return*/, this.saveDiaryForPatient(patient, {
                                protocol_day: dto.protocol_day,
                                diary_date: dto.diary_date,
                                payload: dto.payload,
                                device_type: 'admin_manual',
                                source: 'admin_manual',
                            })];
                }
            });
        });
    };
    FreelivingService.prototype.saveDiaryForPatient = function (patient, dto) {
        return __awaiter(this, void 0, void 0, function () {
            var occurredAt, diaryDate, cpfHash;
            var _this = this;
            return __generator(this, function (_a) {
                occurredAt = dto.occurred_at ? new Date(dto.occurred_at) : new Date();
                if (Number.isNaN(occurredAt.getTime())) {
                    throw new common_1.BadRequestException('occurred_at inválido');
                }
                diaryDate = dto.diary_date || (0, freeliving_utils_1.todayInSaoPaulo)();
                cpfHash = patient.cpf_hash;
                return [2 /*return*/, this.dataSource.transaction(function (manager) { return __awaiter(_this, void 0, void 0, function () {
                        var diariesRepo, existing, payload, gaps, status, now, isFirstSave, previousStatus, error_2, saved, deviceMeta, eventMeta, source;
                        var _a, _b, _c, _d, _e, _f;
                        return __generator(this, function (_g) {
                            switch (_g.label) {
                                case 0:
                                    diariesRepo = manager.getRepository(freeliving_diary_entity_1.FreelivingDiary);
                                    return [4 /*yield*/, diariesRepo.findOne({
                                            where: { patient_id: patient.id, diary_date: diaryDate },
                                        })];
                                case 1:
                                    existing = _g.sent();
                                    try {
                                        payload = (0, freeliving_diary_utils_1.normalizeDiaryPayload)(dto.payload, existing === null || existing === void 0 ? void 0 : existing.payload);
                                    }
                                    catch (error) {
                                        throw new common_1.BadRequestException(error instanceof Error ? error.message : 'payload do diário inválido');
                                    }
                                    gaps = (0, freeliving_diary_utils_1.computeDiaryGaps)(payload);
                                    status = (0, freeliving_diary_utils_1.diaryStatusFromGaps)(gaps);
                                    now = new Date();
                                    isFirstSave = !existing;
                                    previousStatus = (_a = existing === null || existing === void 0 ? void 0 : existing.status) !== null && _a !== void 0 ? _a : null;
                                    if (!!existing) return [3 /*break*/, 6];
                                    existing = diariesRepo.create({
                                        patient_id: patient.id,
                                        patient_cpf_hash: cpfHash,
                                        diary_date: diaryDate,
                                        protocol_day: dto.protocol_day,
                                        status: status,
                                        payload: payload,
                                        gaps: gaps,
                                        save_count: 1,
                                        first_saved_at: now,
                                        last_saved_at: now,
                                        client_diary_id: (_b = dto.client_diary_id) !== null && _b !== void 0 ? _b : null,
                                    });
                                    _g.label = 2;
                                case 2:
                                    _g.trys.push([2, 4, , 6]);
                                    return [4 /*yield*/, diariesRepo.save(existing)];
                                case 3:
                                    existing = _g.sent();
                                    return [3 /*break*/, 6];
                                case 4:
                                    error_2 = _g.sent();
                                    if (!(0, freeliving_utils_1.isUniqueViolation)(error_2))
                                        throw error_2;
                                    return [4 /*yield*/, diariesRepo.findOne({
                                            where: { patient_id: patient.id, diary_date: diaryDate },
                                        })];
                                case 5:
                                    existing = _g.sent();
                                    if (!existing)
                                        throw error_2;
                                    isFirstSave = false;
                                    previousStatus = existing.status;
                                    try {
                                        payload = (0, freeliving_diary_utils_1.normalizeDiaryPayload)(dto.payload, existing.payload);
                                    }
                                    catch (normalizeError) {
                                        throw new common_1.BadRequestException(normalizeError instanceof Error
                                            ? normalizeError.message
                                            : 'payload do diário inválido');
                                    }
                                    gaps = (0, freeliving_diary_utils_1.computeDiaryGaps)(payload);
                                    status = (0, freeliving_diary_utils_1.diaryStatusFromGaps)(gaps);
                                    return [3 /*break*/, 6];
                                case 6:
                                    if (!(!isFirstSave && existing)) return [3 /*break*/, 8];
                                    existing.protocol_day = dto.protocol_day;
                                    existing.status = status;
                                    existing.payload = payload;
                                    existing.gaps = gaps;
                                    existing.save_count = (existing.save_count || 0) + 1;
                                    existing.last_saved_at = now;
                                    if (dto.client_diary_id) {
                                        existing.client_diary_id = dto.client_diary_id;
                                    }
                                    return [4 /*yield*/, diariesRepo.save(existing)];
                                case 7:
                                    existing = _g.sent();
                                    _g.label = 8;
                                case 8:
                                    saved = existing;
                                    if (!saved) {
                                        throw new common_1.BadRequestException('Não foi possível gravar o diário');
                                    }
                                    deviceMeta = {
                                        device_type: (_c = dto.device_type) !== null && _c !== void 0 ? _c : null,
                                        device_model: (_d = dto.device_model) !== null && _d !== void 0 ? _d : null,
                                        os_version: (_e = dto.os_version) !== null && _e !== void 0 ? _e : null,
                                        app_version: (_f = dto.app_version) !== null && _f !== void 0 ? _f : null,
                                    };
                                    eventMeta = {
                                        diaryId: saved.id,
                                        protocolDay: saved.protocol_day,
                                        status: saved.status,
                                        saveCount: saved.save_count,
                                        gapCount: gaps.length,
                                    };
                                    source = dto.source || 'collection_app';
                                    if (!isFirstSave) return [3 /*break*/, 10];
                                    return [4 /*yield*/, this.recordDiaryMilestone(manager, __assign({ patient: patient, actionCode: freeliving_utils_1.ACTION_DIARY_STARTED, diary: saved, occurredAt: occurredAt, collectionDate: diaryDate, metadata: eventMeta, source: source }, deviceMeta))];
                                case 9:
                                    _g.sent();
                                    _g.label = 10;
                                case 10:
                                    if (!(previousStatus !== 'completo' && status === 'completo')) return [3 /*break*/, 12];
                                    return [4 /*yield*/, this.recordDiaryMilestone(manager, __assign({ patient: patient, actionCode: freeliving_utils_1.ACTION_DIARY_SUBMITTED, diary: saved, occurredAt: occurredAt, collectionDate: diaryDate, metadata: eventMeta, source: source }, deviceMeta))];
                                case 11:
                                    _g.sent();
                                    _g.label = 12;
                                case 12: return [2 /*return*/, this.toDiaryDto(saved)];
                            }
                        });
                    }); })];
            });
        });
    };
    FreelivingService.prototype.getDiaryByCpf = function (patientCpf, diaryDate) {
        return __awaiter(this, void 0, void 0, function () {
            var date, patient, diary;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!crypto_util_1.CryptoUtil.isValidCpfFormat(patientCpf)) {
                            throw new common_1.BadRequestException('Invalid CPF format');
                        }
                        if (diaryDate && !(0, freeliving_utils_1.isIsoDateOnly)(diaryDate)) {
                            throw new common_1.BadRequestException('diary_date deve ser YYYY-MM-DD');
                        }
                        date = diaryDate || (0, freeliving_utils_1.todayInSaoPaulo)();
                        return [4 /*yield*/, this.patientsRepository.findOne({
                                where: { cpf_hash: crypto_util_1.CryptoUtil.hashCpf(patientCpf) },
                            })];
                    case 1:
                        patient = _a.sent();
                        if (!patient) {
                            throw new common_1.NotFoundException('Patient with this CPF not found');
                        }
                        return [4 /*yield*/, this.diariesRepository.findOne({
                                where: { patient_id: patient.id, diary_date: date },
                            })];
                    case 2:
                        diary = _a.sent();
                        if (!diary) {
                            throw new common_1.NotFoundException('Diário não encontrado para esta data');
                        }
                        return [2 /*return*/, this.toDiaryDto(diary)];
                }
            });
        });
    };
    FreelivingService.prototype.searchPatientsForDiary = function (term) {
        return __awaiter(this, void 0, void 0, function () {
            var qb, trimmed, termDigits, termCompact, conditions, params, patients, results, _i, patients_1, patient, meds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        qb = this.patientsRepository
                            .createQueryBuilder('p')
                            .select(['p.id', 'p.full_name', 'p.cpf', 'p.public_identifier'])
                            .where('(p.public_identifier IS NULL OR UPPER(TRIM(p.public_identifier)) NOT IN (:...excluded))', { excluded: __spreadArray([], freeliving_utils_1.EXCLUDED_FREELIVING_PUBLIC_IDS, true) })
                            .orderBy('p.full_name', 'ASC')
                            .take(20);
                        trimmed = (term || '').trim();
                        if (trimmed) {
                            termDigits = trimmed.replace(/\D/g, '');
                            termCompact = trimmed.replace(/\s/g, '');
                            conditions = ['LOWER(p.full_name) LIKE LOWER(:term)'];
                            params = { term: "%".concat(trimmed, "%") };
                            if (termCompact.length > 0) {
                                params.pidTerm = "%".concat(termCompact, "%");
                                conditions.push("COALESCE(p.public_identifier, '') ILIKE :pidTerm");
                            }
                            if (termDigits.length > 0) {
                                params.cpfDigitsTerm = "%".concat(termDigits, "%");
                                conditions.push("COALESCE(p.cpf, '') LIKE :cpfDigitsTerm");
                            }
                            qb.andWhere("(".concat(conditions.join(' OR '), ")"), params);
                        }
                        return [4 /*yield*/, qb.getMany()];
                    case 1:
                        patients = _a.sent();
                        results = [];
                        _i = 0, patients_1 = patients;
                        _a.label = 2;
                    case 2:
                        if (!(_i < patients_1.length)) return [3 /*break*/, 5];
                        patient = patients_1[_i];
                        return [4 /*yield*/, this.getClinicalMedications(patient.id)];
                    case 3:
                        meds = _a.sent();
                        results.push({
                            patientId: patient.id,
                            fullName: patient.full_name,
                            cpf: patient.cpf || '',
                            publicIdentifier: patient.public_identifier,
                            medications: meds.slots,
                            extraMedicationCount: meds.extraCount,
                        });
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, results];
                }
            });
        });
    };
    FreelivingService.prototype.listDiariesByPatient = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var patient, diaries, events;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.requireActivePatient(patientId)];
                    case 1:
                        patient = _a.sent();
                        return [4 /*yield*/, this.diariesRepository.find({
                                where: { patient_id: patientId },
                                order: { diary_date: 'DESC', protocol_day: 'ASC' },
                            })];
                    case 2:
                        diaries = _a.sent();
                        return [4 /*yield*/, this.eventsRepository.find({
                                where: {
                                    patient_id: patientId,
                                    action_code: (0, typeorm_2.In)([freeliving_utils_1.ACTION_DIARY_STARTED, freeliving_utils_1.ACTION_DIARY_SUBMITTED]),
                                },
                            })];
                    case 3:
                        events = _a.sent();
                        return [2 /*return*/, diaries.map(function (diary) {
                                return _this.toDiaryListItemDto(diary, _this.resolveDiarySource(diary, events), patient);
                            })];
                }
            });
        });
    };
    FreelivingService.prototype.buildDiaryQuestionnaireCsvForPatient = function (patientId, publicIdentifier) {
        return __awaiter(this, void 0, void 0, function () {
            var diaries;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!patientId) {
                            return [2 /*return*/, (0, freeliving_diary_export_csv_1.buildFreeLivingDiaryQuestionnaireCsv)([])];
                        }
                        return [4 /*yield*/, this.diariesRepository.find({
                                where: { patient_id: patientId },
                                order: { protocol_day: 'ASC', diary_date: 'ASC' },
                            })];
                    case 1:
                        diaries = _a.sent();
                        return [2 /*return*/, (0, freeliving_diary_export_csv_1.buildFreeLivingDiaryQuestionnaireCsv)(diaries.map(function (diary) { return ({
                                publicIdentifier: publicIdentifier !== null && publicIdentifier !== void 0 ? publicIdentifier : null,
                                diaryDate: toIsoDate(diary.diary_date),
                                protocolDay: diary.protocol_day,
                                status: diary.status,
                                saveCount: diary.save_count,
                                lastSavedAt: diary.last_saved_at,
                                payload: diary.payload,
                            }); }))];
                }
            });
        });
    };
    FreelivingService.prototype.listRecentDiaries = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var page, pageSize, qb, total, diaries, events, eventsByPatient, _i, events_1, event_1, list;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        page = Math.max(1, Number(query === null || query === void 0 ? void 0 : query.page) || 1);
                        pageSize = Math.min(100, Math.max(1, Number(query === null || query === void 0 ? void 0 : query.pageSize) || 20));
                        qb = this.diariesRepository
                            .createQueryBuilder('d')
                            .innerJoinAndSelect('d.patient', 'p')
                            .where('(p.public_identifier IS NULL OR UPPER(TRIM(p.public_identifier)) NOT IN (:...excluded))', { excluded: __spreadArray([], freeliving_utils_1.EXCLUDED_FREELIVING_PUBLIC_IDS, true) })
                            .orderBy('d.last_saved_at', 'DESC')
                            .addOrderBy('d.diary_date', 'DESC');
                        this.applyDiaryListFilters(qb, query);
                        return [4 /*yield*/, qb.clone().getCount()];
                    case 1:
                        total = _b.sent();
                        return [4 /*yield*/, qb
                                .skip((page - 1) * pageSize)
                                .take(pageSize)
                                .getMany()];
                    case 2:
                        diaries = _b.sent();
                        if (diaries.length === 0) {
                            return [2 /*return*/, { items: [], total: total, page: page, pageSize: pageSize }];
                        }
                        return [4 /*yield*/, this.eventsRepository.find({
                                where: {
                                    patient_id: (0, typeorm_2.In)(diaries.map(function (diary) { return diary.patient_id; })),
                                    action_code: (0, typeorm_2.In)([freeliving_utils_1.ACTION_DIARY_STARTED, freeliving_utils_1.ACTION_DIARY_SUBMITTED]),
                                },
                            })];
                    case 3:
                        events = _b.sent();
                        eventsByPatient = new Map();
                        for (_i = 0, events_1 = events; _i < events_1.length; _i++) {
                            event_1 = events_1[_i];
                            list = (_a = eventsByPatient.get(event_1.patient_id)) !== null && _a !== void 0 ? _a : [];
                            list.push(event_1);
                            eventsByPatient.set(event_1.patient_id, list);
                        }
                        return [2 /*return*/, {
                                items: diaries.map(function (diary) {
                                    var _a;
                                    return _this.toDiaryListItemDto(diary, _this.resolveDiarySource(diary, (_a = eventsByPatient.get(diary.patient_id)) !== null && _a !== void 0 ? _a : []), diary.patient);
                                }),
                                total: total,
                                page: page,
                                pageSize: pageSize,
                            }];
                }
            });
        });
    };
    FreelivingService.prototype.getDiaryById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var diary, patient;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.diariesRepository.findOne({ where: { id: id } })];
                    case 1:
                        diary = _a.sent();
                        if (!diary) {
                            throw new common_1.NotFoundException('Diário não encontrado');
                        }
                        return [4 /*yield*/, this.requireActivePatient(diary.patient_id)];
                    case 2:
                        patient = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, this.toDiaryDto(diary)), { patientId: patient.id, patientName: patient.full_name, publicIdentifier: patient.public_identifier })];
                }
            });
        });
    };
    FreelivingService.prototype.deleteDiary = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var diary;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.diariesRepository.findOne({ where: { id: id } })];
                    case 1:
                        diary = _a.sent();
                        if (!diary) {
                            throw new common_1.NotFoundException('Diário não encontrado');
                        }
                        return [4 /*yield*/, this.requireActivePatient(diary.patient_id)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.diariesRepository.delete(diary.id)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    FreelivingService.prototype.buildDiaryDocumentForPatient = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var patient, meds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.requireActivePatient(patientId)];
                    case 1:
                        patient = _a.sent();
                        return [4 /*yield*/, this.getClinicalMedications(patient.id)];
                    case 2:
                        meds = _a.sent();
                        return [2 /*return*/, (0, freeliving_diary_document_1.buildFreelivingDiaryDocument)({
                                patientName: patient.full_name,
                                publicIdentifier: patient.public_identifier,
                                cpf: patient.cpf,
                                medications: (0, freeliving_clinical_medications_1.toMedicationLabels)(meds.slots),
                            })];
                }
            });
        });
    };
    FreelivingService.prototype.getClinicalMedications = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaire, rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.questionnairesRepository
                            .createQueryBuilder('q')
                            .select(['q.id'])
                            .where('q.patient_id = :patientId', { patientId: patientId })
                            .orderBy('q.free_living_test_recommended', 'DESC')
                            .addOrderBy('q.completed_at', 'DESC', 'NULLS LAST')
                            .addOrderBy('q.updated_at', 'DESC')
                            .limit(1)
                            .getOne()];
                    case 1:
                        questionnaire = _a.sent();
                        if (!questionnaire) {
                            return [2 /*return*/, { slots: [], extraCount: 0 }];
                        }
                        return [4 /*yield*/, this.patientMedicationsRepository
                                .createQueryBuilder('pm')
                                .innerJoin(medication_reference_entity_1.MedicationReference, 'mr', 'mr.id = pm.medication_id')
                                .select([
                                'pm.dose_mg AS dose_mg',
                                'pm.doses_per_day AS doses_per_day',
                                'mr.drug_name AS drug_name',
                            ])
                                .where('pm.questionnaire_id = :questionnaireId', {
                                questionnaireId: questionnaire.id,
                            })
                                .orderBy('pm.created_at', 'ASC')
                                .getRawMany()];
                    case 2:
                        rows = _a.sent();
                        return [2 /*return*/, (0, freeliving_clinical_medications_1.mapMedicationRows)(rows)];
                }
            });
        });
    };
    FreelivingService.prototype.getOverview = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, dateFrom, dateTo, onlyWithActivity, hasFl01, hasFl02, dayStatus, diaryStatusFilter, patientTerm, actionCode, taskCodeFilter, _b, actionTypes, eventRows, fileRows, diaryRows, patientsById, addPatient, _i, eventRows_1, row, _c, fileRows_1, row, _d, diaryRows_1, row, missing, patients, _e, patients_2, p, datesInRange, singleDay, extraPatients, _f, extraPatients_1, p, eventsByKey, _g, eventRows_2, row, date, key, list, filesByKey, _h, fileRows_2, row, date, key, list, diariesByKey, _j, diaryRows_2, row, date, keys, matchingPatients_1, matchingPatients_2, rows, _k, keys_1, key, _l, patientId, collectionDate, patient, events, files, started, finished, fl01Events, fl02Events, fl01, fl02, lastEvent, lastReceived, diary, diaryGaps, overviewDiaryStatus, row, patientIdsWithActivity, iniciaram, finalizaram, ultimoEventoRecebidoAt;
            var _m, _o, _p, _q, _r;
            return __generator(this, function (_s) {
                switch (_s.label) {
                    case 0:
                        _a = this.resolveDateRange(query), dateFrom = _a.dateFrom, dateTo = _a.dateTo;
                        onlyWithActivity = (_m = (0, freeliving_utils_1.parseOptionalBoolean)(query.onlyWithActivity)) !== null && _m !== void 0 ? _m : true;
                        hasFl01 = (0, freeliving_utils_1.parseOptionalBoolean)(query.hasFl01);
                        hasFl02 = (0, freeliving_utils_1.parseOptionalBoolean)(query.hasFl02);
                        dayStatus = this.parseDayStatus(query.dayStatus);
                        diaryStatusFilter = this.parseDiaryOverviewStatus(query.diaryStatus);
                        patientTerm = (query.patient || '').trim();
                        actionCode = (query.actionCode || '').trim();
                        taskCodeFilter = normalizeTaskCode(query.taskCode);
                        return [4 /*yield*/, Promise.all([
                                this.listActionTypes(),
                                this.loadEventsInRange(dateFrom, dateTo, patientTerm),
                                this.loadFilesInRange(dateFrom, dateTo, patientTerm),
                                this.loadDiariesInRange(dateFrom, dateTo, patientTerm),
                            ])];
                    case 1:
                        _b = _s.sent(), actionTypes = _b[0], eventRows = _b[1], fileRows = _b[2], diaryRows = _b[3];
                        patientsById = new Map();
                        addPatient = function (patientId, label, name) {
                            if ((0, freeliving_utils_1.isExcludedFreelivingPublicId)(label))
                                return;
                            if (!patientsById.has(patientId)) {
                                patientsById.set(patientId, {
                                    patientId: patientId,
                                    patientLabel: label || '—',
                                    patientName: name,
                                });
                            }
                        };
                        for (_i = 0, eventRows_1 = eventRows; _i < eventRows_1.length; _i++) {
                            row = eventRows_1[_i];
                            addPatient(row.patient_id, row.public_identifier, row.full_name);
                        }
                        for (_c = 0, fileRows_1 = fileRows; _c < fileRows_1.length; _c++) {
                            row = fileRows_1[_c];
                            addPatient(row.patient_id, null, '');
                        }
                        for (_d = 0, diaryRows_1 = diaryRows; _d < diaryRows_1.length; _d++) {
                            row = diaryRows_1[_d];
                            addPatient(row.patient_id, row.public_identifier, row.full_name);
                        }
                        if (!(fileRows.length > 0)) return [3 /*break*/, 3];
                        missing = __spreadArray([], new Set(fileRows.map(function (r) { return r.patient_id; })), true).filter(function (id) { var _a; return !((_a = patientsById.get(id)) === null || _a === void 0 ? void 0 : _a.patientName); });
                        if (!(missing.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.patientsRepository.find({
                                where: { id: (0, typeorm_2.In)(missing) },
                                select: ['id', 'public_identifier', 'full_name'],
                            })];
                    case 2:
                        patients = _s.sent();
                        for (_e = 0, patients_2 = patients; _e < patients_2.length; _e++) {
                            p = patients_2[_e];
                            if ((0, freeliving_utils_1.isExcludedFreelivingPublicId)(p.public_identifier))
                                continue;
                            patientsById.set(p.id, {
                                patientId: p.id,
                                patientLabel: p.public_identifier || '—',
                                patientName: p.full_name,
                            });
                        }
                        _s.label = 3;
                    case 3:
                        datesInRange = this.enumerateDates(dateFrom, dateTo);
                        singleDay = dateFrom === dateTo;
                        if (!(!onlyWithActivity && singleDay)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.loadActivePatients(patientTerm)];
                    case 4:
                        extraPatients = _s.sent();
                        for (_f = 0, extraPatients_1 = extraPatients; _f < extraPatients_1.length; _f++) {
                            p = extraPatients_1[_f];
                            addPatient(p.id, p.public_identifier, p.full_name);
                        }
                        _s.label = 5;
                    case 5:
                        eventsByKey = new Map();
                        for (_g = 0, eventRows_2 = eventRows; _g < eventRows_2.length; _g++) {
                            row = eventRows_2[_g];
                            date = toIsoDate(row.collection_date);
                            key = "".concat(row.patient_id, "|").concat(date);
                            list = (_o = eventsByKey.get(key)) !== null && _o !== void 0 ? _o : [];
                            list.push(row);
                            eventsByKey.set(key, list);
                        }
                        filesByKey = new Map();
                        for (_h = 0, fileRows_2 = fileRows; _h < fileRows_2.length; _h++) {
                            row = fileRows_2[_h];
                            date = toIsoDate(row.collection_date);
                            key = "".concat(row.patient_id, "|").concat(date);
                            list = (_p = filesByKey.get(key)) !== null && _p !== void 0 ? _p : [];
                            list.push(row);
                            filesByKey.set(key, list);
                        }
                        diariesByKey = new Map();
                        for (_j = 0, diaryRows_2 = diaryRows; _j < diaryRows_2.length; _j++) {
                            row = diaryRows_2[_j];
                            date = toIsoDate(row.diary_date);
                            diariesByKey.set("".concat(row.patient_id, "|").concat(date), row);
                        }
                        if (onlyWithActivity || !singleDay) {
                            keys = __spreadArray([], new Set(__spreadArray(__spreadArray(__spreadArray([], eventsByKey.keys(), true), filesByKey.keys(), true), diariesByKey.keys(), true)), true);
                        }
                        else {
                            keys = __spreadArray([], patientsById.keys(), true).map(function (id) { return "".concat(id, "|").concat(dateFrom); });
                        }
                        if (actionCode) {
                            matchingPatients_1 = new Set(eventRows
                                .filter(function (row) { return row.action_code === actionCode; })
                                .map(function (row) { return row.patient_id; }));
                            keys = keys.filter(function (key) { return matchingPatients_1.has(key.split('|')[0]); });
                        }
                        if (taskCodeFilter) {
                            matchingPatients_2 = new Set(eventRows
                                .filter(function (row) { return normalizeTaskCode(row.task_code) === taskCodeFilter; })
                                .map(function (row) { return row.patient_id; }));
                            keys = keys.filter(function (key) { return matchingPatients_2.has(key.split('|')[0]); });
                        }
                        rows = [];
                        for (_k = 0, keys_1 = keys; _k < keys_1.length; _k++) {
                            key = keys_1[_k];
                            _l = key.split('|'), patientId = _l[0], collectionDate = _l[1];
                            patient = patientsById.get(patientId);
                            if (!patient)
                                continue;
                            if (collectionDate < dateFrom || collectionDate > dateTo)
                                continue;
                            if (!datesInRange.includes(collectionDate) && datesInRange.length > 0) {
                                continue;
                            }
                            events = (_q = eventsByKey.get(key)) !== null && _q !== void 0 ? _q : [];
                            files = (_r = filesByKey.get(key)) !== null && _r !== void 0 ? _r : [];
                            started = events.filter(function (e) { return e.action_code === freeliving_utils_1.ACTION_COLLECTION_STARTED; });
                            finished = events.filter(function (e) { return e.action_code === freeliving_utils_1.ACTION_COLLECTION_FINISHED; });
                            fl01Events = events.filter(function (e) { return normalizeTaskCode(e.task_code) === 'FL01'; });
                            fl02Events = events.filter(function (e) { return normalizeTaskCode(e.task_code) === 'FL02'; });
                            fl01 = files.filter(function (f) { return normalizeTaskCode(f.task_code) === 'FL01'; });
                            fl02 = files.filter(function (f) { return normalizeTaskCode(f.task_code) === 'FL02'; });
                            lastEvent = events.reduce(function (best, current) {
                                if (!best)
                                    return current;
                                return new Date(current.occurred_at).getTime() >
                                    new Date(best.occurred_at).getTime()
                                    ? current
                                    : best;
                            }, null);
                            lastReceived = events.reduce(function (best, current) {
                                if (!best)
                                    return current;
                                return new Date(current.received_at).getTime() >
                                    new Date(best.received_at).getTime()
                                    ? current
                                    : best;
                            }, null);
                            diary = diariesByKey.get(key);
                            diaryGaps = this.parseDiaryGaps(diary === null || diary === void 0 ? void 0 : diary.gaps);
                            overviewDiaryStatus = !diary
                                ? 'sem_registro'
                                : diary.status === 'completo'
                                    ? 'completo'
                                    : 'em_preenchimento';
                            row = {
                                patientId: patient.patientId,
                                patientLabel: patient.patientLabel,
                                patientName: patient.patientName,
                                collectionDate: collectionDate,
                                dayStatus: (0, freeliving_utils_1.deriveDayStatus)(started.length > 0, finished.length > 0),
                                firstStartedAt: this.minIso(started.map(function (e) { return toIsoDateTime(e.occurred_at); })),
                                lastFinishedAt: this.maxIso(finished.map(function (e) { return toIsoDateTime(e.occurred_at); })),
                                eventCount: events.length,
                                fl01DayStatus: (0, freeliving_utils_1.deriveDayStatus)(fl01Events.some(function (e) { return e.action_code === freeliving_utils_1.ACTION_COLLECTION_STARTED; }), fl01Events.some(function (e) { return e.action_code === freeliving_utils_1.ACTION_COLLECTION_FINISHED; })),
                                fl02DayStatus: (0, freeliving_utils_1.deriveDayStatus)(fl02Events.some(function (e) { return e.action_code === freeliving_utils_1.ACTION_COLLECTION_STARTED; }), fl02Events.some(function (e) { return e.action_code === freeliving_utils_1.ACTION_COLLECTION_FINISHED; })),
                                fl01FileCount: fl01.length,
                                fl01LastUploadedAt: this.maxIso(fl01.map(function (f) { return toIsoDateTime(f.uploaded_at); })),
                                fl02FileCount: fl02.length,
                                fl02LastUploadedAt: this.maxIso(fl02.map(function (f) { return toIsoDateTime(f.uploaded_at); })),
                                lastEventAt: lastEvent ? toIsoDateTime(lastEvent.occurred_at) : null,
                                lastEventReceivedAt: lastReceived
                                    ? toIsoDateTime(lastReceived.received_at)
                                    : null,
                                diaryStatus: overviewDiaryStatus,
                                diaryProtocolDay: diary ? Number(diary.protocol_day) : null,
                                diarySaveCount: diary ? Number(diary.save_count) || 0 : 0,
                                diaryGapCount: diaryGaps.length,
                                diaryFilledSectionCount: diary ? (0, freeliving_diary_utils_1.filledSectionCount)(diaryGaps) : 0,
                                diaryLastSavedAt: diary ? toIsoDateTime(diary.last_saved_at) : null,
                            };
                            if (dayStatus && row.dayStatus !== dayStatus)
                                continue;
                            if (diaryStatusFilter && row.diaryStatus !== diaryStatusFilter)
                                continue;
                            if (hasFl01 === true && row.fl01FileCount === 0)
                                continue;
                            if (hasFl01 === false && row.fl01FileCount > 0)
                                continue;
                            if (hasFl02 === true && row.fl02FileCount === 0)
                                continue;
                            if (hasFl02 === false && row.fl02FileCount > 0)
                                continue;
                            rows.push(row);
                        }
                        rows.sort(function (a, b) {
                            var receivedDiff = (b.lastEventReceivedAt ? Date.parse(b.lastEventReceivedAt) : 0) -
                                (a.lastEventReceivedAt ? Date.parse(a.lastEventReceivedAt) : 0);
                            if (receivedDiff !== 0)
                                return receivedDiff;
                            var dateDiff = b.collectionDate.localeCompare(a.collectionDate);
                            if (dateDiff !== 0)
                                return dateDiff;
                            return a.patientLabel.localeCompare(b.patientLabel, 'pt-BR', {
                                numeric: true,
                                sensitivity: 'base',
                            });
                        });
                        patientIdsWithActivity = new Set(rows
                            .filter(function (r) {
                            return r.eventCount > 0 ||
                                r.fl01FileCount > 0 ||
                                r.fl02FileCount > 0 ||
                                r.diaryStatus !== 'sem_registro';
                        })
                            .map(function (r) { return r.patientId; }));
                        iniciaram = new Set(rows
                            .filter(function (r) {
                            return r.dayStatus === 'iniciou' || r.dayStatus === 'iniciou_e_finalizou';
                        })
                            .map(function (r) { return r.patientId; }));
                        finalizaram = new Set(rows
                            .filter(function (r) {
                            return r.dayStatus === 'finalizou' || r.dayStatus === 'iniciou_e_finalizou';
                        })
                            .map(function (r) { return r.patientId; }));
                        ultimoEventoRecebidoAt = this.maxIso(rows.map(function (r) { return r.lastEventReceivedAt; }));
                        return [2 /*return*/, {
                                kpis: {
                                    pacientesComAtividade: patientIdsWithActivity.size,
                                    iniciaram: iniciaram.size,
                                    finalizaram: finalizaram.size,
                                    arquivosFl01: rows.reduce(function (sum, r) { return sum + r.fl01FileCount; }, 0),
                                    arquivosFl02: rows.reduce(function (sum, r) { return sum + r.fl02FileCount; }, 0),
                                    diariosEmPreenchimento: new Set(rows
                                        .filter(function (r) { return r.diaryStatus === 'em_preenchimento'; })
                                        .map(function (r) { return r.patientId; })).size,
                                    diariosCompletos: new Set(rows
                                        .filter(function (r) { return r.diaryStatus === 'completo'; })
                                        .map(function (r) { return r.patientId; })).size,
                                    ultimoEventoRecebidoAt: ultimoEventoRecebidoAt,
                                },
                                rows: rows,
                                meta: {
                                    dateFrom: dateFrom,
                                    dateTo: dateTo,
                                    generatedAt: new Date().toISOString(),
                                    actionTypes: actionTypes,
                                },
                            }];
                }
            });
        });
    };
    FreelivingService.prototype.getPatientDetail = function (patientId, date) {
        return __awaiter(this, void 0, void 0, function () {
            var collectionDate, patient, actionTypes, labelByCode, events, fileRows, diary;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        collectionDate = (0, freeliving_utils_1.isIsoDateOnly)(date) ? date : (0, freeliving_utils_1.todayInSaoPaulo)();
                        return [4 /*yield*/, this.patientsRepository.findOne({
                                where: { id: patientId },
                                select: ['id', 'public_identifier', 'full_name'],
                            })];
                    case 1:
                        patient = _a.sent();
                        if (!patient) {
                            throw new common_1.NotFoundException('Paciente não encontrado');
                        }
                        if ((0, freeliving_utils_1.isExcludedFreelivingPublicId)(patient.public_identifier)) {
                            throw new common_1.NotFoundException('Paciente não encontrado');
                        }
                        return [4 /*yield*/, this.listActionTypes()];
                    case 2:
                        actionTypes = _a.sent();
                        labelByCode = new Map(actionTypes.map(function (t) { return [t.code, t.label_pt]; }));
                        return [4 /*yield*/, this.eventsRepository.find({
                                where: { patient_id: patientId, collection_date: collectionDate },
                                order: { occurred_at: 'ASC', received_at: 'ASC' },
                            })];
                    case 3:
                        events = _a.sent();
                        return [4 /*yield*/, this.loadFilesForPatient(patientId, collectionDate)];
                    case 4:
                        fileRows = _a.sent();
                        return [4 /*yield*/, this.diariesRepository.findOne({
                                where: { patient_id: patientId, diary_date: collectionDate },
                            })];
                    case 5:
                        diary = _a.sent();
                        return [2 /*return*/, {
                                patientId: patient.id,
                                patientLabel: patient.public_identifier || '—',
                                patientName: patient.full_name,
                                collectionDate: collectionDate,
                                events: events.map(function (event) {
                                    return _this.toEventDto(event, {
                                        code: event.action_code,
                                        label_pt: labelByCode.get(event.action_code) || event.action_code,
                                    });
                                }),
                                files: fileRows.map(function (file) { return _this.toFileDto(file); }),
                                diary: diary ? this.toDiaryDto(diary) : null,
                            }];
                }
            });
        });
    };
    FreelivingService.prototype.resolveDateRange = function (query) {
        if ((0, freeliving_utils_1.isIsoDateOnly)(query.date)) {
            return { dateFrom: query.date, dateTo: query.date };
        }
        var dateFrom = (0, freeliving_utils_1.isIsoDateOnly)(query.dateFrom)
            ? query.dateFrom
            : (0, freeliving_utils_1.todayInSaoPaulo)();
        var dateTo = (0, freeliving_utils_1.isIsoDateOnly)(query.dateTo) ? query.dateTo : dateFrom;
        if (dateFrom > dateTo) {
            throw new common_1.BadRequestException('dateFrom não pode ser posterior a dateTo');
        }
        return { dateFrom: dateFrom, dateTo: dateTo };
    };
    FreelivingService.prototype.parseDayStatus = function (value) {
        if (!value)
            return undefined;
        if (freeliving_utils_1.FREELIVING_DAY_STATUSES.includes(value)) {
            return value;
        }
        throw new common_1.BadRequestException("dayStatus inv\u00E1lido: ".concat(value));
    };
    FreelivingService.prototype.parseDiaryOverviewStatus = function (value) {
        if (!value)
            return undefined;
        if (freeliving_diary_types_1.DIARY_OVERVIEW_STATUSES.includes(value)) {
            return value;
        }
        throw new common_1.BadRequestException("diaryStatus inv\u00E1lido: ".concat(value));
    };
    FreelivingService.prototype.listActionTypes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var types;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.actionTypesRepository.find({
                            where: { active: true },
                            order: { sort_order: 'ASC', code: 'ASC' },
                        })];
                    case 1:
                        types = _a.sent();
                        return [2 /*return*/, types.map(function (t) { return ({ code: t.code, label_pt: t.label_pt }); })];
                }
            });
        });
    };
    FreelivingService.prototype.loadActivePatients = function (patientTerm) {
        return __awaiter(this, void 0, void 0, function () {
            var qb;
            return __generator(this, function (_a) {
                qb = this.patientsRepository
                    .createQueryBuilder('p')
                    .select(['p.id', 'p.public_identifier', 'p.full_name'])
                    .where('p.active = true')
                    .andWhere('(p.public_identifier IS NULL OR UPPER(TRIM(p.public_identifier)) NOT IN (:...excluded))', { excluded: __spreadArray([], freeliving_utils_1.EXCLUDED_FREELIVING_PUBLIC_IDS, true) });
                this.applyPatientSearch(qb, patientTerm, 'p');
                return [2 /*return*/, qb.getMany()];
            });
        });
    };
    FreelivingService.prototype.loadEventsInRange = function (dateFrom, dateTo, patientTerm) {
        return __awaiter(this, void 0, void 0, function () {
            var qb;
            return __generator(this, function (_a) {
                qb = this.eventsRepository
                    .createQueryBuilder('e')
                    .innerJoin(patient_entity_1.Patient, 'p', 'p.id = e.patient_id')
                    .select([
                    'e.id AS id',
                    'e.patient_id AS patient_id',
                    'e.action_code AS action_code',
                    'e.task_code AS task_code',
                    'e.occurred_at AS occurred_at',
                    'e.received_at AS received_at',
                    'e.collection_date AS collection_date',
                    'p.public_identifier AS public_identifier',
                    'p.full_name AS full_name',
                ])
                    .where('e.collection_date BETWEEN :dateFrom AND :dateTo', {
                    dateFrom: dateFrom,
                    dateTo: dateTo,
                })
                    .andWhere('(p.public_identifier IS NULL OR UPPER(TRIM(p.public_identifier)) NOT IN (:...excluded))', { excluded: __spreadArray([], freeliving_utils_1.EXCLUDED_FREELIVING_PUBLIC_IDS, true) });
                this.applyPatientSearch(qb, patientTerm, 'p');
                return [2 /*return*/, qb.getRawMany()];
            });
        });
    };
    FreelivingService.prototype.loadFilesInRange = function (dateFrom, dateTo, patientTerm) {
        return __awaiter(this, void 0, void 0, function () {
            var taskCodes, qb;
            return __generator(this, function (_a) {
                taskCodes = this.freeLivingTaskCodes();
                if (taskCodes.length === 0)
                    return [2 /*return*/, []];
                qb = this.binaryCollectionsRepository
                    .createQueryBuilder('bc')
                    .innerJoin(patient_entity_1.Patient, 'p', 'p.cpf_hash = bc.patient_cpf_hash')
                    .leftJoin(active_task_definition_entity_1.ActiveTaskDefinition, 'at', 'at.id = bc.task_id')
                    .select([
                    'bc.id AS id',
                    'p.id AS patient_id',
                    "COALESCE(at.task_code, bc.metadata->>'task_code') AS task_code",
                    'bc.uploaded_at AS uploaded_at',
                    'bc.file_size_bytes AS file_size_bytes',
                    "bc.metadata->>'file_name' AS file_name",
                    "(bc.uploaded_at AT TIME ZONE 'America/Sao_Paulo')::date AS collection_date",
                ])
                    .where('COALESCE(bc.deleted_pending, false) = false')
                    .andWhere("UPPER(TRIM(COALESCE(at.task_code, bc.metadata->>'task_code', ''))) IN (:...taskCodes)", { taskCodes: taskCodes })
                    .andWhere("(bc.uploaded_at AT TIME ZONE 'America/Sao_Paulo')::date BETWEEN :dateFrom AND :dateTo", { dateFrom: dateFrom, dateTo: dateTo })
                    .andWhere('(p.public_identifier IS NULL OR UPPER(TRIM(p.public_identifier)) NOT IN (:...excluded))', { excluded: __spreadArray([], freeliving_utils_1.EXCLUDED_FREELIVING_PUBLIC_IDS, true) });
                this.applyPatientSearch(qb, patientTerm, 'p');
                return [2 /*return*/, qb.getRawMany()];
            });
        });
    };
    FreelivingService.prototype.loadDiariesInRange = function (dateFrom, dateTo, patientTerm) {
        return __awaiter(this, void 0, void 0, function () {
            var qb;
            return __generator(this, function (_a) {
                qb = this.diariesRepository
                    .createQueryBuilder('d')
                    .innerJoin(patient_entity_1.Patient, 'p', 'p.id = d.patient_id')
                    .select([
                    'd.patient_id AS patient_id',
                    'd.diary_date AS diary_date',
                    'd.protocol_day AS protocol_day',
                    'd.status AS status',
                    'd.save_count AS save_count',
                    'd.gaps AS gaps',
                    'd.last_saved_at AS last_saved_at',
                    'p.public_identifier AS public_identifier',
                    'p.full_name AS full_name',
                ])
                    .where('d.diary_date BETWEEN :dateFrom AND :dateTo', { dateFrom: dateFrom, dateTo: dateTo })
                    .andWhere('(p.public_identifier IS NULL OR UPPER(TRIM(p.public_identifier)) NOT IN (:...excluded))', { excluded: __spreadArray([], freeliving_utils_1.EXCLUDED_FREELIVING_PUBLIC_IDS, true) });
                this.applyPatientSearch(qb, patientTerm, 'p');
                return [2 /*return*/, qb.getRawMany()];
            });
        });
    };
    FreelivingService.prototype.loadFilesForPatient = function (patientId, collectionDate) {
        return __awaiter(this, void 0, void 0, function () {
            var taskCodes;
            return __generator(this, function (_a) {
                taskCodes = this.freeLivingTaskCodes();
                if (taskCodes.length === 0)
                    return [2 /*return*/, []];
                return [2 /*return*/, this.binaryCollectionsRepository
                        .createQueryBuilder('bc')
                        .innerJoin(patient_entity_1.Patient, 'p', 'p.cpf_hash = bc.patient_cpf_hash')
                        .leftJoin(active_task_definition_entity_1.ActiveTaskDefinition, 'at', 'at.id = bc.task_id')
                        .select([
                        'bc.id AS id',
                        'p.id AS patient_id',
                        "COALESCE(at.task_code, bc.metadata->>'task_code') AS task_code",
                        'bc.uploaded_at AS uploaded_at',
                        'bc.file_size_bytes AS file_size_bytes',
                        "bc.metadata->>'file_name' AS file_name",
                        "(bc.uploaded_at AT TIME ZONE 'America/Sao_Paulo')::date AS collection_date",
                    ])
                        .where('p.id = :patientId', { patientId: patientId })
                        .andWhere('COALESCE(bc.deleted_pending, false) = false')
                        .andWhere("UPPER(TRIM(COALESCE(at.task_code, bc.metadata->>'task_code', ''))) IN (:...taskCodes)", { taskCodes: taskCodes })
                        .andWhere("(bc.uploaded_at AT TIME ZONE 'America/Sao_Paulo')::date = :collectionDate", { collectionDate: collectionDate })
                        .orderBy('bc.uploaded_at', 'ASC')
                        .getRawMany()];
            });
        });
    };
    FreelivingService.prototype.applyPatientSearch = function (qb, patientTerm, alias) {
        if (!patientTerm)
            return;
        qb.andWhere("(LOWER(COALESCE(".concat(alias, ".full_name, '')) LIKE LOWER(:patientTerm)\n        OR LOWER(COALESCE(").concat(alias, ".public_identifier, '')) LIKE LOWER(:patientTerm))"), { patientTerm: "%".concat(patientTerm, "%") });
    };
    FreelivingService.prototype.freeLivingTaskCodes = function () {
        return expected_binary_files_constants_1.FREE_LIVING_PROTOCOL_TASK_CODES.map(function (c) { return c.toUpperCase(); });
    };
    FreelivingService.prototype.resolveEventTaskCode = function (raw) {
        var taskCode = normalizeTaskCode(raw);
        return taskCode || null;
    };
    FreelivingService.prototype.enumerateDates = function (from, to) {
        var dates = [];
        var cursor = new Date("".concat(from, "T00:00:00Z"));
        var end = new Date("".concat(to, "T00:00:00Z"));
        while (cursor.getTime() <= end.getTime()) {
            dates.push(toIsoDate(cursor));
            cursor.setUTCDate(cursor.getUTCDate() + 1);
        }
        return dates;
    };
    FreelivingService.prototype.minIso = function (values) {
        var valid = values.filter(function (v) { return Boolean(v); });
        if (valid.length === 0)
            return null;
        return valid.reduce(function (min, current) { return (current < min ? current : min); });
    };
    FreelivingService.prototype.maxIso = function (values) {
        var valid = values.filter(function (v) { return Boolean(v); });
        if (valid.length === 0)
            return null;
        return valid.reduce(function (max, current) { return (current > max ? current : max); });
    };
    FreelivingService.prototype.parseDiaryGaps = function (raw) {
        if (!raw)
            return [];
        if (typeof raw === 'string') {
            try {
                var parsed = JSON.parse(raw);
                return Array.isArray(parsed) ? parsed : [];
            }
            catch (_a) {
                return [];
            }
        }
        return Array.isArray(raw) ? raw : [];
    };
    FreelivingService.prototype.toDiaryDto = function (diary) {
        var gaps = Array.isArray(diary.gaps) ? diary.gaps : [];
        var summary = (0, freeliving_diary_utils_1.diarySectionSummary)(gaps);
        return {
            id: diary.id,
            diaryDate: toIsoDate(diary.diary_date),
            protocolDay: diary.protocol_day,
            status: diary.status,
            payload: diary.payload,
            gaps: gaps,
            gapCount: gaps.length,
            filledSectionCount: summary.filledSectionCount,
            sectionCount: summary.sectionCount,
            saveCount: diary.save_count,
            firstSavedAt: toIsoDateTime(diary.first_saved_at) || new Date().toISOString(),
            lastSavedAt: toIsoDateTime(diary.last_saved_at) || new Date().toISOString(),
        };
    };
    FreelivingService.prototype.requireActivePatient = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var patient;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.patientsRepository.findOne({
                            where: { id: patientId },
                        })];
                    case 1:
                        patient = _a.sent();
                        if (!patient || (0, freeliving_utils_1.isExcludedFreelivingPublicId)(patient.public_identifier)) {
                            throw new common_1.NotFoundException('Paciente não encontrado');
                        }
                        return [2 /*return*/, patient];
                }
            });
        });
    };
    FreelivingService.prototype.applyDiaryListFilters = function (qb, query) {
        var status = ((query === null || query === void 0 ? void 0 : query.status) || '').trim().toLowerCase();
        if (status === 'completo' || status === 'rascunho') {
            qb.andWhere('d.status = :status', {
                status: status,
            });
        }
        var source = query === null || query === void 0 ? void 0 : query.source;
        if (source === 'app') {
            qb.andWhere("(d.client_diary_id IS NOT NULL AND TRIM(d.client_diary_id) <> '')");
        }
        else if (source === 'admin') {
            qb.andWhere("(d.client_diary_id IS NULL OR TRIM(d.client_diary_id) = '')");
        }
        var trimmed = ((query === null || query === void 0 ? void 0 : query.term) || '').trim();
        if (!trimmed)
            return;
        var termDigits = trimmed.replace(/\D/g, '');
        var termCompact = trimmed.replace(/\s/g, '');
        var conditions = [
            'LOWER(p.full_name) LIKE LOWER(:term)',
            "to_char(d.diary_date, 'YYYY-MM-DD') LIKE :term",
            "to_char(d.diary_date, 'DD/MM/YYYY') LIKE :term",
            'CAST(d.protocol_day AS TEXT) LIKE :term',
        ];
        var params = { term: "%".concat(trimmed, "%") };
        if (termCompact.length > 0) {
            params.pidTerm = "%".concat(termCompact, "%");
            conditions.push("COALESCE(p.public_identifier, '') ILIKE :pidTerm");
        }
        if (termDigits.length > 0) {
            params.cpfDigitsTerm = "%".concat(termDigits, "%");
            conditions.push("COALESCE(p.cpf, '') LIKE :cpfDigitsTerm");
        }
        var isoDate = parseDiaryFilterDate(trimmed);
        if (isoDate) {
            params.isoDate = isoDate;
            conditions.push('CAST(d.diary_date AS TEXT) = :isoDate');
        }
        qb.andWhere("(".concat(conditions.join(' OR '), ")"), params);
    };
    FreelivingService.prototype.resolveDiarySource = function (diary, events) {
        var sawApp = false;
        var sawAdmin = false;
        for (var _i = 0, events_2 = events; _i < events_2.length; _i++) {
            var event_2 = events_2[_i];
            var metaId = event_2.metadata && typeof event_2.metadata.diaryId === 'string'
                ? event_2.metadata.diaryId
                : null;
            if (metaId !== diary.id)
                continue;
            if (event_2.source === 'admin_manual')
                sawAdmin = true;
            else
                sawApp = true;
        }
        if (sawApp)
            return 'app';
        if (sawAdmin)
            return 'admin';
        return diary.client_diary_id ? 'app' : 'admin';
    };
    FreelivingService.prototype.toDiaryListItemDto = function (diary, source, patient) {
        var _a, _b;
        if (source === void 0) { source = 'admin'; }
        var gaps = Array.isArray(diary.gaps) ? diary.gaps : [];
        var summary = (0, freeliving_diary_utils_1.diarySectionSummary)(gaps);
        return {
            id: diary.id,
            diaryDate: toIsoDate(diary.diary_date),
            protocolDay: diary.protocol_day,
            status: diary.status,
            gapCount: gaps.length,
            filledSectionCount: summary.filledSectionCount,
            sectionCount: summary.sectionCount,
            saveCount: diary.save_count,
            lastSavedAt: toIsoDateTime(diary.last_saved_at) || new Date().toISOString(),
            source: source,
            patientId: (_a = patient === null || patient === void 0 ? void 0 : patient.id) !== null && _a !== void 0 ? _a : diary.patient_id,
            patientName: patient === null || patient === void 0 ? void 0 : patient.full_name,
            publicIdentifier: (_b = patient === null || patient === void 0 ? void 0 : patient.public_identifier) !== null && _b !== void 0 ? _b : null,
        };
    };
    FreelivingService.prototype.recordDiaryMilestone = function (manager, params) {
        return __awaiter(this, void 0, void 0, function () {
            var actionTypesRepo, eventsRepo, actionType, clientEventId, already, entity, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        actionTypesRepo = manager.getRepository(freeliving_action_type_entity_1.FreelivingActionType);
                        eventsRepo = manager.getRepository(freeliving_collection_event_entity_1.FreelivingCollectionEvent);
                        return [4 /*yield*/, actionTypesRepo.findOne({
                                where: { code: params.actionCode, active: true },
                            })];
                    case 1:
                        actionType = _a.sent();
                        if (!actionType) {
                            throw new common_1.BadRequestException("A\u00E7\u00E3o FreeLiving desconhecida ou inativa: ".concat(params.actionCode));
                        }
                        clientEventId = (0, freeliving_diary_utils_1.diaryMilestoneClientEventId)(params.diary.id, params.actionCode);
                        return [4 /*yield*/, eventsRepo.findOne({
                                where: { client_event_id: clientEventId },
                            })];
                    case 2:
                        already = _a.sent();
                        if (already)
                            return [2 /*return*/];
                        entity = eventsRepo.create({
                            patient_id: params.patient.id,
                            patient_cpf_hash: params.patient.cpf_hash,
                            action_code: actionType.code,
                            task_code: null,
                            occurred_at: params.occurredAt,
                            received_at: new Date(),
                            collection_date: params.collectionDate,
                            client_event_id: clientEventId,
                            source: params.source || 'collection_app',
                            device_type: params.device_type,
                            device_model: params.device_model,
                            os_version: params.os_version,
                            app_version: params.app_version,
                            metadata: params.metadata,
                        });
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, eventsRepo.save(entity)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_3 = _a.sent();
                        if (!(0, freeliving_utils_1.isUniqueViolation)(error_3))
                            throw error_3;
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    FreelivingService.prototype.toEventDto = function (event, actionType) {
        return {
            id: event.id,
            actionCode: event.action_code,
            actionLabel: actionType.label_pt,
            taskCode: event.task_code ? normalizeTaskCode(event.task_code) : null,
            occurredAt: toIsoDateTime(event.occurred_at) || new Date().toISOString(),
            receivedAt: toIsoDateTime(event.received_at) || new Date().toISOString(),
            collectionDate: toIsoDate(event.collection_date),
            deviceType: event.device_type,
            deviceModel: event.device_model,
            osVersion: event.os_version,
            appVersion: event.app_version,
            metadata: event.metadata || {},
            source: event.source,
        };
    };
    FreelivingService.prototype.toFileDto = function (file) {
        return {
            id: file.id,
            taskCode: normalizeTaskCode(file.task_code),
            fileName: file.file_name || 'arquivo',
            fileSizeBytes: Number(file.file_size_bytes) || 0,
            uploadedAt: toIsoDateTime(file.uploaded_at) || new Date().toISOString(),
        };
    };
    FreelivingService = __decorate([
        (0, common_1.Injectable)(),
        __param(0, (0, typeorm_1.InjectDataSource)()),
        __param(1, (0, typeorm_1.InjectRepository)(freeliving_collection_event_entity_1.FreelivingCollectionEvent)),
        __param(2, (0, typeorm_1.InjectRepository)(freeliving_action_type_entity_1.FreelivingActionType)),
        __param(3, (0, typeorm_1.InjectRepository)(freeliving_diary_entity_1.FreelivingDiary)),
        __param(4, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
        __param(5, (0, typeorm_1.InjectRepository)(binary_collection_entity_1.BinaryCollection)),
        __param(6, (0, typeorm_1.InjectRepository)(questionnaire_entity_1.Questionnaire)),
        __param(7, (0, typeorm_1.InjectRepository)(patient_medication_entity_1.PatientMedication)),
        __metadata("design:paramtypes", [typeorm_2.DataSource,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository])
    ], FreelivingService);
    return FreelivingService;
}());
exports.FreelivingService = FreelivingService;
