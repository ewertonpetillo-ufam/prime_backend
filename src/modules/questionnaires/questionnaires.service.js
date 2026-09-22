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
exports.QuestionnairesService = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var typeorm_2 = require("typeorm");
var questionnaire_entity_1 = require("../../entities/questionnaire.entity");
var anthropometric_data_entity_1 = require("../../entities/anthropometric-data.entity");
var clinical_assessment_entity_1 = require("../../entities/clinical-assessment.entity");
var gender_type_entity_1 = require("../../entities/gender-type.entity");
var ethnicity_type_entity_1 = require("../../entities/ethnicity-type.entity");
var education_level_entity_1 = require("../../entities/education-level.entity");
var marital_status_type_entity_1 = require("../../entities/marital-status-type.entity");
var income_range_entity_1 = require("../../entities/income-range.entity");
var patient_medication_entity_1 = require("../../entities/patient-medication.entity");
var medication_reference_entity_1 = require("../../entities/medication-reference.entity");
var parkinson_phenotype_entity_1 = require("../../entities/parkinson-phenotype.entity");
var dyskinesia_type_entity_1 = require("../../entities/dyskinesia-type.entity");
var hoehn_yahr_scale_entity_1 = require("../../entities/hoehn-yahr-scale.entity");
var surgery_type_entity_1 = require("../../entities/surgery-type.entity");
var patients_service_1 = require("../patients/patients.service");
var crypto_util_1 = require("../../utils/crypto.util");
var updrs3_score_entity_1 = require("../../entities/updrs3-score.entity");
var meem_score_entity_1 = require("../../entities/meem-score.entity");
var udysrs_score_entity_1 = require("../../entities/udysrs-score.entity");
var stopbang_score_entity_1 = require("../../entities/stopbang-score.entity");
var epworth_score_entity_1 = require("../../entities/epworth-score.entity");
var pdss2_score_entity_1 = require("../../entities/pdss2-score.entity");
var rbdsq_score_entity_1 = require("../../entities/rbdsq-score.entity");
var rbdsq_br_score_entity_1 = require("../../entities/rbdsq-br-score.entity");
var fogq_score_entity_1 = require("../../entities/fogq-score.entity");
var binary_collection_entity_1 = require("../../entities/binary-collection.entity");
var pdf_report_entity_1 = require("../../entities/pdf-report.entity");
var neurological_assessment_csv_util_1 = require("./neurological-assessment-csv.util");
var pdf_reports_service_1 = require("../pdf-reports/pdf-reports.service");
var device_upload_status_utils_1 = require("../admin-collection-overview/device-upload-status.utils");
var active_task_definition_entity_1 = require("../../entities/active-task-definition.entity");
var ufam_prime_dataset_utils_1 = require("../export-prime/ufam-prime-dataset.utils");
var UPDRS_SCORE_FIELDS = [
    'speech',
    'facial_expression',
    'rigidity_neck',
    'rigidity_rue',
    'rigidity_lue',
    'rigidity_rle',
    'rigidity_lle',
    'finger_tapping_right',
    'finger_tapping_left',
    'hand_movements_right',
    'hand_movements_left',
    'pronation_supination_right',
    'pronation_supination_left',
    'toe_tapping_right',
    'toe_tapping_left',
    'leg_agility_right',
    'leg_agility_left',
    'rising_from_chair',
    'gait',
    'freezing_of_gait',
    'postural_stability',
    'posture',
    'global_bradykinesia',
    'postural_tremor_right',
    'postural_tremor_left',
    'kinetic_tremor_right',
    'kinetic_tremor_left',
    'rest_tremor_rue',
    'rest_tremor_lue',
    'rest_tremor_rle',
    'rest_tremor_lle',
    'rest_tremor_lip_jaw',
    'postural_tremor_amplitude',
    'dyskinesia_present',
    'dyskinesia_interfered',
];
var MEEM_SCORE_FIELDS = [
    'orientation_day',
    'orientation_date',
    'orientation_month',
    'orientation_year',
    'orientation_time',
    'orientation_location',
    'orientation_institution',
    'orientation_city',
    'orientation_state',
    'orientation_country',
    'registration_word1',
    'registration_word2',
    'registration_word3',
    'attention_calc1',
    'attention_calc2',
    'attention_calc3',
    'attention_calc4',
    'attention_calc5',
    'recall_word1',
    'recall_word2',
    'recall_word3',
    'language_naming1',
    'language_naming2',
    'language_repetition',
    'language_command1',
    'language_command2',
    'language_command3',
    'language_reading',
    'language_writing',
    'language_copying',
];
var UDYSRS_SCORE_FIELDS = [
    'on_dyskinesia_time',
    'impact_speech',
    'impact_chewing',
    'impact_eating',
    'impact_dressing',
    'impact_hygiene',
    'impact_writing',
    'impact_hobbies',
    'impact_walking',
    'impact_social',
    'impact_emotional',
    'off_dystonia_time',
    'dystonia_activities',
    'dystonia_pain_impact',
    'dystonia_pain_severity',
    'severity_face',
    'severity_neck',
    'severity_right_arm',
    'severity_left_arm',
    'severity_trunk',
    'severity_right_leg',
    'severity_left_leg',
    'disability_communication',
    'disability_drinking',
    'disability_dressing',
    'disability_walking',
];
var STOPBANG_SCORE_FIELDS = [
    'snoring',
    'tired',
    'observed_apnea',
    'blood_pressure',
    'bmi_over_35',
    'age_over_50',
    'neck_circumference_large',
    'gender_male',
];
var EPWORTH_SCORE_FIELDS = [
    'sitting_reading',
    'watching_tv',
    'sitting_inactive_public',
    'passenger_car',
    'lying_down_afternoon',
    'sitting_talking',
    'sitting_after_lunch',
    'car_stopped_traffic',
];
var PDSS2_SCORE_FIELDS = [
    'q1',
    'q2',
    'q3',
    'q4',
    'q5',
    'q6',
    'q7',
    'q8',
    'q9',
    'q10',
    'q11',
    'q12',
    'q13',
    'q14',
    'q15',
];
var RBDSQ_SCORE_FIELDS = [
    'q1_vivid_dreams',
    'q2_aggressive_content',
    'q3_dream_enactment',
    'q4_limb_movements',
    'q5_injury_potential',
    'q6_bed_disruption',
    'q7_awakening_recall',
    'q8_sleep_disruption',
    'q9_neurological_disorder',
    'q10_rem_behavior_problem',
];
// RBDSQ-BR (nova versão brasileira, tabela separada – rbdsq_br_scores)
var RBDSQ_BR_SCORE_FIELDS = [
    'q1_realistic_dreams',
    'q2_aggressive_dreams',
    'q3_dream_enactment',
    'q4_limb_movements',
    'q5_injury_potential',
    'q6_1_vocalizations',
    'q6_2_fighting_movements',
    'q6_3_complex_movements_or_falls',
    'q6_4_objects_falling',
    'q7_movements_cause_awakenings',
    'q8_dream_recall',
    'q9_disturbed_sleep',
    'q10_neurological_disease',
    'neuro_disease_description',
];
var FOGQ_SCORE_FIELDS = [
    'gait_worst_state',
    'impact_daily_activities',
    'feet_stuck',
    'longest_episode',
    'hesitation_initiation',
    'hesitation_turning',
];
var QuestionnairesService = /** @class */ (function () {
    function QuestionnairesService(questionnairesRepository, anthropometricDataRepository, clinicalAssessmentRepository, genderTypeRepository, ethnicityTypeRepository, educationLevelRepository, maritalStatusTypeRepository, incomeRangeRepository, patientMedicationRepository, medicationReferenceRepository, parkinsonPhenotypeRepository, dyskinesiaTypeRepository, hoehnYahrScaleRepository, surgeryTypeRepository, updrs3Repository, meemRepository, udysrsRepository, stopbangRepository, epworthRepository, pdss2Repository, rbdsqRepository, rbdsqBrRepository, fogqRepository, binaryCollectionRepository, pdfReportRepository, activeTaskRepository, patientsService, pdfReportsService) {
        this.questionnairesRepository = questionnairesRepository;
        this.anthropometricDataRepository = anthropometricDataRepository;
        this.clinicalAssessmentRepository = clinicalAssessmentRepository;
        this.genderTypeRepository = genderTypeRepository;
        this.ethnicityTypeRepository = ethnicityTypeRepository;
        this.educationLevelRepository = educationLevelRepository;
        this.maritalStatusTypeRepository = maritalStatusTypeRepository;
        this.incomeRangeRepository = incomeRangeRepository;
        this.patientMedicationRepository = patientMedicationRepository;
        this.medicationReferenceRepository = medicationReferenceRepository;
        this.parkinsonPhenotypeRepository = parkinsonPhenotypeRepository;
        this.dyskinesiaTypeRepository = dyskinesiaTypeRepository;
        this.hoehnYahrScaleRepository = hoehnYahrScaleRepository;
        this.surgeryTypeRepository = surgeryTypeRepository;
        this.updrs3Repository = updrs3Repository;
        this.meemRepository = meemRepository;
        this.udysrsRepository = udysrsRepository;
        this.stopbangRepository = stopbangRepository;
        this.epworthRepository = epworthRepository;
        this.pdss2Repository = pdss2Repository;
        this.rbdsqRepository = rbdsqRepository;
        this.rbdsqBrRepository = rbdsqBrRepository;
        this.fogqRepository = fogqRepository;
        this.binaryCollectionRepository = binaryCollectionRepository;
        this.pdfReportRepository = pdfReportRepository;
        this.activeTaskRepository = activeTaskRepository;
        this.patientsService = patientsService;
        this.pdfReportsService = pdfReportsService;
    }
    QuestionnairesService_1 = QuestionnairesService;
    /**
     * Acumula tempo de sessão corrente no questionário, em segundos.
     * Se não houver sessão aberta, retorna o questionário sem alterações.
     */
    QuestionnairesService.prototype.accumulateSessionTime = function (questionnaire, now, options) {
        if (now === void 0) { now = new Date(); }
        var _a = (options || {}).endSession, endSession = _a === void 0 ? false : _a;
        if (!questionnaire.current_session_started_at) {
            return questionnaire;
        }
        var start = questionnaire.current_session_started_at.getTime();
        var end = now.getTime();
        var diffMs = end - start;
        // Ignorar deltas negativos ou absurdamente grandes (ex.: > 8h)
        var EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;
        if (diffMs <= 0 || diffMs > EIGHT_HOURS_MS) {
            if (endSession) {
                questionnaire.current_session_started_at = null;
            }
            else {
                questionnaire.current_session_started_at = now;
            }
            return questionnaire;
        }
        var deltaSeconds = Math.floor(diffMs / 1000);
        var currentTotal = questionnaire.collection_time_seconds || 0;
        questionnaire.collection_time_seconds = currentTotal + deltaSeconds;
        questionnaire.current_session_started_at = endSession ? null : now;
        return questionnaire;
    };
    /** Avaliador do questionário = usuário autenticado que acabou de persistir alterações. */
    QuestionnairesService.prototype.setQuestionnaireEvaluator = function (questionnaire, evaluatorId) {
        questionnaire.evaluator_id = evaluatorId;
    };
    QuestionnairesService.prototype.assignScoreFields = function (target, dto, fields) {
        fields.forEach(function (field) {
            var value = dto[field];
            if (value !== undefined) {
                target[field] = value;
            }
        });
    };
    QuestionnairesService.prototype.extractScoreData = function (source, fields, extraFields) {
        if (extraFields === void 0) { extraFields = []; }
        if (!source) {
            return null;
        }
        var data = {};
        fields.forEach(function (field) {
            var _a;
            data[field] = (_a = source[field]) !== null && _a !== void 0 ? _a : null;
        });
        extraFields.forEach(function (field) {
            if (field in source) {
                data[field] = source[field];
            }
        });
        return data;
    };
    /**
     * Map frontend gender value to gender_id
     */
    QuestionnairesService.prototype.mapGenderToId = function (gender) {
        return __awaiter(this, void 0, void 0, function () {
            var mapping, code, genderType;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!gender)
                            return [2 /*return*/, null];
                        mapping = {
                            M: 'M',
                            F: 'F',
                            Masculino: 'M',
                            Feminino: 'F',
                            Outro: 'OTHER',
                        };
                        code = mapping[gender] || gender;
                        return [4 /*yield*/, this.genderTypeRepository.findOne({
                                where: { code: code },
                            })];
                    case 1:
                        genderType = _a.sent();
                        return [2 /*return*/, (genderType === null || genderType === void 0 ? void 0 : genderType.id) || null];
                }
            });
        });
    };
    /**
     * Map frontend ethnicity value to ethnicity_id
     */
    QuestionnairesService.prototype.mapEthnicityToId = function (etnia) {
        return __awaiter(this, void 0, void 0, function () {
            var mapping, code, ethnicityType;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!etnia)
                            return [2 /*return*/, null];
                        mapping = {
                            Branco: 'WHITE',
                            Negro: 'BLACK',
                            Pardo: 'BROWN',
                            Amarelo: 'ASIAN',
                            Indígena: 'INDIGENOUS',
                            Outro: 'OTHER',
                        };
                        code = mapping[etnia] || etnia;
                        return [4 /*yield*/, this.ethnicityTypeRepository.findOne({
                                where: { code: code },
                            })];
                    case 1:
                        ethnicityType = _a.sent();
                        return [2 /*return*/, (ethnicityType === null || ethnicityType === void 0 ? void 0 : ethnicityType.id) || null];
                }
            });
        });
    };
    /**
     * Map frontend education value to education_level_id
     */
    QuestionnairesService.prototype.mapEducationToId = function (education) {
        return __awaiter(this, void 0, void 0, function () {
            var mapping, code, educationLevel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!education)
                            return [2 /*return*/, null];
                        mapping = {
                            Analfabeto: 'ILLITERATE',
                            'Ensino Fundamental Incompleto': 'ELEMENTARY_INCOMPLETE',
                            'Ensino Fundamental Completo': 'ELEMENTARY_COMPLETE',
                            'Ensino Médio Incompleto': 'HIGH_SCHOOL_INCOMPLETE',
                            'Ensino Médio Completo': 'HIGH_SCHOOL_COMPLETE',
                            'Ensino Superior Incompleto': 'COLLEGE_INCOMPLETE',
                            'Ensino Superior Completo': 'COLLEGE_COMPLETE',
                            'Pós-Graduação': 'POST_GRADUATE',
                            Outro: 'OTHER',
                        };
                        code = mapping[education] || education;
                        return [4 /*yield*/, this.educationLevelRepository.findOne({
                                where: { code: code },
                            })];
                    case 1:
                        educationLevel = _a.sent();
                        return [2 /*return*/, (educationLevel === null || educationLevel === void 0 ? void 0 : educationLevel.id) || null];
                }
            });
        });
    };
    /**
     * Map frontend marital status value to marital_status_id
     */
    QuestionnairesService.prototype.mapMaritalStatusToId = function (maritalStatus) {
        return __awaiter(this, void 0, void 0, function () {
            var mapping, code, maritalStatusType;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!maritalStatus)
                            return [2 /*return*/, null];
                        mapping = {
                            Solteiro: 'SINGLE',
                            Casado: 'MARRIED',
                            'União estável': 'DOMESTIC_PARTNERSHIP',
                            'Prefere não informar': 'PREFER_NOT_SAY',
                        };
                        code = mapping[maritalStatus] || maritalStatus;
                        return [4 /*yield*/, this.maritalStatusTypeRepository.findOne({
                                where: { code: code },
                            })];
                    case 1:
                        maritalStatusType = _a.sent();
                        return [2 /*return*/, (maritalStatusType === null || maritalStatusType === void 0 ? void 0 : maritalStatusType.id) || null];
                }
            });
        });
    };
    /**
     * Map frontend income range value to income_range_id
     */
    QuestionnairesService.prototype.mapIncomeRangeToId = function (rendaFamiliar) {
        return __awaiter(this, void 0, void 0, function () {
            var mapping, code, incomeRange;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!rendaFamiliar)
                            return [2 /*return*/, null];
                        mapping = {
                            ate_1_salario: 'UP_TO_1',
                            '2_4_salarios': '2_TO_4',
                            '4_salarios_ou_mais': '4_PLUS',
                        };
                        code = mapping[rendaFamiliar] || rendaFamiliar;
                        return [4 /*yield*/, this.incomeRangeRepository.findOne({
                                where: { code: code },
                            })];
                    case 1:
                        incomeRange = _a.sent();
                        return [2 /*return*/, (incomeRange === null || incomeRange === void 0 ? void 0 : incomeRange.id) || null];
                }
            });
        });
    };
    /**
     * Parse smoking duration from string (e.g., "10 anos" -> 10)
     */
    QuestionnairesService.prototype.parseSmokingDuration = function (duration) {
        if (!duration)
            return null;
        var match = duration.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : null;
    };
    /**
     * Normalize "Sim"/"Não" style answers (or boolean-ish strings) to booleans
     */
    QuestionnairesService.prototype.normalizeYesNoBoolean = function (value) {
        if (value === null || value === undefined)
            return null;
        if (typeof value === 'boolean')
            return value;
        var normalized = value.trim().toLowerCase();
        if (['sim', 'true', '1'].includes(normalized))
            return true;
        if (['não', 'nao', 'false', '0'].includes(normalized))
            return false;
        return null;
    };
    /**
     * Normalize affected side value to match database constraint
     * Valid values: 'Direito', 'Esquerdo', 'Bilateral', 'Não especificado'
     */
    QuestionnairesService.prototype.normalizeAffectedSide = function (side) {
        if (!side || side.trim() === '')
            return null;
        var normalized = side.trim();
        var lower = normalized.toLowerCase();
        // Map common variations to valid values
        if (lower === 'direito' || lower === 'd' || lower === 'right') {
            return 'Direito';
        }
        if (lower === 'esquerdo' || lower === 'e' || lower === 'left') {
            return 'Esquerdo';
        }
        if (lower === 'bilateral' ||
            lower === 'b' ||
            lower === 'ambos' ||
            lower === 'both') {
            return 'Bilateral';
        }
        if (lower === 'não especificado' ||
            lower === 'nao especificado' ||
            lower === 'não especificado' ||
            lower === 'n/a' ||
            lower === 'na' ||
            lower === 'não informado' ||
            lower === 'nao informado' ||
            lower === 'not specified') {
            return 'Não especificado';
        }
        // If it matches one of the valid values exactly (case-insensitive), return it
        var validValues = [
            'Direito',
            'Esquerdo',
            'Bilateral',
            'Não especificado',
        ];
        var matched = validValues.find(function (v) { return v.toLowerCase() === lower; });
        if (matched) {
            return matched;
        }
        // If no match, return null (will be stored as null, which is allowed)
        return null;
    };
    /**
     * Alinha o estágio Hoehn–Yahr ao mesmo texto dos <option value> do frontend.
     * Colunas decimal no PG podem vir como "2.5000" e quebram o <select> controlado.
     */
    QuestionnairesService.prototype.normalizeHoehnYahrStageForFrontend = function (stageValue) {
        var allowed = [0, 1, 1.5, 2, 2.5, 3, 4, 5];
        if (stageValue === null || stageValue === undefined) {
            return '';
        }
        var n;
        if (typeof stageValue === 'number') {
            if (!Number.isFinite(stageValue))
                return '';
            n = stageValue;
        }
        else {
            var s = String(stageValue).trim().replace(',', '.');
            if (s === '')
                return '';
            n = parseFloat(s);
            if (!Number.isFinite(n))
                return '';
        }
        var matched = allowed.find(function (a) { return Math.abs(a - n) < 1e-9; });
        return matched !== undefined ? String(matched) : '';
    };
    /**
     * Get or create medication reference by drug name
     * Uses the same LED conversion factors as the frontend
     */
    QuestionnairesService.prototype.getOrCreateMedicationReference = function (drugName, customConversionFactor) {
        return __awaiter(this, void 0, void 0, function () {
            var medication, LEDD_CONVERSION_FACTORS, conversionFactor;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!drugName || drugName.trim() === '') {
                            throw new common_1.BadRequestException('Drug name is required');
                        }
                        return [4 /*yield*/, this.medicationReferenceRepository.findOne({
                                where: { drug_name: drugName.trim() },
                            })];
                    case 1:
                        medication = _a.sent();
                        if (!medication) return [3 /*break*/, 4];
                        if (!(customConversionFactor !== undefined &&
                            medication.led_conversion_factor !== customConversionFactor)) return [3 /*break*/, 3];
                        medication.led_conversion_factor = customConversionFactor;
                        return [4 /*yield*/, this.medicationReferenceRepository.save(medication)];
                    case 2:
                        medication = _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, medication];
                    case 4:
                        LEDD_CONVERSION_FACTORS = {
                            Amantadine: 1,
                            Apomorphine: 10,
                            Azilect: 100, // rasagiline
                            Bromocriptine: 10,
                            Cabergoline: 80,
                            Duodopa: 1.11,
                            Levodopa: 1,
                            'Levodopa CR': 0.75,
                            'Levodopa with Entacapone': 1.33,
                            'Levodopa with Tolcapone': 1.5,
                            Lisuride: 100,
                            Madopar: 1, // levodopa+benserazida
                            Mirapex: 100, // pramipexole
                            Pergolide: 100,
                            Pramipexole: 100,
                            Rasagiline: 100,
                            Requip: 20, // ropinirole
                            RequipXL: 20, // ropinirole CR
                            Ropinirole: 20,
                            RopiniroleCR: 20,
                            Rotigotine: 30,
                            Rytary: 0.6,
                            'Selegiline Oral': 10,
                            'Selegiline Sublingual': 80,
                            Sinemet: 1, // levodopa+carbidopa
                            'Sinemet CR': 0.75,
                            Stalevo: 1.33,
                        };
                        conversionFactor = customConversionFactor !== undefined
                            ? customConversionFactor
                            : LEDD_CONVERSION_FACTORS[drugName.trim()] || 1.0;
                        // Create new medication reference
                        medication = this.medicationReferenceRepository.create({
                            drug_name: drugName.trim(),
                            led_conversion_factor: conversionFactor,
                            active: true,
                        });
                        return [4 /*yield*/, this.medicationReferenceRepository.save(medication)];
                    case 5: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Save Step 1: Create or update patient and questionnaire
     */
    QuestionnairesService.prototype.saveStep1 = function (dto, evaluatorId) {
        return __awaiter(this, void 0, void 0, function () {
            var cpf, patient, error_1, gender_id, ethnicity_id, education_level_id, marital_status_id, income_range_id, is_current_smoker, smoking_duration_years, years_since_quit_smoking, smoked_before, tcle_signed, isHealthyControl, companionPhone, updateData, questionnaire, currentLastStep, currentLastStep;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        cpf = dto.cpf.replace(/\D/g, '');
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.patientsService.findByCpf(cpf)];
                    case 2:
                        patient = _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _c.sent();
                        // Patient doesn't exist, create new one
                        patient = null;
                        return [3 /*break*/, 4];
                    case 4: return [4 /*yield*/, this.mapGenderToId(dto.gender)];
                    case 5:
                        gender_id = _c.sent();
                        return [4 /*yield*/, this.mapEthnicityToId(dto.etnia)];
                    case 6:
                        ethnicity_id = _c.sent();
                        return [4 /*yield*/, this.mapEducationToId(dto.education)];
                    case 7:
                        education_level_id = _c.sent();
                        return [4 /*yield*/, this.mapMaritalStatusToId(dto.maritalStatus)];
                    case 8:
                        marital_status_id = _c.sent();
                        return [4 /*yield*/, this.mapIncomeRangeToId(dto.rendaFamiliar)];
                    case 9:
                        income_range_id = _c.sent();
                        is_current_smoker = dto.fumaCase === 'Sim' || dto.fumaCase === true;
                        smoking_duration_years = is_current_smoker
                            ? this.parseSmokingDuration(dto.smokingDuration)
                            : null;
                        years_since_quit_smoking = !is_current_smoker && dto.fumouAntes === 'Sim'
                            ? this.parseSmokingDuration(dto.stoppedSmokingDuration)
                            : null;
                        smoked_before = is_current_smoker
                            ? true
                            : this.normalizeYesNoBoolean(dto.fumouAntes);
                        tcle_signed = this.normalizeYesNoBoolean(dto.tcleAssinado);
                        isHealthyControl = dto.isHealthyControl === true;
                        companionPhone = isHealthyControl
                            ? null
                            : dto.phoneNumberContact && String(dto.phoneNumberContact).trim() !== ''
                                ? dto.phoneNumberContact
                                : null;
                        if (!patient) return [3 /*break*/, 14];
                        updateData = {
                            full_name: dto.fullName,
                            date_of_birth: dto.birthday,
                            gender_id: gender_id,
                            ethnicity_id: ethnicity_id,
                            nationality: dto.nationality || 'Brasileiro',
                            email: dto.email,
                            phone_primary: dto.phoneNumber,
                            phone_secondary: companionPhone,
                            education_level_id: education_level_id,
                            education_other: dto.educationOther,
                            marital_status_id: marital_status_id,
                            occupation: dto.occupation,
                            income_range_id: income_range_id,
                            is_current_smoker: is_current_smoker,
                            smoking_duration_years: smoking_duration_years,
                            years_since_quit_smoking: years_since_quit_smoking,
                            smoked_before: smoked_before,
                            visual_impairment: dto.deficienciaVisual === 'Sim',
                            hoarseness: dto.rouquidao === 'Sim',
                            stuttering: dto.gagueja === 'Sim',
                            can_read: this.normalizeYesNoBoolean(dto.canRead),
                            can_write: this.normalizeYesNoBoolean(dto.canWrite),
                            dominant_hand: dto.dominantHand || null,
                            tcle_signed: tcle_signed,
                        };
                        // Update CPF if it's missing (for existing patients that don't have it)
                        if (!patient.cpf) {
                            updateData.cpf = cpf;
                        }
                        return [4 /*yield*/, this.patientsService.update(patient.id, updateData)];
                    case 10:
                        _c.sent();
                        return [4 /*yield*/, this.patientsService.findOne(patient.id)];
                    case 11:
                        // Reload patient to get updated data - relations are eager loaded in entity
                        patient = _c.sent();
                        if (!!patient.public_identifier) return [3 /*break*/, 13];
                        return [4 /*yield*/, this.patientsService.ensurePublicIdentifier(patient.id)];
                    case 12:
                        patient = _c.sent();
                        _c.label = 13;
                    case 13: return [3 /*break*/, 16];
                    case 14: return [4 /*yield*/, this.patientsService.createWithPublicIdentifier({
                            cpf: cpf,
                            full_name: dto.fullName,
                            date_of_birth: dto.birthday,
                            gender_id: gender_id,
                            ethnicity_id: ethnicity_id,
                            nationality: dto.nationality || 'Brasileiro',
                            email: dto.email,
                            phone_primary: dto.phoneNumber,
                            phone_secondary: companionPhone,
                            education_level_id: education_level_id,
                            education_other: dto.educationOther,
                            marital_status_id: marital_status_id,
                            occupation: dto.occupation,
                            income_range_id: income_range_id,
                            is_current_smoker: is_current_smoker,
                            smoking_duration_years: smoking_duration_years,
                            years_since_quit_smoking: years_since_quit_smoking,
                            smoked_before: smoked_before,
                            visual_impairment: dto.deficienciaVisual === 'Sim',
                            hoarseness: dto.rouquidao === 'Sim',
                            stuttering: dto.gagueja === 'Sim',
                            can_read: this.normalizeYesNoBoolean(dto.canRead),
                            can_write: this.normalizeYesNoBoolean(dto.canWrite),
                            dominant_hand: dto.dominantHand || null,
                            tcle_signed: tcle_signed,
                        })];
                    case 15:
                        // Create new patient (identificador público só neste fluxo — Step 1)
                        patient = _c.sent();
                        _c.label = 16;
                    case 16:
                        questionnaire = null;
                        if (!dto.questionnaireId) return [3 /*break*/, 20];
                        return [4 /*yield*/, this.questionnairesRepository.findOne({
                                where: { id: dto.questionnaireId },
                            })];
                    case 17:
                        questionnaire = _c.sent();
                        if (!(questionnaire && questionnaire.patient_id === patient.id)) return [3 /*break*/, 19];
                        // Update existing questionnaire (even if it's completed, we're editing it)
                        questionnaire.collection_date = new Date(dto.dataColeta);
                        questionnaire.status = 'in_progress';
                        questionnaire.is_healthy_control = isHealthyControl;
                        currentLastStep = (_a = questionnaire.last_step) !== null && _a !== void 0 ? _a : 0;
                        questionnaire.last_step = Math.max(currentLastStep, 1);
                        // Atualizar avaliador caso tenha mudado
                        questionnaire.evaluator_id = evaluatorId;
                        return [4 /*yield*/, this.questionnairesRepository.save(questionnaire)];
                    case 18:
                        questionnaire = _c.sent();
                        return [3 /*break*/, 20];
                    case 19:
                        // Invalid questionnaireId or doesn't belong to this patient
                        questionnaire = null;
                        _c.label = 20;
                    case 20:
                        if (!!questionnaire) return [3 /*break*/, 22];
                        return [4 /*yield*/, this.questionnairesRepository.findOne({
                                where: {
                                    patient_id: patient.id,
                                },
                                order: { created_at: 'DESC' },
                            })];
                    case 21:
                        questionnaire = _c.sent();
                        _c.label = 22;
                    case 22:
                        if (!!questionnaire) return [3 /*break*/, 24];
                        // Create new questionnaire (primeiro questionário do paciente)
                        questionnaire = this.questionnairesRepository.create({
                            patient_id: patient.id,
                            evaluator_id: evaluatorId,
                            collection_date: new Date(dto.dataColeta),
                            status: 'in_progress',
                            last_step: 1,
                            is_healthy_control: isHealthyControl,
                        });
                        return [4 /*yield*/, this.questionnairesRepository.save(questionnaire)];
                    case 23:
                        questionnaire = _c.sent();
                        return [3 /*break*/, 26];
                    case 24:
                        if (!!dto.questionnaireId) return [3 /*break*/, 26];
                        // Update existing questionnaire (only if we didn't already update it above)
                        questionnaire.collection_date = new Date(dto.dataColeta);
                        questionnaire.status = 'in_progress';
                        questionnaire.is_healthy_control = isHealthyControl;
                        currentLastStep = (_b = questionnaire.last_step) !== null && _b !== void 0 ? _b : 0;
                        questionnaire.last_step = Math.max(currentLastStep, 1);
                        // Atualizar avaliador caso tenha mudado
                        questionnaire.evaluator_id = evaluatorId;
                        this.accumulateSessionTime(questionnaire, new Date());
                        return [4 /*yield*/, this.questionnairesRepository.save(questionnaire)];
                    case 25:
                        questionnaire = _c.sent();
                        _c.label = 26;
                    case 26: return [2 /*return*/, {
                            questionnaireId: questionnaire.id,
                            patientId: patient.id,
                        }];
                }
            });
        });
    };
    /**
     * Save Step 2: Save anthropometric data
     */
    QuestionnairesService.prototype.saveStep2 = function (dto, evaluatorId) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaire, anthropometricData, currentLastStep;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.questionnairesRepository.findOne({
                            where: { id: dto.questionnaireId },
                        })];
                    case 1:
                        questionnaire = _b.sent();
                        if (!questionnaire) {
                            throw new common_1.NotFoundException("Questionnaire with ID ".concat(dto.questionnaireId, " not found"));
                        }
                        return [4 /*yield*/, this.anthropometricDataRepository.findOne({
                                where: { questionnaire_id: dto.questionnaireId },
                            })];
                    case 2:
                        anthropometricData = _b.sent();
                        if (!anthropometricData) {
                            anthropometricData = this.anthropometricDataRepository.create({
                                questionnaire_id: dto.questionnaireId,
                                weight_kg: dto.weight ? parseFloat(String(dto.weight)) : null,
                                height_cm: dto.height ? parseFloat(String(dto.height)) : null,
                                waist_circumference_cm: dto.waistSize
                                    ? parseFloat(String(dto.waistSize))
                                    : null,
                                hip_circumference_cm: dto.hipSize
                                    ? parseFloat(String(dto.hipSize))
                                    : null,
                                abdominal_circumference_cm: dto.abdominal
                                    ? parseFloat(String(dto.abdominal))
                                    : null,
                                neck_circumference_cm: dto.neckCircumference
                                    ? parseFloat(String(dto.neckCircumference))
                                    : null,
                            });
                        }
                        else {
                            anthropometricData.weight_kg = dto.weight
                                ? parseFloat(String(dto.weight))
                                : anthropometricData.weight_kg;
                            anthropometricData.height_cm = dto.height
                                ? parseFloat(String(dto.height))
                                : anthropometricData.height_cm;
                            anthropometricData.waist_circumference_cm = dto.waistSize
                                ? parseFloat(String(dto.waistSize))
                                : anthropometricData.waist_circumference_cm;
                            anthropometricData.hip_circumference_cm = dto.hipSize
                                ? parseFloat(String(dto.hipSize))
                                : anthropometricData.hip_circumference_cm;
                            anthropometricData.abdominal_circumference_cm = dto.abdominal
                                ? parseFloat(String(dto.abdominal))
                                : anthropometricData.abdominal_circumference_cm;
                            anthropometricData.neck_circumference_cm = dto.neckCircumference
                                ? parseFloat(String(dto.neckCircumference))
                                : anthropometricData.neck_circumference_cm;
                        }
                        currentLastStep = (_a = questionnaire.last_step) !== null && _a !== void 0 ? _a : 0;
                        questionnaire.last_step = Math.max(currentLastStep, 2);
                        this.accumulateSessionTime(questionnaire, new Date());
                        this.setQuestionnaireEvaluator(questionnaire, evaluatorId);
                        return [4 /*yield*/, this.questionnairesRepository.save(questionnaire)];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, this.anthropometricDataRepository.save(anthropometricData)];
                    case 4: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    /**
     * Save Step 3: Save clinical assessment data
     */
    QuestionnairesService.prototype.saveStep3 = function (dto, evaluatorId) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaire, clinicalAssessment, hoehnYahrStageId, stage, hoehnYahr, allStages, schwabEnglandScore, has_family_history, phenotype_id, phenotype, dyskinesia_type_id, dyskinesia_type_codes, fogList, dyskinesiaTypes, descriptions, average_on_time_hours, ldopa_onset_time_hours, normalizedAffectedSide, has_surgery_history, surgery_year, surgery_type_id, surgeryType, savedClinicalAssessment, _i, _a, medDto, drugName, customFactor, medicationRef, dosesPerDay, patientMedication, error_2, currentLastStep;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.questionnairesRepository.findOne({
                            where: { id: dto.questionnaireId },
                        })];
                    case 1:
                        questionnaire = _c.sent();
                        if (!questionnaire) {
                            throw new common_1.NotFoundException("Questionnaire with ID ".concat(dto.questionnaireId, " not found"));
                        }
                        return [4 /*yield*/, this.clinicalAssessmentRepository.findOne({
                                where: { questionnaire_id: dto.questionnaireId },
                            })];
                    case 2:
                        clinicalAssessment = _c.sent();
                        hoehnYahrStageId = null;
                        if (!dto.scaleHY) return [3 /*break*/, 7];
                        stage = parseFloat(dto.scaleHY);
                        console.log('🔍 DEBUG - Salvando scaleHY:', {
                            'dto.scaleHY': dto.scaleHY,
                            'stage (parseFloat)': stage,
                            'tipo stage': typeof stage,
                            isNaN: isNaN(stage),
                        });
                        if (!!isNaN(stage)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.hoehnYahrScaleRepository
                                .createQueryBuilder('hys')
                                .where('hys.stage = :stage', { stage: stage })
                                .getOne()];
                    case 3:
                        hoehnYahr = _c.sent();
                        console.log('🔍 DEBUG - Hoehn-Yahr encontrado:', {
                            hoehnYahr: hoehnYahr
                                ? {
                                    id: hoehnYahr.id,
                                    stage: hoehnYahr.stage,
                                    tipo_stage: typeof hoehnYahr.stage,
                                }
                                : null,
                        });
                        if (!!hoehnYahr) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.hoehnYahrScaleRepository.find()];
                    case 4:
                        allStages = _c.sent();
                        console.log('🔍 DEBUG - Todos os stages disponíveis:', allStages.map(function (h) { return ({
                            id: h.id,
                            stage: h.stage,
                            tipo: typeof h.stage,
                        }); }));
                        _c.label = 5;
                    case 5:
                        hoehnYahrStageId = (hoehnYahr === null || hoehnYahr === void 0 ? void 0 : hoehnYahr.id) || null;
                        return [3 /*break*/, 7];
                    case 6:
                        console.log('🔍 DEBUG - scaleHY não é um número válido');
                        _c.label = 7;
                    case 7:
                        schwabEnglandScore = dto.scaleSE ? parseInt(dto.scaleSE, 10) : null;
                        has_family_history = dto.familyCase === 'Sim';
                        phenotype_id = null;
                        if (!dto.mainPhenotype) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.parkinsonPhenotypeRepository.findOne({
                                where: { description: dto.mainPhenotype },
                            })];
                    case 8:
                        phenotype = _c.sent();
                        phenotype_id = (phenotype === null || phenotype === void 0 ? void 0 : phenotype.id) || null;
                        _c.label = 9;
                    case 9:
                        dyskinesia_type_id = null;
                        dyskinesia_type_codes = null;
                        fogList = Array.isArray(dto.fogClassifcationList) &&
                            dto.fogClassifcationList.length > 0
                            ? dto.fogClassifcationList
                            : dto.fogClassifcation
                                ? [dto.fogClassifcation]
                                : [];
                        if (!(fogList.length > 0)) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.dyskinesiaTypeRepository.find({
                                where: fogList.map(function (description) { return ({ description: description }); }),
                            })];
                    case 10:
                        dyskinesiaTypes = _c.sent();
                        if (dyskinesiaTypes.length > 0) {
                            dyskinesia_type_id = dyskinesiaTypes[0].id;
                            descriptions = dyskinesiaTypes.map(function (dt) { return dt.description; });
                            dyskinesia_type_codes = JSON.stringify(descriptions);
                        }
                        _c.label = 11;
                    case 11:
                        average_on_time_hours = dto.durationWearingOff
                            ? this.parseSmokingDuration(dto.durationWearingOff)
                            : null;
                        ldopa_onset_time_hours = dto.durationLDopa
                            ? this.parseSmokingDuration(dto.durationLDopa)
                            : null;
                        normalizedAffectedSide = this.normalizeAffectedSide(dto.parkinsonSide);
                        has_surgery_history = dto.surgery === 'Sim';
                        surgery_year = dto.surgerrYear ? parseInt(dto.surgerrYear, 10) : null;
                        surgery_type_id = null;
                        if (!dto.surgeryType) return [3 /*break*/, 13];
                        return [4 /*yield*/, this.surgeryTypeRepository.findOne({
                                where: { description: dto.surgeryType },
                            })];
                    case 12:
                        surgeryType = _c.sent();
                        surgery_type_id = (surgeryType === null || surgeryType === void 0 ? void 0 : surgeryType.id) || null;
                        _c.label = 13;
                    case 13:
                        if (!clinicalAssessment) {
                            clinicalAssessment = this.clinicalAssessmentRepository.create({
                                questionnaire_id: dto.questionnaireId,
                                diagnostic_description: dto.diagnosticDescription || '',
                                age_at_onset: dto.onsetAge ? parseInt(String(dto.onsetAge), 10) : null,
                                initial_symptom: dto.initialSympton,
                                affected_side: normalizedAffectedSide,
                                phenotype_id: phenotype_id,
                                hoehn_yahr_stage_id: hoehnYahrStageId,
                                schwab_england_score: schwabEnglandScore,
                                has_family_history: has_family_history,
                                family_kinship_degree: dto.kinshipDegree,
                                has_dyskinesia: dto.diskinectiaPresence || false,
                                has_freezing_of_gait: dto.fog || false,
                                has_wearing_off: dto.wearingOff || false,
                                average_on_time_hours: average_on_time_hours,
                                has_delayed_on: dto.DelayOn || false,
                                ldopa_onset_time_hours: ldopa_onset_time_hours,
                                assessed_on_levodopa: dto.levodopaOn || false,
                                dyskinesia_type_id: dyskinesia_type_id,
                                dyskinesia_type_codes: dyskinesia_type_codes,
                                comorbidities: dto.comorbidities,
                                other_medications: dto.otherMedications,
                                medication_allergies: dto.medicationAllergies,
                                food_allergies: dto.foodAllergies,
                                has_surgery_history: has_surgery_history,
                                surgery_year: surgery_year,
                                surgery_type_id: surgery_type_id,
                                surgery_target: dto.surgeryTarget,
                                disease_evolution: dto.evolution,
                                current_symptoms: dto.symptom,
                            });
                        }
                        else {
                            clinicalAssessment.diagnostic_description =
                                dto.diagnosticDescription || clinicalAssessment.diagnostic_description;
                            clinicalAssessment.age_at_onset = dto.onsetAge
                                ? parseInt(String(dto.onsetAge), 10)
                                : clinicalAssessment.age_at_onset;
                            clinicalAssessment.initial_symptom =
                                dto.initialSympton || clinicalAssessment.initial_symptom;
                            clinicalAssessment.affected_side =
                                normalizedAffectedSide !== null
                                    ? normalizedAffectedSide
                                    : clinicalAssessment.affected_side;
                            clinicalAssessment.phenotype_id =
                                phenotype_id !== null ? phenotype_id : clinicalAssessment.phenotype_id;
                            // Atualizar hoehn_yahr_stage_id apenas se um novo valor foi fornecido
                            if (hoehnYahrStageId !== null) {
                                clinicalAssessment.hoehn_yahr_stage_id = hoehnYahrStageId;
                            }
                            else if (dto.scaleHY === '' ||
                                dto.scaleHY === null ||
                                dto.scaleHY === undefined) {
                                // Se scaleHY foi explicitamente enviado como vazio, limpar o campo
                                clinicalAssessment.hoehn_yahr_stage_id = null;
                            }
                            // Caso contrário, manter o valor existente
                            clinicalAssessment.schwab_england_score =
                                schwabEnglandScore || clinicalAssessment.schwab_england_score;
                            clinicalAssessment.has_family_history = has_family_history;
                            clinicalAssessment.family_kinship_degree =
                                dto.kinshipDegree || clinicalAssessment.family_kinship_degree;
                            clinicalAssessment.has_dyskinesia =
                                dto.diskinectiaPresence || clinicalAssessment.has_dyskinesia;
                            clinicalAssessment.has_freezing_of_gait =
                                dto.fog || clinicalAssessment.has_freezing_of_gait;
                            clinicalAssessment.has_wearing_off =
                                dto.wearingOff || clinicalAssessment.has_wearing_off;
                            clinicalAssessment.average_on_time_hours =
                                average_on_time_hours || clinicalAssessment.average_on_time_hours;
                            clinicalAssessment.has_delayed_on =
                                dto.DelayOn || clinicalAssessment.has_delayed_on;
                            clinicalAssessment.ldopa_onset_time_hours =
                                ldopa_onset_time_hours || clinicalAssessment.ldopa_onset_time_hours;
                            clinicalAssessment.assessed_on_levodopa =
                                dto.levodopaOn || clinicalAssessment.assessed_on_levodopa;
                            if (dyskinesia_type_id !== null) {
                                clinicalAssessment.dyskinesia_type_id = dyskinesia_type_id;
                            }
                            if (dyskinesia_type_codes !== null) {
                                clinicalAssessment.dyskinesia_type_codes = dyskinesia_type_codes;
                            }
                            clinicalAssessment.dyskinesia_type_id =
                                dyskinesia_type_id !== null
                                    ? dyskinesia_type_id
                                    : clinicalAssessment.dyskinesia_type_id;
                            clinicalAssessment.comorbidities =
                                dto.comorbidities || clinicalAssessment.comorbidities;
                            clinicalAssessment.other_medications =
                                dto.otherMedications || clinicalAssessment.other_medications;
                            clinicalAssessment.medication_allergies =
                                dto.medicationAllergies || clinicalAssessment.medication_allergies;
                            clinicalAssessment.food_allergies =
                                dto.foodAllergies || clinicalAssessment.food_allergies;
                            clinicalAssessment.has_surgery_history = has_surgery_history;
                            clinicalAssessment.surgery_year =
                                surgery_year !== null ? surgery_year : clinicalAssessment.surgery_year;
                            clinicalAssessment.surgery_type_id =
                                surgery_type_id !== null
                                    ? surgery_type_id
                                    : clinicalAssessment.surgery_type_id;
                            clinicalAssessment.surgery_target =
                                dto.surgeryTarget || clinicalAssessment.surgery_target;
                            clinicalAssessment.disease_evolution =
                                dto.evolution || clinicalAssessment.disease_evolution;
                            clinicalAssessment.current_symptoms =
                                dto.symptom || clinicalAssessment.current_symptoms;
                        }
                        return [4 /*yield*/, this.clinicalAssessmentRepository.save(clinicalAssessment)];
                    case 14:
                        savedClinicalAssessment = _c.sent();
                        console.log('🔍 DEBUG - Clinical assessment salvo:', {
                            'savedClinicalAssessment.id': savedClinicalAssessment.id,
                            'hoehn_yahr_stage_id salvo': savedClinicalAssessment.hoehn_yahr_stage_id,
                            'tipo hoehn_yahr_stage_id': typeof savedClinicalAssessment.hoehn_yahr_stage_id,
                        });
                        if (!(dto.medications && Array.isArray(dto.medications))) return [3 /*break*/, 22];
                        // First, remove existing medications for this questionnaire
                        // Always delete, even if array is empty (to handle removal of all medications)
                        return [4 /*yield*/, this.patientMedicationRepository.delete({
                                questionnaire_id: dto.questionnaireId,
                            })];
                    case 15:
                        // First, remove existing medications for this questionnaire
                        // Always delete, even if array is empty (to handle removal of all medications)
                        _c.sent();
                        _i = 0, _a = dto.medications;
                        _c.label = 16;
                    case 16:
                        if (!(_i < _a.length)) return [3 /*break*/, 22];
                        medDto = _a[_i];
                        drugName = medDto.drug === 'Outro' && medDto.customDrugName
                            ? medDto.customDrugName
                            : medDto.drug;
                        if (!drugName || !medDto.doseMg || medDto.doseMg <= 0) {
                            return [3 /*break*/, 21]; // Skip invalid medications
                        }
                        _c.label = 17;
                    case 17:
                        _c.trys.push([17, 20, , 21]);
                        customFactor = medDto.drug === 'Outro' &&
                            medDto.customConversionFactor !== undefined
                            ? medDto.customConversionFactor
                            : undefined;
                        return [4 /*yield*/, this.getOrCreateMedicationReference(drugName, customFactor)];
                    case 18:
                        medicationRef = _c.sent();
                        dosesPerDay = medDto.qtDose && medDto.qtDose > 0 ? medDto.qtDose : 1;
                        patientMedication = this.patientMedicationRepository.create({
                            questionnaire_id: dto.questionnaireId,
                            medication_id: medicationRef.id,
                            dose_mg: parseFloat(String(medDto.doseMg)),
                            doses_per_day: dosesPerDay,
                            led_conversion_factor: medicationRef.led_conversion_factor,
                        });
                        return [4 /*yield*/, this.patientMedicationRepository.save(patientMedication)];
                    case 19:
                        _c.sent();
                        return [3 /*break*/, 21];
                    case 20:
                        error_2 = _c.sent();
                        console.error("Error saving medication ".concat(drugName, ":"), error_2);
                        return [3 /*break*/, 21];
                    case 21:
                        _i++;
                        return [3 /*break*/, 16];
                    case 22:
                        currentLastStep = (_b = questionnaire.last_step) !== null && _b !== void 0 ? _b : 0;
                        questionnaire.last_step = Math.max(currentLastStep, 3);
                        this.accumulateSessionTime(questionnaire, new Date());
                        this.setQuestionnaireEvaluator(questionnaire, evaluatorId);
                        return [4 /*yield*/, this.questionnairesRepository.save(questionnaire)];
                    case 23:
                        _c.sent();
                        return [2 /*return*/, savedClinicalAssessment];
                }
            });
        });
    };
    QuestionnairesService.prototype.savePhysioAssessment = function (dto, evaluatorId) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaireId, physioPatientDescription, questionnaire, clinicalAssessment, payload, saved, currentLastStep;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        questionnaireId = dto.questionnaireId, physioPatientDescription = dto.physioPatientDescription;
                        return [4 /*yield*/, this.questionnairesRepository.findOne({
                                where: { id: questionnaireId },
                            })];
                    case 1:
                        questionnaire = _b.sent();
                        if (!questionnaire) {
                            throw new common_1.NotFoundException("Questionnaire with ID ".concat(questionnaireId, " not found"));
                        }
                        return [4 /*yield*/, this.clinicalAssessmentRepository.findOne({
                                where: { questionnaire_id: questionnaireId },
                            })];
                    case 2:
                        clinicalAssessment = _b.sent();
                        if (!clinicalAssessment) {
                            payload = {
                                questionnaire_id: questionnaireId,
                                diagnostic_description: '',
                                age_at_onset: null,
                                initial_symptom: null,
                                affected_side: null,
                                phenotype_id: null,
                                hoehn_yahr_stage_id: null,
                                schwab_england_score: null,
                                has_family_history: false,
                                family_kinship_degree: null,
                                has_dyskinesia: false,
                                dyskinesia_interfered: false,
                                dyskinesia_type_id: null,
                                dyskinesia_type_codes: null,
                                has_freezing_of_gait: false,
                                has_wearing_off: false,
                                average_on_time_hours: null,
                                has_delayed_on: false,
                                ldopa_onset_time_hours: null,
                                assessed_on_levodopa: false,
                                has_surgery_history: false,
                                surgery_year: null,
                                surgery_type_id: null,
                                surgery_target: null,
                                comorbidities: null,
                                other_medications: null,
                                medication_allergies: null,
                                food_allergies: null,
                                disease_evolution: null,
                                current_symptoms: null,
                                physio_patient_description: physioPatientDescription !== null && physioPatientDescription !== void 0 ? physioPatientDescription : null,
                            };
                            clinicalAssessment = this.clinicalAssessmentRepository.create(payload);
                        }
                        else {
                            clinicalAssessment.physio_patient_description =
                                physioPatientDescription !== null && physioPatientDescription !== void 0 ? physioPatientDescription : null;
                        }
                        return [4 /*yield*/, this.clinicalAssessmentRepository.save(clinicalAssessment)];
                    case 3:
                        saved = _b.sent();
                        currentLastStep = (_a = questionnaire.last_step) !== null && _a !== void 0 ? _a : 0;
                        // Step clínico principal já é 3; aqui mantemos no mínimo 3
                        questionnaire.last_step = Math.max(currentLastStep, 3);
                        this.accumulateSessionTime(questionnaire, new Date());
                        this.setQuestionnaireEvaluator(questionnaire, evaluatorId);
                        return [4 /*yield*/, this.questionnairesRepository.save(questionnaire)];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, saved];
                }
            });
        });
    };
    QuestionnairesService.prototype.saveSleepPatientDescription = function (dto, evaluatorId) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaireId, sleepPatientDescription, sleepExamDate, questionnaire, parsedSleepExamDate, clinicalAssessment, payload, saved, currentLastStep;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        questionnaireId = dto.questionnaireId, sleepPatientDescription = dto.sleepPatientDescription, sleepExamDate = dto.sleepExamDate;
                        return [4 /*yield*/, this.questionnairesRepository.findOne({
                                where: { id: questionnaireId },
                            })];
                    case 1:
                        questionnaire = _b.sent();
                        if (!questionnaire) {
                            throw new common_1.NotFoundException("Questionnaire with ID ".concat(questionnaireId, " not found"));
                        }
                        parsedSleepExamDate = sleepExamDate && /^\d{4}-\d{2}-\d{2}$/.test(sleepExamDate)
                            ? sleepExamDate
                            : null;
                        return [4 /*yield*/, this.clinicalAssessmentRepository.findOne({
                                where: { questionnaire_id: questionnaireId },
                            })];
                    case 2:
                        clinicalAssessment = _b.sent();
                        if (!clinicalAssessment) {
                            payload = {
                                questionnaire_id: questionnaireId,
                                diagnostic_description: '',
                                age_at_onset: null,
                                initial_symptom: null,
                                affected_side: null,
                                phenotype_id: null,
                                hoehn_yahr_stage_id: null,
                                schwab_england_score: null,
                                has_family_history: false,
                                family_kinship_degree: null,
                                has_dyskinesia: false,
                                dyskinesia_interfered: false,
                                dyskinesia_type_id: null,
                                dyskinesia_type_codes: null,
                                has_freezing_of_gait: false,
                                has_wearing_off: false,
                                average_on_time_hours: null,
                                has_delayed_on: false,
                                ldopa_onset_time_hours: null,
                                assessed_on_levodopa: false,
                                has_surgery_history: false,
                                surgery_year: null,
                                surgery_type_id: null,
                                surgery_target: null,
                                comorbidities: null,
                                other_medications: null,
                                medication_allergies: null,
                                food_allergies: null,
                                disease_evolution: null,
                                current_symptoms: null,
                                sleep_patient_description: sleepPatientDescription !== null && sleepPatientDescription !== void 0 ? sleepPatientDescription : null,
                                sleep_exam_date: parsedSleepExamDate,
                            };
                            clinicalAssessment = this.clinicalAssessmentRepository.create(payload);
                        }
                        else {
                            clinicalAssessment.sleep_patient_description =
                                sleepPatientDescription !== null && sleepPatientDescription !== void 0 ? sleepPatientDescription : null;
                            if (sleepExamDate !== undefined) {
                                clinicalAssessment.sleep_exam_date =
                                    parsedSleepExamDate;
                            }
                        }
                        return [4 /*yield*/, this.clinicalAssessmentRepository.save(clinicalAssessment)];
                    case 3:
                        saved = _b.sent();
                        currentLastStep = (_a = questionnaire.last_step) !== null && _a !== void 0 ? _a : 0;
                        questionnaire.last_step = Math.max(currentLastStep, 3);
                        this.accumulateSessionTime(questionnaire, new Date());
                        this.setQuestionnaireEvaluator(questionnaire, evaluatorId);
                        return [4 /*yield*/, this.questionnairesRepository.save(questionnaire)];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, saved];
                }
            });
        });
    };
    QuestionnairesService.prototype.saveSpeechPatientDescription = function (dto, evaluatorId) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaireId, speechPatientDescription, questionnaire, clinicalAssessment, payload, saved, currentLastStep;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        questionnaireId = dto.questionnaireId, speechPatientDescription = dto.speechPatientDescription;
                        return [4 /*yield*/, this.questionnairesRepository.findOne({
                                where: { id: questionnaireId },
                            })];
                    case 1:
                        questionnaire = _b.sent();
                        if (!questionnaire) {
                            throw new common_1.NotFoundException("Questionnaire with ID ".concat(questionnaireId, " not found"));
                        }
                        return [4 /*yield*/, this.clinicalAssessmentRepository.findOne({
                                where: { questionnaire_id: questionnaireId },
                            })];
                    case 2:
                        clinicalAssessment = _b.sent();
                        if (!clinicalAssessment) {
                            payload = {
                                questionnaire_id: questionnaireId,
                                diagnostic_description: '',
                                age_at_onset: null,
                                initial_symptom: null,
                                affected_side: null,
                                phenotype_id: null,
                                hoehn_yahr_stage_id: null,
                                schwab_england_score: null,
                                has_family_history: false,
                                family_kinship_degree: null,
                                has_dyskinesia: false,
                                dyskinesia_interfered: false,
                                dyskinesia_type_id: null,
                                dyskinesia_type_codes: null,
                                has_freezing_of_gait: false,
                                has_wearing_off: false,
                                average_on_time_hours: null,
                                has_delayed_on: false,
                                ldopa_onset_time_hours: null,
                                assessed_on_levodopa: false,
                                has_surgery_history: false,
                                surgery_year: null,
                                surgery_type_id: null,
                                surgery_target: null,
                                comorbidities: null,
                                other_medications: null,
                                medication_allergies: null,
                                food_allergies: null,
                                disease_evolution: null,
                                current_symptoms: null,
                                speech_patient_description: speechPatientDescription !== null && speechPatientDescription !== void 0 ? speechPatientDescription : null,
                            };
                            clinicalAssessment = this.clinicalAssessmentRepository.create(payload);
                        }
                        else {
                            clinicalAssessment.speech_patient_description =
                                speechPatientDescription !== null && speechPatientDescription !== void 0 ? speechPatientDescription : null;
                        }
                        return [4 /*yield*/, this.clinicalAssessmentRepository.save(clinicalAssessment)];
                    case 3:
                        saved = _b.sent();
                        currentLastStep = (_a = questionnaire.last_step) !== null && _a !== void 0 ? _a : 0;
                        questionnaire.last_step = Math.max(currentLastStep, 3);
                        this.accumulateSessionTime(questionnaire, new Date());
                        this.setQuestionnaireEvaluator(questionnaire, evaluatorId);
                        return [4 /*yield*/, this.questionnairesRepository.save(questionnaire)];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, saved];
                }
            });
        });
    };
    /**
     * Save UPDRS-III scores (Step 4 - Avaliação Neurológica)
     */
    QuestionnairesService.prototype.saveUpdrs3Scores = function (dto, evaluatorId) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaire, updrsScore, saved, currentLastStep;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.questionnairesRepository.findOne({
                            where: { id: dto.questionnaireId },
                        })];
                    case 1:
                        questionnaire = _c.sent();
                        if (!questionnaire) {
                            throw new common_1.NotFoundException("Questionnaire with ID ".concat(dto.questionnaireId, " not found"));
                        }
                        return [4 /*yield*/, this.updrs3Repository.findOne({
                                where: { questionnaire_id: dto.questionnaireId },
                            })];
                    case 2:
                        updrsScore = _c.sent();
                        if (!updrsScore) {
                            updrsScore = this.updrs3Repository.create({
                                questionnaire_id: dto.questionnaireId,
                            });
                        }
                        this.assignScoreFields(updrsScore, dto, UPDRS_SCORE_FIELDS);
                        return [4 /*yield*/, this.updrs3Repository.save(updrsScore)];
                    case 3:
                        saved = _c.sent();
                        currentLastStep = (_a = questionnaire.last_step) !== null && _a !== void 0 ? _a : 0;
                        questionnaire.last_step = Math.max(currentLastStep, 4);
                        this.accumulateSessionTime(questionnaire, new Date());
                        this.setQuestionnaireEvaluator(questionnaire, evaluatorId);
                        return [4 /*yield*/, this.questionnairesRepository.save(questionnaire)];
                    case 4:
                        _c.sent();
                        return [2 /*return*/, {
                                questionnaireId: saved.questionnaire_id,
                                totalScore: (_b = saved.total_score) !== null && _b !== void 0 ? _b : null,
                            }];
                }
            });
        });
    };
    /**
     * Save MEEM scores
     */
    QuestionnairesService.prototype.saveMeemScores = function (dto, evaluatorId) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaire, meemScore, saved, currentLastStep;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.questionnairesRepository.findOne({
                            where: { id: dto.questionnaireId },
                        })];
                    case 1:
                        questionnaire = _c.sent();
                        if (!questionnaire) {
                            throw new common_1.NotFoundException("Questionnaire with ID ".concat(dto.questionnaireId, " not found"));
                        }
                        return [4 /*yield*/, this.meemRepository.findOne({
                                where: { questionnaire_id: dto.questionnaireId },
                            })];
                    case 2:
                        meemScore = _c.sent();
                        if (!meemScore) {
                            meemScore = this.meemRepository.create({
                                questionnaire_id: dto.questionnaireId,
                            });
                        }
                        this.assignScoreFields(meemScore, dto, MEEM_SCORE_FIELDS);
                        return [4 /*yield*/, this.meemRepository.save(meemScore)];
                    case 3:
                        saved = _c.sent();
                        currentLastStep = (_a = questionnaire.last_step) !== null && _a !== void 0 ? _a : 0;
                        questionnaire.last_step = Math.max(currentLastStep, 4);
                        this.accumulateSessionTime(questionnaire, new Date());
                        this.setQuestionnaireEvaluator(questionnaire, evaluatorId);
                        return [4 /*yield*/, this.questionnairesRepository.save(questionnaire)];
                    case 4:
                        _c.sent();
                        return [2 /*return*/, {
                                questionnaireId: saved.questionnaire_id,
                                totalScore: (_b = saved.total_score) !== null && _b !== void 0 ? _b : null,
                            }];
                }
            });
        });
    };
    /**
     * Save UDysRS scores
     */
    QuestionnairesService.prototype.saveUdysrsScores = function (dto, evaluatorId) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaire, udysrsScore, saved, currentLastStep;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.questionnairesRepository.findOne({
                            where: { id: dto.questionnaireId },
                        })];
                    case 1:
                        questionnaire = _e.sent();
                        if (!questionnaire) {
                            throw new common_1.NotFoundException("Questionnaire with ID ".concat(dto.questionnaireId, " not found"));
                        }
                        return [4 /*yield*/, this.udysrsRepository.findOne({
                                where: { questionnaire_id: dto.questionnaireId },
                            })];
                    case 2:
                        udysrsScore = _e.sent();
                        if (!udysrsScore) {
                            udysrsScore = this.udysrsRepository.create({
                                questionnaire_id: dto.questionnaireId,
                            });
                        }
                        this.assignScoreFields(udysrsScore, dto, UDYSRS_SCORE_FIELDS);
                        return [4 /*yield*/, this.udysrsRepository.save(udysrsScore)];
                    case 3:
                        saved = _e.sent();
                        currentLastStep = (_a = questionnaire.last_step) !== null && _a !== void 0 ? _a : 0;
                        questionnaire.last_step = Math.max(currentLastStep, 4);
                        this.accumulateSessionTime(questionnaire, new Date());
                        this.setQuestionnaireEvaluator(questionnaire, evaluatorId);
                        return [4 /*yield*/, this.questionnairesRepository.save(questionnaire)];
                    case 4:
                        _e.sent();
                        return [2 /*return*/, {
                                questionnaireId: saved.questionnaire_id,
                                historicalSubscore: (_b = saved.historical_subscore) !== null && _b !== void 0 ? _b : null,
                                objectiveSubscore: (_c = saved.objective_subscore) !== null && _c !== void 0 ? _c : null,
                                totalScore: (_d = saved.total_score) !== null && _d !== void 0 ? _d : null,
                            }];
                }
            });
        });
    };
    /**
     * Save STOP-Bang screening
     */
    QuestionnairesService.prototype.saveStopbangScores = function (dto, evaluatorId) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaire, stopbangScore, saved, currentLastStep;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.questionnairesRepository.findOne({
                            where: { id: dto.questionnaireId },
                        })];
                    case 1:
                        questionnaire = _c.sent();
                        if (!questionnaire) {
                            throw new common_1.NotFoundException("Questionnaire with ID ".concat(dto.questionnaireId, " not found"));
                        }
                        return [4 /*yield*/, this.stopbangRepository.findOne({
                                where: { questionnaire_id: dto.questionnaireId },
                            })];
                    case 2:
                        stopbangScore = _c.sent();
                        if (!stopbangScore) {
                            stopbangScore = this.stopbangRepository.create({
                                questionnaire_id: dto.questionnaireId,
                            });
                        }
                        this.assignScoreFields(stopbangScore, dto, STOPBANG_SCORE_FIELDS);
                        return [4 /*yield*/, this.stopbangRepository.save(stopbangScore)];
                    case 3:
                        saved = _c.sent();
                        currentLastStep = (_a = questionnaire.last_step) !== null && _a !== void 0 ? _a : 0;
                        questionnaire.last_step = Math.max(currentLastStep, 6);
                        this.accumulateSessionTime(questionnaire, new Date());
                        this.setQuestionnaireEvaluator(questionnaire, evaluatorId);
                        return [4 /*yield*/, this.questionnairesRepository.save(questionnaire)];
                    case 4:
                        _c.sent();
                        return [2 /*return*/, {
                                questionnaireId: saved.questionnaire_id,
                                totalScore: (_b = saved.total_score) !== null && _b !== void 0 ? _b : null,
                            }];
                }
            });
        });
    };
    /**
     * Save Epworth Sleepiness Scale
     */
    QuestionnairesService.prototype.saveEpworthScores = function (dto, evaluatorId) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaire, epworthScore, saved, currentLastStep;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.questionnairesRepository.findOne({
                            where: { id: dto.questionnaireId },
                        })];
                    case 1:
                        questionnaire = _c.sent();
                        if (!questionnaire) {
                            throw new common_1.NotFoundException("Questionnaire with ID ".concat(dto.questionnaireId, " not found"));
                        }
                        return [4 /*yield*/, this.epworthRepository.findOne({
                                where: { questionnaire_id: dto.questionnaireId },
                            })];
                    case 2:
                        epworthScore = _c.sent();
                        if (!epworthScore) {
                            epworthScore = this.epworthRepository.create({
                                questionnaire_id: dto.questionnaireId,
                            });
                        }
                        this.assignScoreFields(epworthScore, dto, EPWORTH_SCORE_FIELDS);
                        return [4 /*yield*/, this.epworthRepository.save(epworthScore)];
                    case 3:
                        saved = _c.sent();
                        currentLastStep = (_a = questionnaire.last_step) !== null && _a !== void 0 ? _a : 0;
                        questionnaire.last_step = Math.max(currentLastStep, 6);
                        this.accumulateSessionTime(questionnaire, new Date());
                        this.setQuestionnaireEvaluator(questionnaire, evaluatorId);
                        return [4 /*yield*/, this.questionnairesRepository.save(questionnaire)];
                    case 4:
                        _c.sent();
                        return [2 /*return*/, {
                                questionnaireId: saved.questionnaire_id,
                                totalScore: (_b = saved.total_score) !== null && _b !== void 0 ? _b : null,
                            }];
                }
            });
        });
    };
    /**
     * Save PDSS-2 responses
     */
    QuestionnairesService.prototype.savePdss2Scores = function (dto, evaluatorId) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaire, pdssScore, saved, currentLastStep;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.questionnairesRepository.findOne({
                            where: { id: dto.questionnaireId },
                        })];
                    case 1:
                        questionnaire = _c.sent();
                        if (!questionnaire) {
                            throw new common_1.NotFoundException("Questionnaire with ID ".concat(dto.questionnaireId, " not found"));
                        }
                        return [4 /*yield*/, this.pdss2Repository.findOne({
                                where: { questionnaire_id: dto.questionnaireId },
                            })];
                    case 2:
                        pdssScore = _c.sent();
                        if (!pdssScore) {
                            pdssScore = this.pdss2Repository.create({
                                questionnaire_id: dto.questionnaireId,
                            });
                        }
                        this.assignScoreFields(pdssScore, dto, PDSS2_SCORE_FIELDS);
                        return [4 /*yield*/, this.pdss2Repository.save(pdssScore)];
                    case 3:
                        saved = _c.sent();
                        currentLastStep = (_a = questionnaire.last_step) !== null && _a !== void 0 ? _a : 0;
                        questionnaire.last_step = Math.max(currentLastStep, 6);
                        this.accumulateSessionTime(questionnaire, new Date());
                        this.setQuestionnaireEvaluator(questionnaire, evaluatorId);
                        return [4 /*yield*/, this.questionnairesRepository.save(questionnaire)];
                    case 4:
                        _c.sent();
                        return [2 /*return*/, {
                                questionnaireId: saved.questionnaire_id,
                                totalScore: (_b = saved.total_score) !== null && _b !== void 0 ? _b : null,
                            }];
                }
            });
        });
    };
    /**
     * Save RBDSQ questionnaire
     */
    QuestionnairesService.prototype.saveRbdsqScores = function (dto, evaluatorId) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaire, rbdsqScore, saved, currentLastStep;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.questionnairesRepository.findOne({
                            where: { id: dto.questionnaireId },
                        })];
                    case 1:
                        questionnaire = _c.sent();
                        if (!questionnaire) {
                            throw new common_1.NotFoundException("Questionnaire with ID ".concat(dto.questionnaireId, " not found"));
                        }
                        return [4 /*yield*/, this.rbdsqRepository.findOne({
                                where: { questionnaire_id: dto.questionnaireId },
                            })];
                    case 2:
                        rbdsqScore = _c.sent();
                        if (!rbdsqScore) {
                            rbdsqScore = this.rbdsqRepository.create({
                                questionnaire_id: dto.questionnaireId,
                            });
                        }
                        this.assignScoreFields(rbdsqScore, dto, RBDSQ_SCORE_FIELDS);
                        return [4 /*yield*/, this.rbdsqRepository.save(rbdsqScore)];
                    case 3:
                        saved = _c.sent();
                        currentLastStep = (_a = questionnaire.last_step) !== null && _a !== void 0 ? _a : 0;
                        questionnaire.last_step = Math.max(currentLastStep, 6);
                        this.setQuestionnaireEvaluator(questionnaire, evaluatorId);
                        return [4 /*yield*/, this.questionnairesRepository.save(questionnaire)];
                    case 4:
                        _c.sent();
                        return [2 /*return*/, {
                                questionnaireId: saved.questionnaire_id,
                                totalScore: (_b = saved.total_score) !== null && _b !== void 0 ? _b : null,
                            }];
                }
            });
        });
    };
    /**
     * Save RBDSQ-BR questionnaire (nova tabela rbdsq_br_scores)
     */
    QuestionnairesService.prototype.saveRbdsqBrScores = function (dto, evaluatorId) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaire, rbdsqBrScore, saved, currentLastStep;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.questionnairesRepository.findOne({
                            where: { id: dto.questionnaireId },
                        })];
                    case 1:
                        questionnaire = _c.sent();
                        if (!questionnaire) {
                            throw new common_1.NotFoundException("Questionnaire with ID ".concat(dto.questionnaireId, " not found"));
                        }
                        return [4 /*yield*/, this.rbdsqBrRepository.findOne({
                                where: { questionnaire_id: dto.questionnaireId },
                            })];
                    case 2:
                        rbdsqBrScore = _c.sent();
                        if (!rbdsqBrScore) {
                            rbdsqBrScore = this.rbdsqBrRepository.create({
                                questionnaire_id: dto.questionnaireId,
                            });
                        }
                        this.assignScoreFields(rbdsqBrScore, dto, RBDSQ_BR_SCORE_FIELDS);
                        return [4 /*yield*/, this.rbdsqBrRepository.save(rbdsqBrScore)];
                    case 3:
                        saved = _c.sent();
                        currentLastStep = (_a = questionnaire.last_step) !== null && _a !== void 0 ? _a : 0;
                        questionnaire.last_step = Math.max(currentLastStep, 6);
                        this.accumulateSessionTime(questionnaire, new Date());
                        this.setQuestionnaireEvaluator(questionnaire, evaluatorId);
                        return [4 /*yield*/, this.questionnairesRepository.save(questionnaire)];
                    case 4:
                        _c.sent();
                        return [2 /*return*/, {
                                questionnaireId: saved.questionnaire_id,
                                totalScore: (_b = saved.total_score) !== null && _b !== void 0 ? _b : null,
                            }];
                }
            });
        });
    };
    /**
     * Inicia uma nova sessão de preenchimento do questionário.
     * Se já houver sessão aberta, acumula o tempo até agora e reinicia o contador.
     */
    QuestionnairesService.prototype.startSession = function (questionnaireId) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaire, now, saved;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.questionnairesRepository.findOne({
                            where: { id: questionnaireId },
                        })];
                    case 1:
                        questionnaire = _b.sent();
                        if (!questionnaire) {
                            throw new common_1.NotFoundException("Questionnaire with ID ".concat(questionnaireId, " not found"));
                        }
                        now = new Date();
                        // Se havia uma sessão aberta, acumula o tempo até agora e reinicia
                        this.accumulateSessionTime(questionnaire, now, { endSession: false });
                        questionnaire.current_session_started_at = now;
                        return [4 /*yield*/, this.questionnairesRepository.save(questionnaire)];
                    case 2:
                        saved = _b.sent();
                        return [2 /*return*/, {
                                questionnaireId: saved.id,
                                collectionTimeSeconds: (_a = saved.collection_time_seconds) !== null && _a !== void 0 ? _a : 0,
                                currentSessionStartedAt: saved.current_session_started_at,
                            }];
                }
            });
        });
    };
    /**
     * Encerra a sessão corrente de preenchimento, acumulando tempo ao total.
     */
    QuestionnairesService.prototype.endSession = function (questionnaireId) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaire, now, saved;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.questionnairesRepository.findOne({
                            where: { id: questionnaireId },
                        })];
                    case 1:
                        questionnaire = _b.sent();
                        if (!questionnaire) {
                            throw new common_1.NotFoundException("Questionnaire with ID ".concat(questionnaireId, " not found"));
                        }
                        now = new Date();
                        this.accumulateSessionTime(questionnaire, now, { endSession: true });
                        return [4 /*yield*/, this.questionnairesRepository.save(questionnaire)];
                    case 2:
                        saved = _b.sent();
                        return [2 /*return*/, {
                                questionnaireId: saved.id,
                                collectionTimeSeconds: (_a = saved.collection_time_seconds) !== null && _a !== void 0 ? _a : 0,
                                currentSessionStartedAt: saved.current_session_started_at,
                            }];
                }
            });
        });
    };
    /**
     * Atualiza indicação de teste de sono (Step 4 neurológico).
     */
    QuestionnairesService.prototype.patchSleepTestRecommended = function (questionnaireId, sleepTestRecommended) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaire, saved;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.questionnairesRepository.findOne({
                            where: { id: questionnaireId },
                        })];
                    case 1:
                        questionnaire = _a.sent();
                        if (!questionnaire) {
                            throw new common_1.NotFoundException("Questionnaire with ID ".concat(questionnaireId, " not found"));
                        }
                        questionnaire.sleep_test_recommended = sleepTestRecommended === true;
                        return [4 /*yield*/, this.questionnairesRepository.save(questionnaire)];
                    case 2:
                        saved = _a.sent();
                        return [2 /*return*/, {
                                questionnaireId: saved.id,
                                sleepTestRecommended: saved.sleep_test_recommended === true,
                            }];
                }
            });
        });
    };
    /**
     * Atualiza indicação de teste Free Living (Step 4 neurológico).
     */
    QuestionnairesService.prototype.patchFreeLivingTestRecommended = function (questionnaireId, freeLivingTestRecommended) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaire, saved;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.questionnairesRepository.findOne({
                            where: { id: questionnaireId },
                        })];
                    case 1:
                        questionnaire = _a.sent();
                        if (!questionnaire) {
                            throw new common_1.NotFoundException("Questionnaire with ID ".concat(questionnaireId, " not found"));
                        }
                        questionnaire.free_living_test_recommended = freeLivingTestRecommended === true;
                        return [4 /*yield*/, this.questionnairesRepository.save(questionnaire)];
                    case 2:
                        saved = _a.sent();
                        return [2 /*return*/, {
                                questionnaireId: saved.id,
                                freeLivingTestRecommended: saved.free_living_test_recommended === true,
                            }];
                }
            });
        });
    };
    /**
     * Save FOGQ scores
     */
    QuestionnairesService.prototype.saveFogqScores = function (dto, evaluatorId) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaire, fogqScore, saved, currentLastStep;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.questionnairesRepository.findOne({
                            where: { id: dto.questionnaireId },
                        })];
                    case 1:
                        questionnaire = _c.sent();
                        if (!questionnaire) {
                            throw new common_1.NotFoundException("Questionnaire with ID ".concat(dto.questionnaireId, " not found"));
                        }
                        return [4 /*yield*/, this.fogqRepository.findOne({
                                where: { questionnaire_id: dto.questionnaireId },
                            })];
                    case 2:
                        fogqScore = _c.sent();
                        if (!fogqScore) {
                            fogqScore = this.fogqRepository.create({
                                questionnaire_id: dto.questionnaireId,
                            });
                        }
                        this.assignScoreFields(fogqScore, dto, FOGQ_SCORE_FIELDS);
                        return [4 /*yield*/, this.fogqRepository.save(fogqScore)];
                    case 3:
                        saved = _c.sent();
                        currentLastStep = (_a = questionnaire.last_step) !== null && _a !== void 0 ? _a : 0;
                        questionnaire.last_step = Math.max(currentLastStep, 7);
                        this.accumulateSessionTime(questionnaire, new Date());
                        this.setQuestionnaireEvaluator(questionnaire, evaluatorId);
                        return [4 /*yield*/, this.questionnairesRepository.save(questionnaire)];
                    case 4:
                        _c.sent();
                        return [2 /*return*/, {
                                questionnaireId: saved.questionnaire_id,
                                totalScore: (_b = saved.total_score) !== null && _b !== void 0 ? _b : null,
                            }];
                }
            });
        });
    };
    /**
     * Get all reference data for questionnaire forms
     */
    QuestionnairesService.prototype.getReferenceData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, genders, ethnicities, educationLevels, maritalStatuses, incomeRanges, phenotypes, dyskinesiaTypes, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all([
                                this.genderTypeRepository
                                    .find({
                                    where: { active: true },
                                    order: { id: 'ASC' },
                                })
                                    .catch(function () { return []; }),
                                this.ethnicityTypeRepository
                                    .find({
                                    where: { active: true },
                                    order: { id: 'ASC' },
                                })
                                    .catch(function () { return []; }),
                                this.educationLevelRepository
                                    .find({
                                    where: { active: true },
                                    order: { id: 'ASC' },
                                })
                                    .catch(function () { return []; }),
                                this.maritalStatusTypeRepository
                                    .find({
                                    where: { active: true },
                                    order: { id: 'ASC' },
                                })
                                    .catch(function () { return []; }),
                                this.incomeRangeRepository
                                    .find({
                                    where: { active: true },
                                    order: { id: 'ASC' },
                                })
                                    .catch(function () { return []; }),
                                this.parkinsonPhenotypeRepository
                                    .find({
                                    where: { active: true },
                                    order: { id: 'ASC' },
                                })
                                    .catch(function () { return []; }),
                                this.dyskinesiaTypeRepository
                                    .find({
                                    order: { id: 'ASC' },
                                })
                                    .catch(function () { return []; }),
                            ])];
                    case 1:
                        _a = _b.sent(), genders = _a[0], ethnicities = _a[1], educationLevels = _a[2], maritalStatuses = _a[3], incomeRanges = _a[4], phenotypes = _a[5], dyskinesiaTypes = _a[6];
                        return [2 /*return*/, {
                                genders: genders.map(function (g) { return ({
                                    value: g.code,
                                    label: g.description,
                                    code: g.code,
                                    description: g.description,
                                }); }),
                                ethnicities: ethnicities.map(function (e) { return ({
                                    value: e.description,
                                    label: e.description,
                                }); }),
                                educationLevels: educationLevels.map(function (el) { return ({
                                    value: el.description,
                                    label: el.description,
                                }); }),
                                maritalStatuses: maritalStatuses.map(function (ms) { return ({
                                    value: ms.description,
                                    label: ms.description,
                                }); }),
                                incomeRanges: incomeRanges.map(function (ir) { return ({
                                    value: ir.code,
                                    label: ir.description,
                                }); }),
                                phenotypes: phenotypes.map(function (p) { return ({
                                    value: p.description,
                                    label: p.description,
                                }); }),
                                dyskinesiaTypes: dyskinesiaTypes.map(function (dt) { return ({
                                    value: dt.description,
                                    label: dt.description,
                                }); }),
                                affectedSides: [
                                    { value: 'Direito', label: 'Direito' },
                                    { value: 'Esquerdo', label: 'Esquerdo' },
                                    { value: 'Bilateral', label: 'Bilateral' },
                                    { value: 'Não especificado', label: 'Não especificado' },
                                ],
                            }];
                    case 2:
                        error_3 = _b.sent();
                        console.error('Erro ao buscar dados de referência:', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Search questionnaires by patient name, CPF (partial) or public_identifier (partial)
     * Returns only basic data needed for the search results page
     */
    QuestionnairesService.prototype.searchQuestionnaires = function (term) {
        return __awaiter(this, void 0, void 0, function () {
            var queryBuilder, termTrimmed, termLower, termDigits, termCompact, conditions, params, questionnaires, pendingByQid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queryBuilder = this.questionnairesRepository
                            .createQueryBuilder('q')
                            .leftJoinAndSelect('q.patient', 'patient')
                            .select([
                            'q.id',
                            'q.status',
                            'q.created_at',
                            'q.updated_at',
                            'q.completed_at',
                            'q.collection_time_seconds',
                            'q.collection_date',
                            'patient.id',
                            'patient.full_name',
                            'patient.cpf',
                            'patient.cpf_hash',
                            'patient.public_identifier',
                        ])
                            .orderBy('q.created_at', 'DESC')
                            .limit(100);
                        if (term && term.trim() !== '') {
                            termTrimmed = term.trim();
                            termLower = termTrimmed.toLowerCase();
                            termDigits = termTrimmed.replace(/\D/g, '');
                            termCompact = termTrimmed.replace(/\s/g, '');
                            conditions = ['LOWER(patient.full_name) LIKE :term'];
                            params = {
                                term: "%".concat(termLower, "%"),
                            };
                            // Identificador público: correspondência parcial conforme digitação (como o nome)
                            if (termCompact.length > 0) {
                                params.pidTerm = "%".concat(termCompact, "%");
                                conditions.push("COALESCE(patient.public_identifier, '') ILIKE :pidTerm");
                            }
                            // CPF: correspondência parcial pelos dígitos digitados (como o nome)
                            if (termDigits.length > 0) {
                                params.cpfDigitsTerm = "%".concat(termDigits, "%");
                                conditions.push("COALESCE(patient.cpf, '') LIKE :cpfDigitsTerm");
                            }
                            queryBuilder.where("(".concat(conditions.join(' OR '), ")"), params);
                        }
                        return [4 /*yield*/, queryBuilder.getMany()];
                    case 1:
                        questionnaires = _a.sent();
                        return [4 /*yield*/, this.buildPendingDeviceUploadsMap(questionnaires)];
                    case 2:
                        pendingByQid = _a.sent();
                        // Retornar apenas dados básicos para a listagem
                        return [2 /*return*/, questionnaires.map(function (q) {
                                var _a, _b, _c, _d, _e, _f, _g, _h;
                                return ({
                                    id: q.id,
                                    patientId: ((_a = q.patient) === null || _a === void 0 ? void 0 : _a.id) || q.patient_id || null,
                                    fullName: ((_b = q.patient) === null || _b === void 0 ? void 0 : _b.full_name) || '',
                                    cpf: ((_c = q.patient) === null || _c === void 0 ? void 0 : _c.cpf) || '', // CPF em texto para exibição nas telas
                                    cpfHash: ((_d = q.patient) === null || _d === void 0 ? void 0 : _d.cpf_hash) || '', // Hash do CPF para exportações
                                    public_identifier: ((_e = q.patient) === null || _e === void 0 ? void 0 : _e.public_identifier) || null,
                                    createdAt: q.created_at,
                                    updatedAt: q.updated_at,
                                    completedAt: q.completed_at,
                                    status: q.status,
                                    collectionTimeSeconds: (_f = q.collection_time_seconds) !== null && _f !== void 0 ? _f : 0,
                                    pendingDeviceUploads: ((_g = pendingByQid.get(q.id)) === null || _g === void 0 ? void 0 : _g.pending) || [],
                                    missingDeviceKinds: ((_h = pendingByQid.get(q.id)) === null || _h === void 0 ? void 0 : _h.missing) || [],
                                    data: null, // Dados completos serão carregados apenas quando necessário
                                });
                            })];
                }
            });
        });
    };
    /**
     * Calcula badges de upload pendente (Baiobit / Delsys / Polissonógrafo) com risco 3/5/7.
     */
    QuestionnairesService.prototype.buildPendingDeviceUploadsMap = function (questionnaires) {
        return __awaiter(this, void 0, void 0, function () {
            var result, ids, nowMs, allTasks, taskIdToCode, fileRows, countsByQ, breakdownByQ, ensureCell, _i, fileRows_1, row, code, qid, counts, cell, kind, pdfRows, pdfFlagsByQ, _a, pdfRows_1, row, qid, prev, _b, questionnaires_1, q, qid, counts, deviceBreakdownByTask, _c, _d, _e, taskCode, cell, pdfFlags, pendingParams;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        result = new Map();
                        if (questionnaires.length === 0)
                            return [2 /*return*/, result];
                        ids = questionnaires.map(function (q) { return q.id; });
                        nowMs = Date.now();
                        return [4 /*yield*/, this.activeTaskRepository.find()];
                    case 1:
                        allTasks = _f.sent();
                        taskIdToCode = new Map(allTasks.map(function (t) { return [t.id, t.task_code]; }));
                        return [4 /*yield*/, this.binaryCollectionRepository.manager.query("\n      SELECT q.id AS questionnaire_id,\n             bc.task_id,\n             COALESCE(\n               NULLIF(TRIM(bc.metadata->>'file_name'), ''),\n               NULLIF(TRIM(bc.metadata->>'originalname'), ''),\n               NULLIF(TRIM(bc.metadata->>'original_name'), ''),\n               NULLIF(TRIM(bc.metadata->>'filename'), ''),\n               ''\n             ) AS file_name,\n             bc.device_type,\n             COALESCE(bc.metadata->>'file_format', '') AS file_format,\n             COALESCE(bc.metadata->>'task_code', '') AS meta_task_code\n      FROM questionnaires q\n      INNER JOIN patients p ON p.id = q.patient_id\n      INNER JOIN binary_collections bc ON (\n        bc.questionnaire_id = q.id OR bc.patient_cpf_hash = p.cpf_hash\n      )\n      WHERE q.id = ANY($1::uuid[])\n        AND COALESCE(bc.deleted_pending, false) = false\n        AND (\n          bc.task_id IS NOT NULL\n          OR COALESCE(NULLIF(TRIM(bc.metadata->>'task_code'), ''), '') <> ''\n        )\n      ", [ids])];
                    case 2:
                        fileRows = _f.sent();
                        countsByQ = new Map();
                        breakdownByQ = new Map();
                        ensureCell = function (qid, taskCode) {
                            if (!breakdownByQ.has(qid))
                                breakdownByQ.set(qid, {});
                            var rec = breakdownByQ.get(qid);
                            if (!rec[taskCode]) {
                                rec[taskCode] = (0, device_upload_status_utils_1.emptyBreakdownForTask)(taskCode);
                            }
                            return rec[taskCode];
                        };
                        for (_i = 0, fileRows_1 = fileRows; _i < fileRows_1.length; _i++) {
                            row = fileRows_1[_i];
                            code = (0, device_upload_status_utils_1.resolveTaskCode)(row.task_id, row.meta_task_code, taskIdToCode);
                            if (!code)
                                continue;
                            qid = String(row.questionnaire_id);
                            if (!countsByQ.has(qid))
                                countsByQ.set(qid, {});
                            counts = countsByQ.get(qid);
                            counts[code] = (counts[code] || 0) + 1;
                            if (!(0, device_upload_status_utils_1.hasNestedBreakdown)(code))
                                continue;
                            cell = ensureCell(qid, code);
                            kind = (0, device_upload_status_utils_1.classifyBinaryFileName)(row.file_name || '', code, {
                                deviceType: row.device_type,
                                mimeType: row.file_format,
                            });
                            (0, device_upload_status_utils_1.incrementBreakdownCell)(cell, kind);
                        }
                        return [4 /*yield*/, this.pdfReportRepository.manager.query("\n      SELECT pr.questionnaire_id,\n             COALESCE(pr.file_name, '') AS file_name,\n             pr.mime_type,\n             pr.report_type\n      FROM pdf_reports pr\n      WHERE pr.questionnaire_id = ANY($1::uuid[])\n      ", [ids])];
                    case 3:
                        pdfRows = _f.sent();
                        pdfFlagsByQ = new Map();
                        for (_a = 0, pdfRows_1 = pdfRows; _a < pdfRows_1.length; _a++) {
                            row = pdfRows_1[_a];
                            qid = String(row.questionnaire_id);
                            prev = pdfFlagsByQ.get(qid) || (0, device_upload_status_utils_1.emptyPdfPresence)();
                            (0, device_upload_status_utils_1.applyPdfReportToPresence)(prev, row.report_type || '', row.file_name || '', row.mime_type);
                            pdfFlagsByQ.set(qid, prev);
                        }
                        for (_b = 0, questionnaires_1 = questionnaires; _b < questionnaires_1.length; _b++) {
                            q = questionnaires_1[_b];
                            qid = String(q.id);
                            counts = countsByQ.get(qid) || {};
                            deviceBreakdownByTask = __assign({}, (breakdownByQ.get(qid) || {}));
                            for (_c = 0, _d = Object.entries(deviceBreakdownByTask); _c < _d.length; _c++) {
                                _e = _d[_c], taskCode = _e[0], cell = _e[1];
                                deviceBreakdownByTask[taskCode] = __assign({}, cell);
                                (0, device_upload_status_utils_1.reconcileBreakdownWithTaskTotal)(deviceBreakdownByTask[taskCode], counts[taskCode] || 0);
                            }
                            pdfFlags = pdfFlagsByQ.get(qid) || (0, device_upload_status_utils_1.emptyPdfPresence)();
                            (0, device_upload_status_utils_1.applyPdfCountsToBreakdown)(deviceBreakdownByTask, pdfFlags);
                            pendingParams = {
                                createdAt: q.created_at,
                                nowMs: nowMs,
                                countsByTask: counts,
                                deviceBreakdownByTask: deviceBreakdownByTask,
                                hasPolysomnographyPdf: pdfFlags.hasPolysomnographyPdf,
                                hasPolysomnographyEdf: pdfFlags.hasPolysomnographyEdf,
                                hasBaiobitPdf: pdfFlags.hasBaiobitPdf,
                                hasDelsysPdf: pdfFlags.hasDelsysPdf,
                            };
                            result.set(q.id, {
                                pending: (0, device_upload_status_utils_1.buildPendingUploads)(pendingParams),
                                missing: (0, device_upload_status_utils_1.listMissingDeviceKinds)(pendingParams),
                            });
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Get questionnaire by ID with all related data
     */
    QuestionnairesService.prototype.getQuestionnaireById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaire, _a, medications, patientCpfHash, allBinaryCollections, uniqueCollections, error_4;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.questionnairesRepository
                            .createQueryBuilder('q')
                            .leftJoinAndSelect('q.patient', 'patient')
                            .leftJoinAndSelect('patient.gender', 'gender')
                            .leftJoinAndSelect('patient.ethnicity', 'ethnicity')
                            .leftJoinAndSelect('patient.education_level', 'education_level')
                            .leftJoinAndSelect('patient.marital_status', 'marital_status')
                            .leftJoinAndSelect('patient.income_range', 'income_range')
                            .leftJoinAndSelect('q.evaluator', 'evaluator')
                            .leftJoinAndSelect('q.anthropometric_data', 'anthropometric_data')
                            .leftJoinAndSelect('q.clinical_assessment', 'clinical_assessment')
                            .leftJoinAndSelect('q.medications', 'medications')
                            .leftJoinAndSelect('q.stopbang_score', 'stopbang_score')
                            .leftJoinAndSelect('q.epworth_score', 'epworth_score')
                            .leftJoinAndSelect('q.pdss2_score', 'pdss2_score')
                            .leftJoinAndSelect('q.rbdsq_score', 'rbdsq_score')
                            .leftJoinAndSelect('q.rbdsq_br_score', 'rbdsq_br_score')
                            .leftJoinAndSelect('q.fogq_score', 'fogq_score')
                            .leftJoinAndSelect('q.pdf_reports', 'pdf_reports')
                            .leftJoinAndSelect('q.updrs3_score', 'updrs3_score')
                            .leftJoinAndSelect('q.meem_score', 'meem_score')
                            .leftJoinAndSelect('q.udysrs_score', 'udysrs_score')
                            // NÃO usar leftJoinAndSelect para binary_collections aqui - vamos carregar manualmente depois
                            // .leftJoinAndSelect('q.binary_collections', 'binary_collections')
                            // .leftJoinAndSelect('binary_collections.active_task', 'active_task')
                            .where('q.id = :id', { id: id })
                            .getOne()];
                    case 1:
                        questionnaire = _d.sent();
                        if (!questionnaire) {
                            throw new common_1.NotFoundException("Questionnaire with ID ".concat(id, " not found"));
                        }
                        // Debug: verificar se patient foi carregado
                        console.log('🔍 Questionnaire loaded:', {
                            id: questionnaire.id,
                            hasPatient: !!questionnaire.patient,
                            patientId: questionnaire.patient_id,
                            patientCpfHash: ((_b = questionnaire.patient) === null || _b === void 0 ? void 0 : _b.cpf_hash)
                                ? questionnaire.patient.cpf_hash.substring(0, 8) + '...'
                                : 'N/A',
                        });
                        return [4 /*yield*/, Promise.all([
                                // Carregar medicamentos
                                this.patientMedicationRepository
                                    .createQueryBuilder('pm')
                                    .where('pm.questionnaire_id = :questionnaireId', {
                                    questionnaireId: id,
                                })
                                    .getMany()
                                    .catch(function () { return []; }),
                                // Obter patient_cpf_hash (já está carregado no patient)
                                Promise.resolve(((_c = questionnaire.patient) === null || _c === void 0 ? void 0 : _c.cpf_hash) || null),
                            ])];
                    case 2:
                        _a = _d.sent(), medications = _a[0], patientCpfHash = _a[1];
                        questionnaire.medications = medications || [];
                        // Carregar binary_collections de forma otimizada
                        questionnaire.binary_collections = [];
                        if (!patientCpfHash) return [3 /*break*/, 6];
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.binaryCollectionRepository
                                .createQueryBuilder('bc')
                                .leftJoinAndSelect('bc.active_task', 'active_task')
                                .select([
                                'bc.id',
                                'bc.patient_cpf_hash',
                                'bc.repetitions_count',
                                'bc.task_id',
                                'bc.questionnaire_id',
                                'bc.file_size_bytes',
                                'bc.file_checksum',
                                'bc.collection_type',
                                'bc.device_type',
                                'bc.device_serial',
                                'bc.sampling_rate_hz',
                                'bc.collected_at',
                                'bc.uploaded_at',
                                'bc.metadata',
                                'bc.processing_status',
                                'bc.processing_error',
                                'bc.created_by',
                                'active_task.id',
                                'active_task.task_code',
                                'active_task.task_name',
                                'active_task.description',
                            ])
                                .where('bc.questionnaire_id = :questionnaireId OR bc.patient_cpf_hash = :patientCpfHash', {
                                questionnaireId: id,
                                patientCpfHash: patientCpfHash,
                            })
                                .orderBy('bc.collected_at', 'DESC')
                                .getMany()];
                    case 4:
                        allBinaryCollections = _d.sent();
                        uniqueCollections = Array.from(new Map(allBinaryCollections.map(function (bc) { return [bc.id, bc]; })).values());
                        questionnaire.binary_collections = uniqueCollections;
                        return [3 /*break*/, 6];
                    case 5:
                        error_4 = _d.sent();
                        console.error('Error loading binary collections:', error_4);
                        questionnaire.binary_collections = [];
                        return [3 /*break*/, 6];
                    case 6: return [4 /*yield*/, this.formatQuestionnaireForFrontend(questionnaire)];
                    case 7: return [2 /*return*/, _d.sent()];
                }
            });
        });
    };
    /**
     * Format questionnaire data for frontend consumption
     */
    QuestionnairesService.prototype.formatQuestionnaireForFrontend = function (questionnaire) {
        return __awaiter(this, void 0, void 0, function () {
            var patient, anthropometric, clinical, medications, formData, phenotype, dyskinesiaDescriptions, parsed, dyskinesiaType, hoehnYahr, surgeryType, medicationIds, medicationRefs, _a, medicationMap_1, STANDARD_DRUGS_1, DRUG_NAME_MAPPING_1, stopbang, epworth, pdss2, rbdsq, rbdsq, fogq, updrsScoreData, meemScoreData, udysrsScoreData, pdfReports, _b, polysomnographyReport, biobitReport, delsysReport, binaryCollections;
            var _this = this;
            var _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
            return __generator(this, function (_x) {
                switch (_x.label) {
                    case 0:
                        patient = questionnaire.patient;
                        anthropometric = questionnaire.anthropometric_data;
                        clinical = questionnaire.clinical_assessment;
                        medications = questionnaire.medications || [];
                        console.log('Formatting medications - count:', medications.length);
                        if (medications.length > 0) {
                            console.log('First medication raw data:', {
                                medication_id: medications[0].medication_id,
                                dose_mg: medications[0].dose_mg,
                                doses_per_day: medications[0].doses_per_day,
                                led_conversion_factor: medications[0].led_conversion_factor,
                                type_dose_mg: typeof medications[0].dose_mg,
                                type_doses_per_day: typeof medications[0].doses_per_day,
                                type_led_conversion_factor: typeof medications[0].led_conversion_factor,
                            });
                        }
                        else {
                            console.log('No medications found for questionnaire:', questionnaire.id);
                        }
                        formData = {
                            // Dados demográficos
                            nomeAvaliador: ((_c = questionnaire.evaluator) === null || _c === void 0 ? void 0 : _c.full_name) || '',
                            dataColeta: questionnaire.collection_date
                                ? new Date(questionnaire.collection_date).toISOString().split('T')[0]
                                : new Date().toISOString().split('T')[0],
                            fullName: patient.full_name,
                            cpf: patient.cpf || '', // CPF armazenado em texto plano
                            birthday: patient.date_of_birth
                                ? new Date(patient.date_of_birth).toISOString().split('T')[0]
                                : '',
                            age: patient.date_of_birth
                                ? String(new Date().getFullYear() -
                                    new Date(patient.date_of_birth).getFullYear())
                                : '',
                            // Gender: frontend espera o code (M, F, OTHER)
                            gender: ((_d = patient.gender) === null || _d === void 0 ? void 0 : _d.code) || '',
                            // Ethnicity: frontend espera a description
                            etnia: ((_e = patient.ethnicity) === null || _e === void 0 ? void 0 : _e.description) || '',
                            nationality: patient.nationality || 'Brasileiro',
                            // Education: frontend espera a description
                            education: ((_f = patient.education_level) === null || _f === void 0 ? void 0 : _f.description) || '',
                            educationOther: patient.education_other || '',
                            // Marital Status: frontend espera a description
                            maritalStatus: ((_g = patient.marital_status) === null || _g === void 0 ? void 0 : _g.description) || '',
                            occupation: patient.occupation || '',
                            phoneNumber: patient.phone_primary || '',
                            phoneNumberContact: questionnaire.is_healthy_control
                                ? ''
                                : patient.phone_secondary || '',
                            email: patient.email || '',
                            fumaCase: patient.is_current_smoker ? 'Sim' : 'Não',
                            fumouAntes: patient.smoked_before === true
                                ? 'Sim'
                                : patient.smoked_before === false
                                    ? 'Não'
                                    : patient.years_since_quit_smoking !== null &&
                                        patient.years_since_quit_smoking !== undefined
                                        ? 'Sim'
                                        : patient.is_current_smoker
                                            ? 'Não'
                                            : '',
                            smokingDuration: patient.smoking_duration_years
                                ? String(patient.smoking_duration_years)
                                : '',
                            stoppedSmokingDuration: patient.years_since_quit_smoking
                                ? String(patient.years_since_quit_smoking)
                                : '',
                            // Income Range: frontend espera o code
                            rendaFamiliar: ((_h = patient.income_range) === null || _h === void 0 ? void 0 : _h.code) || '',
                            // Campos de saúde
                            deficienciaVisual: patient.visual_impairment !== undefined &&
                                patient.visual_impairment !== null
                                ? patient.visual_impairment
                                    ? 'Sim'
                                    : 'Não'
                                : '',
                            rouquidao: patient.hoarseness !== undefined && patient.hoarseness !== null
                                ? patient.hoarseness
                                    ? 'Sim'
                                    : 'Não'
                                : '',
                            gagueja: patient.stuttering !== undefined && patient.stuttering !== null
                                ? patient.stuttering
                                    ? 'Sim'
                                    : 'Não'
                                : '',
                            canRead: patient.can_read !== undefined &&
                                patient.can_read !== null
                                ? patient.can_read
                                    ? 'Sim'
                                    : 'Não'
                                : '',
                            canWrite: patient.can_write !== undefined &&
                                patient.can_write !== null
                                ? patient.can_write
                                    ? 'Sim'
                                    : 'Não'
                                : '',
                            dominantHand: patient.dominant_hand || '',
                            tcleAssinado: patient.tcle_signed !== undefined &&
                                patient.tcle_signed !== null
                                ? patient.tcle_signed
                                    ? 'Sim'
                                    : 'Não'
                                : '',
                            isHealthyControl: questionnaire.is_healthy_control === true,
                            sleepTestRecommended: questionnaire.sleep_test_recommended === true,
                            freeLivingTestRecommended: questionnaire.free_living_test_recommended === true,
                        };
                        // Dados antropométricos
                        if (anthropometric) {
                            formData.weight = anthropometric.weight_kg
                                ? String(anthropometric.weight_kg)
                                : '';
                            formData.height = anthropometric.height_cm
                                ? String(anthropometric.height_cm)
                                : '';
                            formData.imc = anthropometric.bmi ? String(anthropometric.bmi) : '';
                            formData.waistSize = anthropometric.waist_circumference_cm
                                ? String(anthropometric.waist_circumference_cm)
                                : '';
                            formData.hipSize = anthropometric.hip_circumference_cm
                                ? String(anthropometric.hip_circumference_cm)
                                : '';
                            formData.abdominal = anthropometric.abdominal_circumference_cm
                                ? String(anthropometric.abdominal_circumference_cm)
                                : '';
                            formData.neckCircumference = anthropometric.neck_circumference_cm
                                ? String(anthropometric.neck_circumference_cm)
                                : '';
                        }
                        if (!clinical) return [3 /*break*/, 12];
                        try {
                            console.log('🔍 DEBUG - Clinical assessment encontrado:', {
                                'clinical.id': (clinical === null || clinical === void 0 ? void 0 : clinical.id) || 'N/A',
                                hoehn_yahr_stage_id: (_j = clinical === null || clinical === void 0 ? void 0 : clinical.hoehn_yahr_stage_id) !== null && _j !== void 0 ? _j : null,
                                'tipo hoehn_yahr_stage_id': typeof ((_k = clinical === null || clinical === void 0 ? void 0 : clinical.hoehn_yahr_stage_id) !== null && _k !== void 0 ? _k : null),
                            });
                        }
                        catch (error) {
                            console.error('Erro ao logar clinical assessment:', error);
                        }
                        formData.diagnosticDescription = clinical.diagnostic_description || '';
                        formData.onsetAge = clinical.age_at_onset
                            ? String(clinical.age_at_onset)
                            : '';
                        formData.parkinsonOnset = clinical.age_at_onset
                            ? String(new Date().getFullYear() -
                                new Date(patient.date_of_birth).getFullYear() -
                                clinical.age_at_onset)
                            : '0';
                        formData.initialSympton = clinical.initial_symptom || '';
                        // Lateralidade de início - garantir que está sendo mapeado corretamente
                        formData.parkinsonSide = clinical.affected_side || '';
                        formData.familyCase = clinical.has_family_history ? 'Sim' : 'Não';
                        formData.kinshipDegree = clinical.family_kinship_degree || '';
                        if (!clinical.phenotype_id) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.parkinsonPhenotypeRepository.findOne({
                                where: { id: clinical.phenotype_id },
                            })];
                    case 1:
                        phenotype = _x.sent();
                        formData.mainPhenotype = (phenotype === null || phenotype === void 0 ? void 0 : phenotype.description) || '';
                        return [3 /*break*/, 3];
                    case 2:
                        formData.mainPhenotype = '';
                        _x.label = 3;
                    case 3:
                        // IMPORTANTE: Retornar undefined quando não for explicitamente true
                        // Isso permite que o frontend deixe os campos desmarcados por padrão
                        formData.levodopaOn =
                            clinical.assessed_on_levodopa === true ? true : undefined;
                        // IMPORTANTE: diskinectiaPresence deve vir APENAS do protocolo UPDRS3, não dos dados clínicos
                        // O médico deve definir isso no próprio protocolo UPDRS, não nos dados clínicos
                        // Por isso não definimos aqui - será definido apenas se vier do UPDRS3
                        formData.diskinectiaPresence = undefined; // Sempre undefined por padrão, só será true se vier do UPDRS3
                        formData.fog = clinical.has_freezing_of_gait === true ? true : undefined;
                        dyskinesiaDescriptions = [];
                        if (clinical.dyskinesia_type_codes) {
                            try {
                                parsed = JSON.parse(clinical.dyskinesia_type_codes);
                                if (Array.isArray(parsed)) {
                                    dyskinesiaDescriptions = parsed.filter(function (v) { return typeof v === 'string'; });
                                }
                            }
                            catch (_y) {
                                // ignora JSON inválido
                            }
                        }
                        if (!(dyskinesiaDescriptions.length === 0 && clinical.dyskinesia_type_id)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.dyskinesiaTypeRepository.findOne({
                                where: { id: clinical.dyskinesia_type_id },
                            })];
                    case 4:
                        dyskinesiaType = _x.sent();
                        if (dyskinesiaType === null || dyskinesiaType === void 0 ? void 0 : dyskinesiaType.description) {
                            dyskinesiaDescriptions = [dyskinesiaType.description];
                        }
                        _x.label = 5;
                    case 5:
                        formData.fogClassifcationList = dyskinesiaDescriptions;
                        formData.fogClassifcation = dyskinesiaDescriptions[0] || '';
                        formData.physioPatientDescription =
                            clinical.physio_patient_description || '';
                        formData.sleepPatientDescription =
                            clinical.sleep_patient_description || '';
                        formData.sleepExamDate = (function () {
                            var raw = clinical.sleep_exam_date;
                            if (!raw)
                                return '';
                            if (typeof raw === 'string') {
                                return raw.slice(0, 10);
                            }
                            if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
                                var y = raw.getUTCFullYear();
                                var m = String(raw.getUTCMonth() + 1).padStart(2, '0');
                                var d = String(raw.getUTCDate()).padStart(2, '0');
                                return "".concat(y, "-").concat(m, "-").concat(d);
                            }
                            return '';
                        })();
                        formData.speechPatientDescription =
                            clinical.speech_patient_description || '';
                        formData.wearingOff =
                            clinical.has_wearing_off === true ? true : undefined;
                        formData.durationWearingOff = clinical.average_on_time_hours
                            ? String(clinical.average_on_time_hours)
                            : '';
                        formData.DelayOn = clinical.has_delayed_on === true ? true : undefined;
                        formData.durationLDopa = clinical.ldopa_onset_time_hours
                            ? String(clinical.ldopa_onset_time_hours)
                            : '';
                        if (!(clinical.hoehn_yahr_stage_id != null)) return [3 /*break*/, 7];
                        console.log('🔍 DEBUG - Carregando scaleHY:', {
                            hoehn_yahr_stage_id: clinical.hoehn_yahr_stage_id,
                        });
                        return [4 /*yield*/, this.hoehnYahrScaleRepository.findOne({
                                where: { id: clinical.hoehn_yahr_stage_id },
                            })];
                    case 6:
                        hoehnYahr = _x.sent();
                        console.log('🔍 DEBUG - Hoehn-Yahr carregado:', {
                            hoehnYahr: hoehnYahr
                                ? {
                                    id: hoehnYahr.id,
                                    stage: hoehnYahr.stage,
                                    tipo_stage: typeof hoehnYahr.stage,
                                }
                                : null,
                        });
                        if ((hoehnYahr === null || hoehnYahr === void 0 ? void 0 : hoehnYahr.stage) !== null && (hoehnYahr === null || hoehnYahr === void 0 ? void 0 : hoehnYahr.stage) !== undefined) {
                            formData.scaleHY = this.normalizeHoehnYahrStageForFrontend(hoehnYahr.stage);
                            console.log('🔍 DEBUG - scaleHY definido:', {
                                'formData.scaleHY': formData.scaleHY,
                                'stage bruto': hoehnYahr.stage,
                            });
                        }
                        else {
                            formData.scaleHY = '';
                            console.log('🔍 DEBUG - scaleHY vazio (stage é null/undefined)');
                        }
                        return [3 /*break*/, 8];
                    case 7:
                        formData.scaleHY = '';
                        console.log('🔍 DEBUG - scaleHY vazio (hoehn_yahr_stage_id não existe ou é null/undefined)');
                        _x.label = 8;
                    case 8:
                        formData.scaleSE = clinical.schwab_england_score
                            ? String(clinical.schwab_england_score)
                            : '';
                        formData.comorbidities = clinical.comorbidities || '';
                        formData.otherMedications = clinical.other_medications || '';
                        formData.medicationAllergies = clinical.medication_allergies || '';
                        formData.foodAllergies = clinical.food_allergies || '';
                        // Campos de cirurgia
                        formData.surgery = clinical.has_surgery_history ? 'Sim' : 'Não';
                        formData.surgerrYear = clinical.surgery_year
                            ? String(clinical.surgery_year)
                            : '';
                        if (!clinical.surgery_type_id) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.surgeryTypeRepository.findOne({
                                where: { id: clinical.surgery_type_id },
                            })];
                    case 9:
                        surgeryType = _x.sent();
                        formData.surgeryType = (surgeryType === null || surgeryType === void 0 ? void 0 : surgeryType.description) || '';
                        return [3 /*break*/, 11];
                    case 10:
                        formData.surgeryType = '';
                        _x.label = 11;
                    case 11:
                        formData.surgeryTarget = clinical.surgery_target || '';
                        formData.evolution = clinical.disease_evolution || '';
                        formData.symptom = clinical.current_symptoms || '';
                        formData.vitamins = ''; // Não há campo no banco para vitamins
                        _x.label = 12;
                    case 12:
                        if (!(medications && medications.length > 0)) return [3 /*break*/, 16];
                        console.log('🔍 Processing medications - raw count:', medications.length);
                        medicationIds = medications
                            .map(function (med) { return med.medication_id; })
                            .filter(function (id) { return id != null && id !== undefined; });
                        console.log('🔍 Medication IDs extracted:', medicationIds);
                        if (!(medicationIds.length > 0)) return [3 /*break*/, 14];
                        return [4 /*yield*/, this.medicationReferenceRepository.find({
                                where: { id: (0, typeorm_2.In)(medicationIds) },
                            })];
                    case 13:
                        _a = _x.sent();
                        return [3 /*break*/, 15];
                    case 14:
                        _a = [];
                        _x.label = 15;
                    case 15:
                        medicationRefs = _a;
                        console.log('🔍 Medication references found:', medicationRefs.length);
                        if (medicationRefs.length > 0) {
                            console.log('🔍 Sample medication reference:', {
                                id: medicationRefs[0].id,
                                drug_name: medicationRefs[0].drug_name,
                            });
                        }
                        medicationMap_1 = new Map(medicationRefs.map(function (ref) { return [ref.id, ref]; }));
                        STANDARD_DRUGS_1 = [
                            'Levodopa / Carbidopa',
                            'Levodopa / Benserazida BD',
                            'Levodopa / Benserazida',
                            'Levodopa / Benserazida HBS',
                            'Levodopa / Benserazida DR',
                            'Levodopa / Carbidopa / Entacapona',
                            'Entacapone',
                            'Rasagilina',
                            'Safinamida',
                            'Amantadina',
                            'Pramipexol',
                        ];
                        DRUG_NAME_MAPPING_1 = {
                            Sinemet: 'Levodopa / Carbidopa',
                            Madopar: 'Levodopa / Benserazida',
                            Stalevo: 'Levodopa / Carbidopa / Entacapona',
                            Pramipexole: 'Pramipexol',
                            Rasagiline: 'Rasagilina',
                            Amantadine: 'Amantadina',
                            Entacapone: 'Entacapone',
                        };
                        // Mapear medicamentos para o formato esperado pelo frontend
                        formData.medications = medications.map(function (med) {
                            var medRef = medicationMap_1.get(med.medication_id);
                            var drugName = (medRef === null || medRef === void 0 ? void 0 : medRef.drug_name) || '';
                            // Mapear nome antigo para novo se necessário
                            if (drugName && DRUG_NAME_MAPPING_1[drugName]) {
                                drugName = DRUG_NAME_MAPPING_1[drugName];
                            }
                            // Converter valores decimais (podem vir como string do banco)
                            var doseMg = typeof med.dose_mg === 'string'
                                ? parseFloat(med.dose_mg)
                                : Number(med.dose_mg) || 0;
                            var dosesPerDay = typeof med.doses_per_day === 'string'
                                ? parseInt(med.doses_per_day, 10)
                                : Number(med.doses_per_day) || 0;
                            var conversionFactor = typeof med.led_conversion_factor === 'string'
                                ? parseFloat(med.led_conversion_factor)
                                : Number(med.led_conversion_factor) || 0;
                            // Calcular LED: dose_mg × led_conversion_factor × doses_per_day
                            var ledValue = doseMg * conversionFactor * dosesPerDay;
                            // Verificar se é uma medicação personalizada (não está na lista padrão)
                            // Se drugName estiver vazio, também considerar como custom para evitar problemas
                            var isCustomDrug = drugName
                                ? !STANDARD_DRUGS_1.includes(drugName)
                                : true;
                            // Garantir que o campo drug não seja vazio
                            // Se for custom mas não tiver nome, usar "Outro"
                            var finalDrug = isCustomDrug ? 'Outro' : drugName || '';
                            // Debug: log para verificar o que está sendo retornado
                            if (!drugName || isCustomDrug) {
                                console.log('🔍 Medication mapping:', {
                                    originalName: medRef === null || medRef === void 0 ? void 0 : medRef.drug_name,
                                    mappedName: drugName,
                                    isCustom: isCustomDrug,
                                    finalDrug: finalDrug,
                                    inStandardList: STANDARD_DRUGS_1.includes(drugName),
                                });
                            }
                            return {
                                drug: finalDrug,
                                doseMg: doseMg > 0 ? String(doseMg) : '',
                                qtDose: dosesPerDay > 0 ? String(dosesPerDay) : '1',
                                led: ledValue > 0 ? String(Math.round(ledValue)) : '0',
                                customDrugName: isCustomDrug && drugName ? drugName : '',
                                customConversionFactor: isCustomDrug ? String(conversionFactor) : '',
                            };
                        });
                        // Calcular LED total (soma de todos os medicamentos)
                        formData.leddResult = String(Math.round(medications.reduce(function (sum, med) {
                            // Converter valores decimais (podem vir como string do banco)
                            var doseMg = typeof med.dose_mg === 'string'
                                ? parseFloat(med.dose_mg)
                                : Number(med.dose_mg) || 0;
                            var dosesPerDay = typeof med.doses_per_day === 'string'
                                ? parseInt(med.doses_per_day, 10)
                                : Number(med.doses_per_day) || 0;
                            var conversionFactor = typeof med.led_conversion_factor === 'string'
                                ? parseFloat(med.led_conversion_factor)
                                : Number(med.led_conversion_factor) || 0;
                            return sum + doseMg * conversionFactor * dosesPerDay;
                        }, 0)));
                        return [3 /*break*/, 17];
                    case 16:
                        // Inicializar array vazio se não houver medicamentos
                        formData.medications = [];
                        formData.leddResult = '0';
                        _x.label = 17;
                    case 17:
                        // Debug: verificar o que está sendo retornado
                        console.log('FormData medications before return:', ((_l = formData.medications) === null || _l === void 0 ? void 0 : _l.length) || 0);
                        if (formData.medications && formData.medications.length > 0) {
                            console.log('Sample formatted medication:', JSON.stringify(formData.medications[0], null, 2));
                        }
                        // Carregar protocolos do sono - STOP-Bang
                        if (questionnaire.stopbang_score) {
                            stopbang = questionnaire.stopbang_score;
                            formData.stopbang_snore = (_m = stopbang.snoring) !== null && _m !== void 0 ? _m : '';
                            formData.stopbang_tired = (_o = stopbang.tired) !== null && _o !== void 0 ? _o : '';
                            formData.stopbang_observed = (_p = stopbang.observed_apnea) !== null && _p !== void 0 ? _p : '';
                            formData.stopbang_pressure = (_q = stopbang.blood_pressure) !== null && _q !== void 0 ? _q : '';
                            formData.stopbang_age = (_r = stopbang.age_over_50) !== null && _r !== void 0 ? _r : '';
                            formData.stopbang_neck = (_s = stopbang.neck_circumference_large) !== null && _s !== void 0 ? _s : '';
                            formData.stopbang_gender = (_t = stopbang.gender_male) !== null && _t !== void 0 ? _t : '';
                            formData.scoreStopBang =
                                stopbang.total_score !== null ? String(stopbang.total_score) : '';
                        }
                        // Carregar protocolos do sono - Epworth
                        if (questionnaire.epworth_score) {
                            epworth = questionnaire.epworth_score;
                            formData.epworth_q1 =
                                epworth.sitting_reading !== null &&
                                    epworth.sitting_reading !== undefined
                                    ? String(epworth.sitting_reading)
                                    : '';
                            formData.epworth_q2 =
                                epworth.watching_tv !== null && epworth.watching_tv !== undefined
                                    ? String(epworth.watching_tv)
                                    : '';
                            formData.epworth_q3 =
                                epworth.sitting_inactive_public !== null &&
                                    epworth.sitting_inactive_public !== undefined
                                    ? String(epworth.sitting_inactive_public)
                                    : '';
                            formData.epworth_q4 =
                                epworth.passenger_car !== null && epworth.passenger_car !== undefined
                                    ? String(epworth.passenger_car)
                                    : '';
                            formData.epworth_q5 =
                                epworth.lying_down_afternoon !== null &&
                                    epworth.lying_down_afternoon !== undefined
                                    ? String(epworth.lying_down_afternoon)
                                    : '';
                            formData.epworth_q6 =
                                epworth.sitting_talking !== null &&
                                    epworth.sitting_talking !== undefined
                                    ? String(epworth.sitting_talking)
                                    : '';
                            formData.epworth_q7 =
                                epworth.sitting_after_lunch !== null &&
                                    epworth.sitting_after_lunch !== undefined
                                    ? String(epworth.sitting_after_lunch)
                                    : '';
                            formData.epworth_q8 =
                                epworth.car_stopped_traffic !== null &&
                                    epworth.car_stopped_traffic !== undefined
                                    ? String(epworth.car_stopped_traffic)
                                    : '';
                            formData.scoreEpworth =
                                epworth.total_score !== null ? String(epworth.total_score) : '';
                        }
                        // Carregar protocolos do sono - PDSS-2
                        if (questionnaire.pdss2_score) {
                            pdss2 = questionnaire.pdss2_score;
                            formData.pdss2_q1 =
                                pdss2.q1 !== null && pdss2.q1 !== undefined ? String(pdss2.q1) : '';
                            formData.pdss2_q2 =
                                pdss2.q2 !== null && pdss2.q2 !== undefined ? String(pdss2.q2) : '';
                            formData.pdss2_q3 =
                                pdss2.q3 !== null && pdss2.q3 !== undefined ? String(pdss2.q3) : '';
                            formData.pdss2_q4 =
                                pdss2.q4 !== null && pdss2.q4 !== undefined ? String(pdss2.q4) : '';
                            formData.pdss2_q5 =
                                pdss2.q5 !== null && pdss2.q5 !== undefined ? String(pdss2.q5) : '';
                            formData.pdss2_q6 =
                                pdss2.q6 !== null && pdss2.q6 !== undefined ? String(pdss2.q6) : '';
                            formData.pdss2_q7 =
                                pdss2.q7 !== null && pdss2.q7 !== undefined ? String(pdss2.q7) : '';
                            formData.pdss2_q8 =
                                pdss2.q8 !== null && pdss2.q8 !== undefined ? String(pdss2.q8) : '';
                            formData.pdss2_q9 =
                                pdss2.q9 !== null && pdss2.q9 !== undefined ? String(pdss2.q9) : '';
                            formData.pdss2_q10 =
                                pdss2.q10 !== null && pdss2.q10 !== undefined ? String(pdss2.q10) : '';
                            formData.pdss2_q11 =
                                pdss2.q11 !== null && pdss2.q11 !== undefined ? String(pdss2.q11) : '';
                            formData.pdss2_q12 =
                                pdss2.q12 !== null && pdss2.q12 !== undefined ? String(pdss2.q12) : '';
                            formData.pdss2_q13 =
                                pdss2.q13 !== null && pdss2.q13 !== undefined ? String(pdss2.q13) : '';
                            formData.pdss2_q14 =
                                pdss2.q14 !== null && pdss2.q14 !== undefined ? String(pdss2.q14) : '';
                            formData.pdss2_q15 =
                                pdss2.q15 !== null && pdss2.q15 !== undefined ? String(pdss2.q15) : '';
                            formData.scorePDSS2 =
                                pdss2.total_score !== null ? String(pdss2.total_score) : '';
                        }
                        // Carregar protocolos do sono - RBDSQ / RBDSQ-BR
                        if (questionnaire.rbdsq_br_score) {
                            rbdsq = questionnaire.rbdsq_br_score;
                            formData.q1RBDSQ =
                                rbdsq.q1_realistic_dreams !== null &&
                                    rbdsq.q1_realistic_dreams !== undefined
                                    ? rbdsq.q1_realistic_dreams
                                        ? '1'
                                        : '0'
                                    : '';
                            formData.q2RBDSQ =
                                rbdsq.q2_aggressive_dreams !== null &&
                                    rbdsq.q2_aggressive_dreams !== undefined
                                    ? rbdsq.q2_aggressive_dreams
                                        ? '1'
                                        : '0'
                                    : '';
                            formData.q3RBDSQ =
                                rbdsq.q3_dream_enactment !== null &&
                                    rbdsq.q3_dream_enactment !== undefined
                                    ? rbdsq.q3_dream_enactment
                                        ? '1'
                                        : '0'
                                    : '';
                            formData.q4RBDSQ =
                                rbdsq.q4_limb_movements !== null &&
                                    rbdsq.q4_limb_movements !== undefined
                                    ? rbdsq.q4_limb_movements
                                        ? '1'
                                        : '0'
                                    : '';
                            formData.q5RBDSQ =
                                rbdsq.q5_injury_potential !== null &&
                                    rbdsq.q5_injury_potential !== undefined
                                    ? rbdsq.q5_injury_potential
                                        ? '1'
                                        : '0'
                                    : '';
                            formData.q6_1RBDSQ =
                                rbdsq.q6_1_vocalizations !== null &&
                                    rbdsq.q6_1_vocalizations !== undefined
                                    ? rbdsq.q6_1_vocalizations
                                        ? '1'
                                        : '0'
                                    : '';
                            formData.q6_2RBDSQ =
                                rbdsq.q6_2_fighting_movements !== null &&
                                    rbdsq.q6_2_fighting_movements !== undefined
                                    ? rbdsq.q6_2_fighting_movements
                                        ? '1'
                                        : '0'
                                    : '';
                            formData.q6_3RBDSQ =
                                rbdsq.q6_3_complex_movements_or_falls !== null &&
                                    rbdsq.q6_3_complex_movements_or_falls !== undefined
                                    ? rbdsq.q6_3_complex_movements_or_falls
                                        ? '1'
                                        : '0'
                                    : '';
                            formData.q6_4RBDSQ =
                                rbdsq.q6_4_objects_falling !== null &&
                                    rbdsq.q6_4_objects_falling !== undefined
                                    ? rbdsq.q6_4_objects_falling
                                        ? '1'
                                        : '0'
                                    : '';
                            formData.q7RBDSQ =
                                rbdsq.q7_movements_cause_awakenings !== null &&
                                    rbdsq.q7_movements_cause_awakenings !== undefined
                                    ? rbdsq.q7_movements_cause_awakenings
                                        ? '1'
                                        : '0'
                                    : '';
                            formData.q8RBDSQ =
                                rbdsq.q8_dream_recall !== null && rbdsq.q8_dream_recall !== undefined
                                    ? rbdsq.q8_dream_recall
                                        ? '1'
                                        : '0'
                                    : '';
                            formData.q9RBDSQ =
                                rbdsq.q9_disturbed_sleep !== null &&
                                    rbdsq.q9_disturbed_sleep !== undefined
                                    ? rbdsq.q9_disturbed_sleep
                                        ? '1'
                                        : '0'
                                    : '';
                            formData.q10RBDSQ =
                                rbdsq.q10_neurological_disease !== null &&
                                    rbdsq.q10_neurological_disease !== undefined
                                    ? rbdsq.q10_neurological_disease
                                        ? '1'
                                        : '0'
                                    : '';
                            formData.rbdsqNeuroDiseaseDescription =
                                rbdsq.neuro_disease_description !== null &&
                                    rbdsq.neuro_disease_description !== undefined
                                    ? String(rbdsq.neuro_disease_description)
                                    : '';
                            formData.scoreRBDSQ =
                                rbdsq.total_score !== null ? String(rbdsq.total_score) : '';
                        }
                        else if (questionnaire.rbdsq_score) {
                            rbdsq = questionnaire.rbdsq_score;
                            formData.q1RBDSQ =
                                rbdsq.q1_vivid_dreams !== null && rbdsq.q1_vivid_dreams !== undefined
                                    ? rbdsq.q1_vivid_dreams
                                        ? '1'
                                        : '0'
                                    : '';
                            formData.q2RBDSQ =
                                rbdsq.q2_aggressive_content !== null &&
                                    rbdsq.q2_aggressive_content !== undefined
                                    ? rbdsq.q2_aggressive_content
                                        ? '1'
                                        : '0'
                                    : '';
                            formData.q3RBDSQ =
                                rbdsq.q3_dream_enactment !== null &&
                                    rbdsq.q3_dream_enactment !== undefined
                                    ? rbdsq.q3_dream_enactment
                                        ? '1'
                                        : '0'
                                    : '';
                            formData.q4RBDSQ =
                                rbdsq.q4_limb_movements !== null &&
                                    rbdsq.q4_limb_movements !== undefined
                                    ? rbdsq.q4_limb_movements
                                        ? '1'
                                        : '0'
                                    : '';
                            formData.q5RBDSQ =
                                rbdsq.q5_injury_potential !== null &&
                                    rbdsq.q5_injury_potential !== undefined
                                    ? rbdsq.q5_injury_potential
                                        ? '1'
                                        : '0'
                                    : '';
                            formData.q6RBDSQ =
                                rbdsq.q6_bed_disruption !== null &&
                                    rbdsq.q6_bed_disruption !== undefined
                                    ? rbdsq.q6_bed_disruption
                                        ? '1'
                                        : '0'
                                    : '';
                            formData.q7RBDSQ =
                                rbdsq.q7_awakening_recall !== null &&
                                    rbdsq.q7_awakening_recall !== undefined
                                    ? rbdsq.q7_awakening_recall
                                        ? '1'
                                        : '0'
                                    : '';
                            formData.q8RBDSQ =
                                rbdsq.q8_sleep_disruption !== null &&
                                    rbdsq.q8_sleep_disruption !== undefined
                                    ? rbdsq.q8_sleep_disruption
                                        ? '1'
                                        : '0'
                                    : '';
                            formData.q9RBDSQ =
                                rbdsq.q9_neurological_disorder !== null &&
                                    rbdsq.q9_neurological_disorder !== undefined
                                    ? rbdsq.q9_neurological_disorder
                                        ? '1'
                                        : '0'
                                    : '';
                            formData.q10RBDSQ =
                                rbdsq.q10_rem_behavior_problem !== null &&
                                    rbdsq.q10_rem_behavior_problem !== undefined
                                    ? rbdsq.q10_rem_behavior_problem
                                        ? '1'
                                        : '0'
                                    : '';
                            formData.scoreRBDSQ =
                                rbdsq.total_score !== null ? String(rbdsq.total_score) : '';
                        }
                        // Carregar FOGQ
                        if (questionnaire.fogq_score) {
                            fogq = questionnaire.fogq_score;
                            // Os dados do FOGQ são armazenados no estado fogq, não no formData diretamente
                            // Mas vamos adicionar ao formData para referência
                            formData.scoreFOGQ =
                                fogq.total_score !== null ? String(fogq.total_score) : '';
                        }
                        updrsScoreData = this.extractScoreData(questionnaire.updrs3_score, UPDRS_SCORE_FIELDS, ['total_score']);
                        if (updrsScoreData) {
                            formData.updrs3Scores = updrsScoreData;
                            if (updrsScoreData.total_score !== null &&
                                updrsScoreData.total_score !== undefined) {
                                formData.scoreUPDRS3 = String(updrsScoreData.total_score);
                            }
                        }
                        meemScoreData = this.extractScoreData(questionnaire.meem_score, MEEM_SCORE_FIELDS, ['total_score']);
                        if (meemScoreData) {
                            formData.meemScores = meemScoreData;
                            if (meemScoreData.total_score !== null &&
                                meemScoreData.total_score !== undefined) {
                                formData.scoreMEEN = String(meemScoreData.total_score);
                            }
                        }
                        udysrsScoreData = this.extractScoreData(questionnaire.udysrs_score, UDYSRS_SCORE_FIELDS, ['historical_subscore', 'objective_subscore', 'total_score']);
                        if (udysrsScoreData) {
                            formData.udysrsScores = udysrsScoreData;
                            if (udysrsScoreData.total_score !== null &&
                                udysrsScoreData.total_score !== undefined) {
                                formData.scoreUDRS = String(udysrsScoreData.total_score);
                            }
                        }
                        if (!Array.isArray(questionnaire.pdf_reports)) return [3 /*break*/, 19];
                        return [4 /*yield*/, Promise.all(questionnaire.pdf_reports.map(function (report) { return __awaiter(_this, void 0, void 0, function () {
                                var fileDownloadUrl;
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, this.pdfReportsService.getPresignedDownloadUrl(report.file_path)];
                                        case 1:
                                            fileDownloadUrl = _b.sent();
                                            return [2 /*return*/, {
                                                    id: report.id,
                                                    reportType: report.report_type,
                                                    fileName: report.file_name,
                                                    fileSizeBytes: report.file_size_bytes,
                                                    uploadedAt: report.uploaded_at,
                                                    notes: report.notes,
                                                    filePath: (_a = report.file_path) !== null && _a !== void 0 ? _a : null,
                                                    fileDownloadUrl: fileDownloadUrl,
                                                }];
                                    }
                                });
                            }); }))];
                    case 18:
                        _b = _x.sent();
                        return [3 /*break*/, 20];
                    case 19:
                        _b = [];
                        _x.label = 20;
                    case 20:
                        pdfReports = _b;
                        if (pdfReports.length > 0) {
                            polysomnographyReport = pdfReports.find(function (report) { return report.reportType === 'POLYSOMNOGRAPHY'; });
                            if (polysomnographyReport) {
                                formData.polissonografoPdfReportId = polysomnographyReport.id;
                                formData.polissonografoPdfFileName = polysomnographyReport.fileName;
                            }
                            else {
                                formData.polissonografoPdfReportId = '';
                                formData.polissonografoPdfFileName = '';
                            }
                            biobitReport = pdfReports.find(function (report) { return report.reportType === 'BIOBIT'; });
                            if (biobitReport) {
                                formData.biobitPdfReportId = biobitReport.id;
                                formData.biobitPdfFileName = biobitReport.fileName;
                            }
                            else {
                                formData.biobitPdfReportId = '';
                                formData.biobitPdfFileName = '';
                            }
                            delsysReport = pdfReports.find(function (report) { return report.reportType === 'DELSYS'; });
                            if (delsysReport) {
                                formData.delsysPdfReportId = delsysReport.id;
                                formData.delsysPdfFileName = delsysReport.fileName;
                            }
                            else {
                                formData.delsysPdfReportId = '';
                                formData.delsysPdfFileName = '';
                            }
                        }
                        else {
                            formData.polissonografoPdfReportId = '';
                            formData.polissonografoPdfFileName = '';
                            formData.biobitPdfReportId = '';
                            formData.biobitPdfFileName = '';
                            formData.delsysPdfReportId = '';
                            formData.delsysPdfFileName = '';
                        }
                        // Processar binary collections para retornar apenas informações essenciais
                        console.log('🔍 formatQuestionnaireForFrontend - binary_collections ANTES de processar:', {
                            hasBinaryCollections: !!questionnaire.binary_collections,
                            isArray: Array.isArray(questionnaire.binary_collections),
                            rawCount: ((_u = questionnaire.binary_collections) === null || _u === void 0 ? void 0 : _u.length) || 0,
                            type: typeof questionnaire.binary_collections,
                            questionnaireId: questionnaire.id,
                            sample: ((_v = questionnaire.binary_collections) === null || _v === void 0 ? void 0 : _v[0]) || null,
                        });
                        binaryCollections = Array.isArray(questionnaire.binary_collections)
                            ? questionnaire.binary_collections.map(function (bc) { return ({
                                id: bc.id,
                                task_id: bc.task_id,
                                repetitions_count: bc.repetitions_count,
                                collected_at: bc.collected_at,
                                active_task: bc.active_task
                                    ? {
                                        task_code: bc.active_task.task_code,
                                        task_name: bc.active_task.task_name,
                                    }
                                    : null,
                            }); })
                            : [];
                        console.log('🔍 formatQuestionnaireForFrontend - binaryCollections DEPOIS de processar:', {
                            count: binaryCollections.length,
                            sample: binaryCollections[0] || null,
                        });
                        return [2 /*return*/, {
                                id: questionnaire.id,
                                patientId: questionnaire.patient_id,
                                fullName: patient.full_name,
                                cpf: patient.cpf || '', // CPF em texto para exibição nas telas
                                cpfHash: patient.cpf_hash || '', // Hash do CPF para exportações
                                status: questionnaire.status,
                                lastStep: questionnaire.last_step || 1, // Último passo salvo
                                createdAt: questionnaire.created_at.toISOString().split('T')[0],
                                updatedAt: questionnaire.updated_at.toISOString().split('T')[0],
                                completedAt: questionnaire.completed_at
                                    ? questionnaire.completed_at.toISOString().split('T')[0]
                                    : null,
                                collectionTimeSeconds: (_w = questionnaire.collection_time_seconds) !== null && _w !== void 0 ? _w : 0,
                                data: __assign(__assign({}, formData), { binaryCollections: binaryCollections }),
                                // Debug: adicionar binaryCollections também no nível raiz para facilitar debug
                                _debug_binaryCollections: binaryCollections,
                                // Adicionar dados dos protocolos separadamente para facilitar o carregamento no frontend
                                sleepProtocols: {
                                    stopbang: questionnaire.stopbang_score || null,
                                    epworth: questionnaire.epworth_score || null,
                                    pdss2: questionnaire.pdss2_score || null,
                                    rbdsq: questionnaire.rbdsq_score || null,
                                },
                                fogq: questionnaire.fogq_score || null,
                                pdfReports: pdfReports,
                            }];
                }
            });
        });
    };
    QuestionnairesService.prototype.areAllActiveTasksCompleted = function (questionnaireId) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaire, binaryCollections, expectedRepetitionsByTaskCode, repetitionsByTaskCode, _i, binaryCollections_1, bc, taskCode, current, reps, _a, _b, _c, taskCode, totalReps, expected, taskCollections;
            var _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, this.questionnairesRepository.findOne({
                            where: { id: questionnaireId },
                            relations: [
                                'binary_collections',
                                'binary_collections.active_task',
                                'patient',
                                'task_collections',
                            ],
                        })];
                    case 1:
                        questionnaire = _g.sent();
                        if (!questionnaire) {
                            throw new common_1.NotFoundException("Questionnaire with ID ".concat(questionnaireId, " not found"));
                        }
                        binaryCollections = Array.isArray(questionnaire.binary_collections)
                            ? questionnaire.binary_collections
                            : [];
                        if (binaryCollections.length > 0) {
                            expectedRepetitionsByTaskCode = {
                                TA5: 3,
                                TA14: 3,
                                TA15: 2,
                                TA16: 2,
                                TA17: 3,
                            };
                            repetitionsByTaskCode = new Map();
                            for (_i = 0, binaryCollections_1 = binaryCollections; _i < binaryCollections_1.length; _i++) {
                                bc = binaryCollections_1[_i];
                                taskCode = (_d = bc.active_task) === null || _d === void 0 ? void 0 : _d.task_code;
                                if (!taskCode) {
                                    continue;
                                }
                                current = (_e = repetitionsByTaskCode.get(taskCode)) !== null && _e !== void 0 ? _e : 0;
                                reps = typeof bc.repetitions_count === 'number' && bc.repetitions_count > 0
                                    ? bc.repetitions_count
                                    : 1;
                                repetitionsByTaskCode.set(taskCode, current + reps);
                            }
                            // Se não houver task_code associado às coletas, consideramos tarefas não concluídas
                            if (repetitionsByTaskCode.size === 0) {
                                return [2 /*return*/, false];
                            }
                            for (_a = 0, _b = repetitionsByTaskCode.entries(); _a < _b.length; _a++) {
                                _c = _b[_a], taskCode = _c[0], totalReps = _c[1];
                                expected = (_f = expectedRepetitionsByTaskCode[taskCode]) !== null && _f !== void 0 ? _f : 1;
                                if (totalReps < expected) {
                                    return [2 /*return*/, false];
                                }
                            }
                            return [2 /*return*/, true];
                        }
                        taskCollections = Array.isArray(questionnaire.task_collections)
                            ? questionnaire.task_collections
                            : [];
                        if (taskCollections.length === 0) {
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, taskCollections.every(function (tc) {
                                return typeof tc.completion_percentage === 'number' &&
                                    tc.completion_percentage >= 100;
                            })];
                }
            });
        });
    };
    QuestionnairesService.prototype.areAllQuestionnaireProtocolsCompleted = function (questionnaire) {
        // Consideramos protocolos concluídos quando existem registros associados
        // às relações de score/avaliação do questionário. Como cada protocolo é salvo
        // em tabela própria, a presença do objeto já indica que o protocolo foi preenchido.
        var isHealthyControl = questionnaire.is_healthy_control === true;
        var sleepProtocolsCompleted = isHealthyControl
            ? !!questionnaire.stopbang_score && !!questionnaire.epworth_score
            : !!questionnaire.stopbang_score &&
                !!questionnaire.epworth_score &&
                !!questionnaire.pdss2_score &&
                !!questionnaire.rbdsq_score;
        var neurologicalProtocolsCompleted = !!questionnaire.updrs3_score &&
            !!questionnaire.meem_score &&
            !!questionnaire.udysrs_score;
        var physiotherapyProtocolsCompleted = isHealthyControl
            ? true
            : !!questionnaire.fogq_score;
        return (sleepProtocolsCompleted &&
            neurologicalProtocolsCompleted &&
            physiotherapyProtocolsCompleted);
    };
    QuestionnairesService.prototype.finalizeQuestionnaire = function (id, evaluatorId) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaire, allTasksDone, allProtocolsDone;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.questionnairesRepository.findOne({
                            where: { id: id },
                            relations: [
                                'patient',
                                'binary_collections',
                                'task_collections',
                                'updrs3_score',
                                'meem_score',
                                'udysrs_score',
                                'stopbang_score',
                                'epworth_score',
                                'pdss2_score',
                                'rbdsq_score',
                                'fogq_score',
                            ],
                        })];
                    case 1:
                        questionnaire = _a.sent();
                        if (!questionnaire) {
                            throw new common_1.NotFoundException("Questionnaire with ID ".concat(id, " not found"));
                        }
                        if (questionnaire.status === 'completed') {
                            return [2 /*return*/, questionnaire];
                        }
                        return [4 /*yield*/, this.areAllActiveTasksCompleted(id)];
                    case 2:
                        allTasksDone = _a.sent();
                        allProtocolsDone = this.areAllQuestionnaireProtocolsCompleted(questionnaire);
                        if (!allTasksDone || !allProtocolsDone) {
                            throw new common_1.BadRequestException('O questionário ainda possui Tarefas Ativas ou protocolos pendentes. Conclua todas as coletas e protocolos antes de finalizar.');
                        }
                        questionnaire.status = 'completed';
                        questionnaire.completed_at = new Date();
                        questionnaire.last_step = 8;
                        this.setQuestionnaireEvaluator(questionnaire, evaluatorId);
                        return [2 /*return*/, this.questionnairesRepository.save(questionnaire)];
                }
            });
        });
    };
    /**
     * Convert object to CSV row
     */
    QuestionnairesService.prototype.objectToCsvRow = function (obj) {
        var values = Object.values(obj).map(function (val) {
            if (val === null || val === undefined)
                return '';
            var str = String(val);
            // Escape quotes and wrap in quotes if contains comma, newline, or quote
            if (str.includes(',') || str.includes('\n') || str.includes('"')) {
                return "\"".concat(str.replace(/"/g, '""'), "\"");
            }
            return str;
        });
        return values.join(',');
    };
    /**
     * Generate CSV for Demographics, Anthropometric and Basic Clinical data
     */
    QuestionnairesService.prototype.generateDemographicAnthropometricClinicalCsv = function (data) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28;
        var rows = [];
        // Header anonimizado (sem nomes, CPF, telefones e e-mail)
        var headers = [
            'questionnaire_id',
            'is_healthy_control',
            'collection_date',
            // removed: birthday (date of birth)
            'age',
            'gender',
            'ethnicity',
            'nationality',
            'education',
            'education_other',
            'marital_status',
            'occupation',
            // removed: phone_number, phone_number_contact, email
            'smoking_status',
            'smoked_before',
            'smoking_duration',
            'stopped_smoking_duration',
            'family_income_range',
            'visual_impairment',
            'hoarseness',
            'stuttering',
            'weight_kg',
            'height_cm',
            'bmi',
            'waist_circumference_cm',
            'hip_circumference_cm',
            'abdominal_circumference_cm',
            'neck_circumference_cm',
            'diagnostic_description',
            'onset_age',
            'parkinson_onset_type',
            'initial_symptom',
            'parkinson_side',
            'family_history_parkinson',
            'family_kinship_degree',
            'main_phenotype_code',
            'assessed_on_levodopa',
            'dyskinesia_presence',
            'freezing_of_gait',
            'freezing_of_gait_classification',
            'wearing_off_presence',
            'wearing_off_duration',
            'delayed_on_presence',
            'ldopa_duration',
            'hoehn_yahr_stage',
            'schwab_england_score',
            'comorbidities',
            'other_medications',
            'medication_allergies',
            'food_allergies',
            'surgery',
            'surgery_year',
            'surgery_type',
            'surgery_target',
            'disease_evolution',
            'current_symptoms',
        ];
        rows.push(headers.join(','));
        // Data row
        var values = [
            data.id || '',
            ((_a = data.data) === null || _a === void 0 ? void 0 : _a.isHealthyControl) === true,
            ((_b = data.data) === null || _b === void 0 ? void 0 : _b.dataColeta) || '',
            ((_c = data.data) === null || _c === void 0 ? void 0 : _c.age) || '',
            ((_d = data.data) === null || _d === void 0 ? void 0 : _d.gender) || '',
            ((_e = data.data) === null || _e === void 0 ? void 0 : _e.etnia) || '',
            ((_f = data.data) === null || _f === void 0 ? void 0 : _f.nationality) || '',
            ((_g = data.data) === null || _g === void 0 ? void 0 : _g.education) || '',
            ((_h = data.data) === null || _h === void 0 ? void 0 : _h.educationOther) || '',
            ((_j = data.data) === null || _j === void 0 ? void 0 : _j.maritalStatus) || '',
            ((_k = data.data) === null || _k === void 0 ? void 0 : _k.occupation) || '',
            // telefones e e-mail removidos
            ((_l = data.data) === null || _l === void 0 ? void 0 : _l.fumaCase) || '',
            ((_m = data.data) === null || _m === void 0 ? void 0 : _m.fumouAntes) || '',
            ((_o = data.data) === null || _o === void 0 ? void 0 : _o.smokingDuration) || '',
            ((_p = data.data) === null || _p === void 0 ? void 0 : _p.stoppedSmokingDuration) || '',
            ((_q = data.data) === null || _q === void 0 ? void 0 : _q.rendaFamiliar) || '',
            ((_r = data.data) === null || _r === void 0 ? void 0 : _r.deficienciaVisual) || '',
            ((_s = data.data) === null || _s === void 0 ? void 0 : _s.rouquidao) || '',
            ((_t = data.data) === null || _t === void 0 ? void 0 : _t.gagueja) || '',
            ((_u = data.data) === null || _u === void 0 ? void 0 : _u.weight) || '',
            ((_v = data.data) === null || _v === void 0 ? void 0 : _v.height) || '',
            ((_w = data.data) === null || _w === void 0 ? void 0 : _w.imc) || '',
            ((_x = data.data) === null || _x === void 0 ? void 0 : _x.waistSize) || '',
            ((_y = data.data) === null || _y === void 0 ? void 0 : _y.hipSize) || '',
            ((_z = data.data) === null || _z === void 0 ? void 0 : _z.abdominal) || '',
            ((_0 = data.data) === null || _0 === void 0 ? void 0 : _0.neckCircumference) || '',
            ((_1 = data.data) === null || _1 === void 0 ? void 0 : _1.diagnosticDescription) || '',
            ((_2 = data.data) === null || _2 === void 0 ? void 0 : _2.onsetAge) || '',
            ((_3 = data.data) === null || _3 === void 0 ? void 0 : _3.parkinsonOnset) || '',
            ((_4 = data.data) === null || _4 === void 0 ? void 0 : _4.initialSympton) || '',
            ((_5 = data.data) === null || _5 === void 0 ? void 0 : _5.parkinsonSide) || '',
            ((_6 = data.data) === null || _6 === void 0 ? void 0 : _6.familyCase) || '',
            ((_7 = data.data) === null || _7 === void 0 ? void 0 : _7.kinshipDegree) || '',
            ((_8 = data.data) === null || _8 === void 0 ? void 0 : _8.mainPhenotype) || '',
            (0, neurological_assessment_csv_util_1.pickExportValue)((_9 = data.data) === null || _9 === void 0 ? void 0 : _9.levodopaOn),
            (0, neurological_assessment_csv_util_1.pickExportValue)((_10 = data.data) === null || _10 === void 0 ? void 0 : _10.diskinectiaPresence),
            (0, neurological_assessment_csv_util_1.pickExportValue)((_11 = data.data) === null || _11 === void 0 ? void 0 : _11.fog),
            ((_12 = data.data) === null || _12 === void 0 ? void 0 : _12.fogClassifcation) || '',
            (0, neurological_assessment_csv_util_1.pickExportValue)((_13 = data.data) === null || _13 === void 0 ? void 0 : _13.wearingOff),
            ((_14 = data.data) === null || _14 === void 0 ? void 0 : _14.durationWearingOff) || '',
            (0, neurological_assessment_csv_util_1.pickExportValue)((_15 = data.data) === null || _15 === void 0 ? void 0 : _15.DelayOn),
            ((_16 = data.data) === null || _16 === void 0 ? void 0 : _16.durationLDopa) || '',
            ((_17 = data.data) === null || _17 === void 0 ? void 0 : _17.scaleHY) || '',
            ((_18 = data.data) === null || _18 === void 0 ? void 0 : _18.scaleSE) || '',
            ((_19 = data.data) === null || _19 === void 0 ? void 0 : _19.comorbidities) || '',
            ((_20 = data.data) === null || _20 === void 0 ? void 0 : _20.otherMedications) || '',
            ((_21 = data.data) === null || _21 === void 0 ? void 0 : _21.medicationAllergies) || '',
            ((_22 = data.data) === null || _22 === void 0 ? void 0 : _22.foodAllergies) || '',
            ((_23 = data.data) === null || _23 === void 0 ? void 0 : _23.surgery) || '',
            ((_24 = data.data) === null || _24 === void 0 ? void 0 : _24.surgerrYear) || '',
            ((_25 = data.data) === null || _25 === void 0 ? void 0 : _25.surgeryType) || '',
            ((_26 = data.data) === null || _26 === void 0 ? void 0 : _26.surgeryTarget) || '',
            ((_27 = data.data) === null || _27 === void 0 ? void 0 : _27.evolution) || '',
            ((_28 = data.data) === null || _28 === void 0 ? void 0 : _28.symptom) || '',
        ];
        rows.push((0, neurological_assessment_csv_util_1.joinSubjectDataCsvRow)(values));
        return rows.join('\n');
    };
    /**
     * Generate CSV for Neurological Assessment (UPDRS3, MEEM, UDysRS)
     */
    QuestionnairesService.prototype.generateNeurologicalAssessmentCsv = function (data) {
        var rows = [];
        // Header anonimizado (sem nome e CPF)
        var headers = [
            'questionnaire_id',
            'updrs3_total_score',
            'updrs3_speech',
            'updrs3_facial_expression',
            'updrs3_rigidity_neck',
            'updrs3_rigidity_rue',
            'updrs3_rigidity_lue',
            'updrs3_rigidity_rle',
            'updrs3_rigidity_lle',
            'updrs3_finger_tapping_right',
            'updrs3_finger_tapping_left',
            'updrs3_hand_movements_right',
            'updrs3_hand_movements_left',
            'updrs3_pronation_supination_right',
            'updrs3_pronation_supination_left',
            'updrs3_toe_tapping_right',
            'updrs3_toe_tapping_left',
            'updrs3_leg_agility_right',
            'updrs3_leg_agility_left',
            'updrs3_rising_from_chair',
            'updrs3_gait',
            'updrs3_freezing_of_gait',
            'updrs3_postural_stability',
            'updrs3_posture',
            'updrs3_global_bradykinesia',
            'updrs3_postural_tremor_right',
            'updrs3_postural_tremor_left',
            'updrs3_kinetic_tremor_right',
            'updrs3_kinetic_tremor_left',
            'updrs3_rest_tremor_rue',
            'updrs3_rest_tremor_lue',
            'updrs3_rest_tremor_rle',
            'updrs3_rest_tremor_lle',
            'updrs3_rest_tremor_lip_jaw',
            'updrs3_postural_tremor_amplitude',
            'updrs3_dyskinesia_present',
            'updrs3_dyskinesia_interfered',
            'meem_total_score',
            'meem_orientation_day',
            'meem_orientation_date',
            'meem_orientation_month',
            'meem_orientation_year',
            'meem_orientation_time',
            'meem_orientation_location',
            'meem_orientation_institution',
            'meem_orientation_city',
            'meem_orientation_state',
            'meem_orientation_country',
            'meem_registration_word1',
            'meem_registration_word2',
            'meem_registration_word3',
            'meem_attention_calc1',
            'meem_attention_calc2',
            'meem_attention_calc3',
            'meem_attention_calc4',
            'meem_attention_calc5',
            'meem_recall_word1',
            'meem_recall_word2',
            'meem_recall_word3',
            'meem_language_naming',
            'meem_language_repetition',
            'meem_language_command1',
            'meem_language_command2',
            'meem_language_command3',
            'meem_language_reading',
            'meem_language_writing',
            'meem_language_copying',
            'udysrs_historical_subscore',
            'udysrs_objective_subscore',
            'udysrs_total_score',
            'udysrs_q1',
            'udysrs_q2',
            'udysrs_q3',
            'udysrs_q4',
            'udysrs_q5',
            'udysrs_q6',
            'udysrs_q7',
            'udysrs_q8',
            'udysrs_q9',
            'udysrs_q10',
            'udysrs_q11',
            'udysrs_q12',
            'udysrs_q13',
            'udysrs_q14',
            'udysrs_q15',
            'udysrs_q16',
            'udysrs_q17',
            'udysrs_q18',
            'udysrs_q19',
            'udysrs_q20',
            'udysrs_q21',
            'udysrs_q22',
            'udysrs_q23',
            'udysrs_q24',
            'udysrs_q25',
            'udysrs_q26',
            'udysrs_q27',
            'udysrs_q28',
        ];
        rows.push(headers.join(','));
        var formData = data.data || {};
        var updrs3 = __assign(__assign({}, (data.updrs3_score || {})), (formData.updrs3Scores || {}));
        var meem = __assign(__assign({}, (data.meem_score || {})), (formData.meemScores || {}));
        var udysrs = __assign(__assign({}, (data.udysrs_score || {})), (formData.udysrsScores || {}));
        var udysrsQValues = (0, neurological_assessment_csv_util_1.getUdysrsQExportValues)(udysrs);
        var values = __spreadArray([
            data.id || '',
            formData.scoreUPDRS3 || '',
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.speech),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.facial_expression),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.rigidity_neck),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.rigidity_rue),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.rigidity_lue),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.rigidity_rle),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.rigidity_lle),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.finger_tapping_right),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.finger_tapping_left),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.hand_movements_right),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.hand_movements_left),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.pronation_supination_right),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.pronation_supination_left),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.toe_tapping_right),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.toe_tapping_left),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.leg_agility_right),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.leg_agility_left),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.rising_from_chair),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.gait),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.freezing_of_gait),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.postural_stability),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.posture),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.global_bradykinesia),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.postural_tremor_right),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.postural_tremor_left),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.kinetic_tremor_right),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.kinetic_tremor_left),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.rest_tremor_rue),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.rest_tremor_lue),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.rest_tremor_rle),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.rest_tremor_lle),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.rest_tremor_lip_jaw),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.postural_tremor_amplitude),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.dyskinesia_present),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(updrs3.dyskinesia_interfered),
            formData.scoreMEEN || '',
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.orientation_day),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.orientation_date),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.orientation_month),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.orientation_year),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.orientation_time),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.orientation_location),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.orientation_institution),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.orientation_city),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.orientation_state),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.orientation_country),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.registration_word1),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.registration_word2),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.registration_word3),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.attention_calc1),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.attention_calc2),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.attention_calc3),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.attention_calc4),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.attention_calc5),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.recall_word1),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.recall_word2),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.recall_word3),
            (0, neurological_assessment_csv_util_1.formatMeemLanguageNaming)(meem),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.language_repetition),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.language_command1),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.language_command2),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.language_command3),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.language_reading),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.language_writing),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(meem.language_copying),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(udysrs.historical_subscore),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(udysrs.objective_subscore),
            (0, neurological_assessment_csv_util_1.formatNeurologicalScoreCsv)(udysrs.total_score)
        ], udysrsQValues, true);
        rows.push((0, neurological_assessment_csv_util_1.joinSubjectDataCsvRow)(values));
        return rows.join('\n');
    };
    /**
     * Generate CSV for Speech Therapy (NMF)
     */
    QuestionnairesService.prototype.generateSpeechTherapyCsv = function (data) {
        var _a, _b, _c;
        var rows = [];
        // Header anonimizado (sem nome e CPF)
        var headers = [
            'questionnaire_id',
            'nmf_total_score',
            'nmf_q1',
            'nmf_q2',
            'nmf_q3',
            'nmf_q4',
            'nmf_q5',
            'nmf_q6',
            'nmf_q7',
            'nmf_q8',
            'nmf_q9',
            'nmf_q10',
            'nmf_q11',
            'nmf_q12',
            'nmf_q13',
            'nmf_q14',
            'nmf_q15',
            'nmf_q16',
            'nmf_q17',
            'nmf_q18',
        ];
        rows.push(headers.join(','));
        // Data row - NMF data would need to be added to the questionnaire structure
        var nmf = ((_a = data.data) === null || _a === void 0 ? void 0 : _a.nmfScores) || {};
        var nmfFullName = ((_b = data.data) === null || _b === void 0 ? void 0 : _b.fullName) || '';
        var nmfFirstName = nmfFullName.split(' ')[0] || '';
        var values = [
            data.id || '',
            ((_c = data.data) === null || _c === void 0 ? void 0 : _c.scoreNMF) || '',
            nmf.q1 || '',
            nmf.q2 || '',
            nmf.q3 || '',
            nmf.q4 || '',
            nmf.q5 || '',
            nmf.q6 || '',
            nmf.q7 || '',
            nmf.q8 || '',
            nmf.q9 || '',
            nmf.q10 || '',
            nmf.q11 || '',
            nmf.q12 || '',
            nmf.q13 || '',
            nmf.q14 || '',
            nmf.q15 || '',
            nmf.q16 || '',
            nmf.q17 || '',
            nmf.q18 || '',
        ];
        rows.push((0, neurological_assessment_csv_util_1.joinSubjectDataCsvRow)(values));
        return rows.join('\n');
    };
    /**
     * Generate CSV for Sleep Assessment (STOP-Bang, Epworth, PDSS-2, RBDSQ)
     */
    QuestionnairesService.prototype.generateSleepAssessmentCsv = function (data) {
        var _a;
        var d = data.data || {};
        var stop = data.stopbang_score;
        var epworth = data.epworth_score;
        var pdss2 = data.pdss2_score;
        var rbdsqBr = data.rbdsq_br_score;
        var rbdsqLegacy = data.rbdsq_score;
        var rbdsqField = function (formKey, brKey, legacyKey) {
            return (0, neurological_assessment_csv_util_1.pickExportValue)(d[formKey], brKey && rbdsqBr ? rbdsqBr[brKey] : undefined, legacyKey && rbdsqLegacy ? rbdsqLegacy[legacyKey] : undefined);
        };
        var rows = [];
        // Header anonimizado (sem nome e CPF)
        var headers = [
            'questionnaire_id',
            'sleep_test_recommended',
            'stopbang_total_score',
            'stopbang_snore',
            'stopbang_tired',
            'stopbang_observed',
            'stopbang_pressure',
            'stopbang_age',
            'stopbang_neck',
            'stopbang_gender',
            'epworth_total_score',
            'epworth_q1',
            'epworth_q2',
            'epworth_q3',
            'epworth_q4',
            'epworth_q5',
            'epworth_q6',
            'epworth_q7',
            'epworth_q8',
            'pdss2_total_score',
            'pdss2_q1',
            'pdss2_q2',
            'pdss2_q3',
            'pdss2_q4',
            'pdss2_q5',
            'pdss2_q6',
            'pdss2_q7',
            'pdss2_q8',
            'pdss2_q9',
            'pdss2_q10',
            'pdss2_q11',
            'pdss2_q12',
            'pdss2_q13',
            'pdss2_q14',
            'pdss2_q15',
            'rbdsq_total_score',
            'rbdsq_q1',
            'rbdsq_q2',
            'rbdsq_q3',
            'rbdsq_q4',
            'rbdsq_q5',
            'rbdsq_q6_1',
            'rbdsq_q6_2',
            'rbdsq_q6_3',
            'rbdsq_q6_4',
            'rbdsq_q7',
            'rbdsq_q8',
            'rbdsq_q9',
            'rbdsq_q10',
            'rbdsq_neuro_disease_description',
        ];
        rows.push(headers.join(','));
        // Data row
        var stopFullName = ((_a = data.data) === null || _a === void 0 ? void 0 : _a.fullName) || '';
        var stopFirstName = stopFullName.split(' ')[0] || '';
        var values = [
            data.id || '',
            d.sleepTestRecommended === true,
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.scoreStopBang, stop === null || stop === void 0 ? void 0 : stop.total_score),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.stopbang_snore, stop === null || stop === void 0 ? void 0 : stop.snoring),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.stopbang_tired, stop === null || stop === void 0 ? void 0 : stop.tired),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.stopbang_observed, stop === null || stop === void 0 ? void 0 : stop.observed_apnea),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.stopbang_pressure, stop === null || stop === void 0 ? void 0 : stop.blood_pressure),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.stopbang_age, stop === null || stop === void 0 ? void 0 : stop.age_over_50),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.stopbang_neck, stop === null || stop === void 0 ? void 0 : stop.neck_circumference_large),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.stopbang_gender, stop === null || stop === void 0 ? void 0 : stop.gender_male),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.scoreEpworth, epworth === null || epworth === void 0 ? void 0 : epworth.total_score),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.epworth_q1, epworth === null || epworth === void 0 ? void 0 : epworth.sitting_reading),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.epworth_q2, epworth === null || epworth === void 0 ? void 0 : epworth.watching_tv),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.epworth_q3, epworth === null || epworth === void 0 ? void 0 : epworth.sitting_inactive_public),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.epworth_q4, epworth === null || epworth === void 0 ? void 0 : epworth.passenger_car),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.epworth_q5, epworth === null || epworth === void 0 ? void 0 : epworth.lying_down_afternoon),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.epworth_q6, epworth === null || epworth === void 0 ? void 0 : epworth.sitting_talking),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.epworth_q7, epworth === null || epworth === void 0 ? void 0 : epworth.sitting_after_lunch),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.epworth_q8, epworth === null || epworth === void 0 ? void 0 : epworth.car_stopped_traffic),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.scorePDSS2, pdss2 === null || pdss2 === void 0 ? void 0 : pdss2.total_score),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.pdss2_q1, pdss2 === null || pdss2 === void 0 ? void 0 : pdss2.q1),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.pdss2_q2, pdss2 === null || pdss2 === void 0 ? void 0 : pdss2.q2),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.pdss2_q3, pdss2 === null || pdss2 === void 0 ? void 0 : pdss2.q3),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.pdss2_q4, pdss2 === null || pdss2 === void 0 ? void 0 : pdss2.q4),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.pdss2_q5, pdss2 === null || pdss2 === void 0 ? void 0 : pdss2.q5),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.pdss2_q6, pdss2 === null || pdss2 === void 0 ? void 0 : pdss2.q6),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.pdss2_q7, pdss2 === null || pdss2 === void 0 ? void 0 : pdss2.q7),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.pdss2_q8, pdss2 === null || pdss2 === void 0 ? void 0 : pdss2.q8),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.pdss2_q9, pdss2 === null || pdss2 === void 0 ? void 0 : pdss2.q9),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.pdss2_q10, pdss2 === null || pdss2 === void 0 ? void 0 : pdss2.q10),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.pdss2_q11, pdss2 === null || pdss2 === void 0 ? void 0 : pdss2.q11),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.pdss2_q12, pdss2 === null || pdss2 === void 0 ? void 0 : pdss2.q12),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.pdss2_q13, pdss2 === null || pdss2 === void 0 ? void 0 : pdss2.q13),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.pdss2_q14, pdss2 === null || pdss2 === void 0 ? void 0 : pdss2.q14),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.pdss2_q15, pdss2 === null || pdss2 === void 0 ? void 0 : pdss2.q15),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.scoreRBDSQ, rbdsqBr === null || rbdsqBr === void 0 ? void 0 : rbdsqBr.total_score, rbdsqLegacy === null || rbdsqLegacy === void 0 ? void 0 : rbdsqLegacy.total_score),
            rbdsqField('q1RBDSQ', 'q1_realistic_dreams', 'q1_vivid_dreams'),
            rbdsqField('q2RBDSQ', 'q2_aggressive_dreams', 'q2_aggressive_content'),
            rbdsqField('q3RBDSQ', 'q3_dream_enactment', 'q3_dream_enactment'),
            rbdsqField('q4RBDSQ', 'q4_limb_movements', 'q4_limb_movements'),
            rbdsqField('q5RBDSQ', 'q5_injury_potential', 'q5_injury_potential'),
            rbdsqField('q6_1RBDSQ', 'q6_1_vocalizations', 'q6_bed_disruption'),
            rbdsqField('q6_2RBDSQ', 'q6_2_fighting_movements'),
            rbdsqField('q6_3RBDSQ', 'q6_3_complex_movements_or_falls'),
            rbdsqField('q6_4RBDSQ', 'q6_4_objects_falling'),
            rbdsqField('q7RBDSQ', 'q7_movements_cause_awakenings', 'q7_awakening_recall'),
            rbdsqField('q8RBDSQ', 'q8_dream_recall', 'q8_sleep_disruption'),
            rbdsqField('q9RBDSQ', 'q9_disturbed_sleep', 'q9_neurological_disorder'),
            rbdsqField('q10RBDSQ', 'q10_neurological_disease', 'q10_rem_behavior_problem'),
            (0, neurological_assessment_csv_util_1.pickExportValue)(d.rbdsqNeuroDiseaseDescription, rbdsqBr === null || rbdsqBr === void 0 ? void 0 : rbdsqBr.neuro_disease_description, rbdsqLegacy === null || rbdsqLegacy === void 0 ? void 0 : rbdsqLegacy.neuro_disease_description),
        ];
        rows.push((0, neurological_assessment_csv_util_1.joinSubjectDataCsvRow)(values));
        return rows.join('\n');
    };
    /**
     * Generate CSV for Physiotherapy (FOGQ)
     */
    QuestionnairesService.prototype.generatePhysiotherapyCsv = function (data) {
        var _a, _b;
        var rows = [];
        // Header anonimizado (sem nome e CPF)
        var headers = [
            'questionnaire_id',
            'fogq_total_score',
            'fogq_gait_worst_state',
            'fogq_impact_daily_activities',
            'fogq_feet_stuck',
            'fogq_longest_episode',
            'fogq_hesitation_turning',
        ];
        rows.push(headers.join(','));
        // Data row
        var fogq = data.fogq || {};
        var fogqFullName = ((_a = data.data) === null || _a === void 0 ? void 0 : _a.fullName) || '';
        var fogqFirstName = fogqFullName.split(' ')[0] || '';
        var values = [
            data.id || '',
            (0, neurological_assessment_csv_util_1.pickExportValue)((_b = data.data) === null || _b === void 0 ? void 0 : _b.scoreFOGQ, fogq.total_score),
            (0, neurological_assessment_csv_util_1.pickExportValue)(fogq.gait_worst_state),
            (0, neurological_assessment_csv_util_1.pickExportValue)(fogq.impact_daily_activities),
            (0, neurological_assessment_csv_util_1.pickExportValue)(fogq.feet_stuck),
            (0, neurological_assessment_csv_util_1.pickExportValue)(fogq.longest_episode),
            (0, neurological_assessment_csv_util_1.pickExportValue)(fogq.hesitation_turning),
        ];
        rows.push((0, neurological_assessment_csv_util_1.joinSubjectDataCsvRow)(values));
        return rows.join('\n');
    };
    /**
     * Export questionnaire data with all related data including binary collections
     */
    QuestionnairesService.prototype.exportQuestionnaireData = function (questionnaireId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaire, csvFiles, pdfReportsWithData, exportPresignedTtlSeconds, pdfReports, _a, questionnaireEntity, patientCpfHash, binaryCollectionsQuery, binaryCollections, binaryCollectionsWithData;
            var _this = this;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.getQuestionnaireById(questionnaireId)];
                    case 1:
                        questionnaire = _c.sent();
                        csvFiles = {
                            demographicAnthropometricClinical: this.generateDemographicAnthropometricClinicalCsv(questionnaire),
                            neurologicalAssessment: this.generateNeurologicalAssessmentCsv(questionnaire),
                            speechTherapy: this.generateSpeechTherapyCsv(questionnaire),
                            sleepAssessment: this.generateSleepAssessmentCsv(questionnaire),
                            physiotherapy: this.generatePhysiotherapyCsv(questionnaire),
                        };
                        return [4 /*yield*/, this.pdfReportRepository
                                .createQueryBuilder('report')
                                .where('report.questionnaire_id = :questionnaireId', { questionnaireId: questionnaireId })
                                .getMany()];
                    case 2:
                        pdfReportsWithData = _c.sent();
                        exportPresignedTtlSeconds = 4 * 60 * 60;
                        if (!(options === null || options === void 0 ? void 0 : options.skipPresignedUrls)) return [3 /*break*/, 3];
                        _a = pdfReportsWithData.map(function (report) { return ({
                            id: report.id,
                            report_type: report.report_type,
                            file_name: report.file_name,
                            file_size_bytes: report.file_size_bytes,
                            mime_type: report.mime_type,
                            uploaded_at: report.uploaded_at,
                            notes: report.notes,
                            file_path: report.file_path,
                            file_sync_pending: report.file_sync_pending,
                            download_path: "/api/pdf-reports/".concat(report.id),
                            presigned_download_url: null,
                        }); });
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, Promise.all(pdfReportsWithData.map(function (report) { return __awaiter(_this, void 0, void 0, function () {
                            var presigned_download_url;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        presigned_download_url = null;
                                        if (!report.file_path) return [3 /*break*/, 2];
                                        return [4 /*yield*/, this.pdfReportsService.getPresignedDownloadUrl(report.file_path, exportPresignedTtlSeconds)];
                                    case 1:
                                        presigned_download_url =
                                            _a.sent();
                                        _a.label = 2;
                                    case 2: return [2 /*return*/, {
                                            id: report.id,
                                            report_type: report.report_type,
                                            file_name: report.file_name,
                                            file_size_bytes: report.file_size_bytes,
                                            mime_type: report.mime_type,
                                            uploaded_at: report.uploaded_at,
                                            notes: report.notes,
                                            file_path: report.file_path,
                                            file_sync_pending: report.file_sync_pending,
                                            download_path: "/api/pdf-reports/".concat(report.id),
                                            presigned_download_url: presigned_download_url,
                                        }];
                                }
                            });
                        }); }))];
                    case 4:
                        _a = _c.sent();
                        _c.label = 5;
                    case 5:
                        pdfReports = _a;
                        return [4 /*yield*/, this.questionnairesRepository.findOne({
                                where: { id: questionnaireId },
                                relations: ['patient'],
                            })];
                    case 6:
                        questionnaireEntity = _c.sent();
                        patientCpfHash = ((_b = questionnaireEntity === null || questionnaireEntity === void 0 ? void 0 : questionnaireEntity.patient) === null || _b === void 0 ? void 0 : _b.cpf_hash) || null;
                        // Attach patient so callers can access public_identifier and cpf_hash via questionnaire.patient
                        if (questionnaireEntity === null || questionnaireEntity === void 0 ? void 0 : questionnaireEntity.patient) {
                            questionnaire.patient = questionnaireEntity.patient;
                        }
                        binaryCollectionsQuery = this.binaryCollectionRepository
                            .createQueryBuilder('bc')
                            .leftJoinAndSelect('bc.active_task', 'active_task')
                            .where('bc.deleted_pending = :deletedPending', { deletedPending: false })
                            .andWhere('length(bc.csv_data) > 0');
                        if (patientCpfHash) {
                            binaryCollectionsQuery.andWhere(new typeorm_2.Brackets(function (qb) {
                                qb.where('bc.questionnaire_id = :questionnaireId', { questionnaireId: questionnaireId }).orWhere('bc.patient_cpf_hash = :patientCpfHash', { patientCpfHash: patientCpfHash });
                            }));
                        }
                        else {
                            binaryCollectionsQuery.andWhere('bc.questionnaire_id = :questionnaireId', {
                                questionnaireId: questionnaireId,
                            });
                        }
                        return [4 /*yield*/, binaryCollectionsQuery
                                .orderBy('bc.collected_at', 'ASC')
                                .getMany()];
                    case 7:
                        binaryCollections = _c.sent();
                        binaryCollectionsWithData = binaryCollections.map(function (collection) {
                            var metadata = collection.metadata || {};
                            var mimeType = metadata.file_format ||
                                metadata.mime_type ||
                                'application/octet-stream';
                            return {
                                id: collection.id,
                                patient_cpf_hash: collection.patient_cpf_hash,
                                repetitions_count: collection.repetitions_count,
                                task_id: collection.task_id,
                                file_size_bytes: collection.file_size_bytes,
                                file_checksum: collection.file_checksum,
                                collection_type: collection.collection_type,
                                device_type: collection.device_type,
                                device_serial: collection.device_serial,
                                sampling_rate_hz: collection.sampling_rate_hz,
                                collected_at: collection.collected_at,
                                uploaded_at: collection.uploaded_at,
                                metadata: collection.metadata,
                                processing_status: collection.processing_status,
                                processing_error: collection.processing_error,
                                active_task: collection.active_task,
                                mime_type: mimeType,
                                file_sync_pending: collection.file_sync_pending,
                                deleted_pending: collection.deleted_pending,
                                downloadable: true,
                                download_path: "/api/binary-collections/".concat(collection.id, "/download"),
                            };
                        });
                        return [2 /*return*/, {
                                questionnaire: questionnaire,
                                csvFiles: csvFiles,
                                pdfReports: pdfReports,
                                binaryCollections: binaryCollectionsWithData,
                            }];
                }
            });
        });
    };
    /**
     * Export all data for a patient (all questionnaires + binary collections)
     */
    QuestionnairesService.prototype.exportPatientData = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaires, exportData;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.questionnairesRepository.find({
                            where: { patient_id: patientId },
                            order: { created_at: 'DESC' },
                        })];
                    case 1:
                        questionnaires = _a.sent();
                        return [4 /*yield*/, Promise.all(questionnaires.map(function (q) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.exportQuestionnaireData(q.id)];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); }))];
                    case 2:
                        exportData = _a.sent();
                        return [2 /*return*/, exportData];
                }
            });
        });
    };
    QuestionnairesService.prototype.applyExportFiltersToQuestionnaireQuery = function (qb, filters) {
        qb.andWhere('(patient.public_identifier IS NULL OR UPPER(TRIM(patient.public_identifier)) NOT IN (:...exportExcludedPids))', { exportExcludedPids: QuestionnairesService_1.EXPORT_EXCLUDED_PUBLIC_IDS });
        var toPatientNum = function (v) {
            if (!(v === null || v === void 0 ? void 0 : v.trim()))
                return null;
            var m = /^P?(\d{1,3})$/i.exec(v.trim());
            return m ? parseInt(m[1], 10) : null;
        };
        var startNum = toPatientNum(filters === null || filters === void 0 ? void 0 : filters.patientStart);
        var endNum = toPatientNum(filters === null || filters === void 0 ? void 0 : filters.patientEnd);
        if (startNum != null && endNum != null) {
            qb.andWhere("CAST(NULLIF(REGEXP_REPLACE(COALESCE(patient.public_identifier, ''), '[^0-9]', '', 'g'), '') AS integer) BETWEEN :startNum AND :endNum", { startNum: startNum, endNum: endNum });
        }
        else if (startNum != null) {
            qb.andWhere("CAST(NULLIF(REGEXP_REPLACE(COALESCE(patient.public_identifier, ''), '[^0-9]', '', 'g'), '') AS integer) >= :startNum", { startNum: startNum });
        }
        else if (endNum != null) {
            qb.andWhere("CAST(NULLIF(REGEXP_REPLACE(COALESCE(patient.public_identifier, ''), '[^0-9]', '', 'g'), '') AS integer) <= :endNum", { endNum: endNum });
        }
        if (filters === null || filters === void 0 ? void 0 : filters.dateStart) {
            qb.andWhere('DATE(q.created_at) >= :dateStart', {
                dateStart: filters.dateStart,
            });
        }
        if (filters === null || filters === void 0 ? void 0 : filters.dateEnd) {
            qb.andWhere('DATE(q.created_at) <= :dateEnd', {
                dateEnd: filters.dateEnd,
            });
        }
        // Baixar todos: restringe a pacientes que já têm dados do protocolo selecionado
        if (filters === null || filters === void 0 ? void 0 : filters.onlyPatientsWithTaskData) {
            var requireSleep = filters.requireSleepTa13 === true;
            var requireClinic = filters.requireAnyClinicalTask === true;
            var requireFreeLiving = filters.requireFreeLiving === true;
            var hasBinarySql = function (taskPredicate, alias, join) {
                if (join === void 0) { join = 'inner'; }
                return "\n        EXISTS (\n          SELECT 1\n          FROM binary_collections ".concat(alias, "\n          ").concat(join === 'left' ? 'LEFT' : 'INNER', " JOIN active_task_definitions ").concat(alias, "_at\n            ON ").concat(alias, "_at.id = ").concat(alias, ".task_id\n          WHERE (\n            ").concat(alias, ".questionnaire_id = q.id\n            OR (\n              patient.cpf_hash IS NOT NULL\n              AND ").concat(alias, ".patient_cpf_hash = patient.cpf_hash\n            )\n          )\n          AND ").concat(taskPredicate, "\n        )\n      ");
            };
            var hasDiarySql = "\n        EXISTS (\n          SELECT 1\n          FROM freeliving_diaries fld\n          WHERE fld.patient_id = patient.id\n        )\n      ";
            var clauses = [];
            if (requireSleep) {
                clauses.push(hasBinarySql("UPPER(TRIM(bc_sleep_at.task_code)) = 'TA13'", 'bc_sleep'));
            }
            var freeLivingSqlList = ufam_prime_dataset_utils_1.FREE_LIVING_EXPORT_TASK_CODES.map(function (code) { return "'".concat(code, "'"); }).join(', ');
            if (requireClinic) {
                clauses.push(hasBinarySql("UPPER(TRIM(bc_clinic_at.task_code)) NOT IN ('TA13', ".concat(freeLivingSqlList, ")"), 'bc_clinic'));
            }
            if (requireFreeLiving) {
                clauses.push("(".concat(hasBinarySql("UPPER(TRIM(COALESCE(bc_fl_at.task_code, bc_fl.metadata->>'task_code', ''))) IN (".concat(freeLivingSqlList, ")"), 'bc_fl', 'left'), " OR ").concat(hasDiarySql, ")"));
            }
            if (clauses.length === 1) {
                qb.andWhere(clauses[0]);
            }
            else if (clauses.length > 1) {
                qb.andWhere("(".concat(clauses.join(' OR '), ")"));
            }
        }
    };
    /** IDs para export em massa (ZIP) — evita carregar todos os pacientes na memória de uma vez. */
    QuestionnairesService.prototype.listQuestionnaireIdsForExport = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var qb, rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        qb = this.questionnairesRepository
                            .createQueryBuilder('q')
                            .leftJoin('q.patient', 'patient')
                            .select('q.id', 'id')
                            .orderBy('q.created_at', 'DESC');
                        this.applyExportFiltersToQuestionnaireQuery(qb, filters);
                        return [4 /*yield*/, qb.getRawMany()];
                    case 1:
                        rows = _a.sent();
                        return [2 /*return*/, rows.map(function (row) { return row.id; })];
                }
            });
        });
    };
    QuestionnairesService.prototype.exportAllQuestionnairesData = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaireIds, exportData;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.listQuestionnaireIdsForExport(filters)];
                    case 1:
                        questionnaireIds = _a.sent();
                        return [4 /*yield*/, Promise.all(questionnaireIds.map(function (id) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.exportQuestionnaireData(id)];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); }))];
                    case 2:
                        exportData = _a.sent();
                        return [2 /*return*/, exportData];
                }
            });
        });
    };
    /**
     * Get questionnaire statistics for all time
     * Returns count of questionnaires grouped by creation date (day)
     */
    QuestionnairesService.prototype.getQuestionnaireStatisticsLast30Days = function () {
        return __awaiter(this, void 0, void 0, function () {
            var excludedPids, questionnaires;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        excludedPids = ['P000', 'P00'];
                        return [4 /*yield*/, this.questionnairesRepository
                                .createQueryBuilder('q')
                                .leftJoin('q.patient', 'patient')
                                .select([
                                "TO_CHAR(DATE_TRUNC('day', q.created_at AT TIME ZONE 'America/Sao_Paulo'), 'YYYY-MM-DD') as date",
                                'COUNT(*)::int as count',
                            ])
                                .where('(patient.public_identifier IS NULL OR UPPER(TRIM(patient.public_identifier)) NOT IN (:...excludedPids))', { excludedPids: excludedPids })
                                .groupBy("DATE_TRUNC('day', q.created_at AT TIME ZONE 'America/Sao_Paulo')")
                                .orderBy("DATE_TRUNC('day', q.created_at AT TIME ZONE 'America/Sao_Paulo')", 'ASC')
                                .getRawMany()];
                    case 1:
                        questionnaires = _a.sent();
                        return [2 /*return*/, questionnaires.map(function (q) { return ({
                                date: String(q.date || '').trim(),
                                count: parseInt(q.count) || 0,
                            }); })];
                }
            });
        });
    };
    /**
     * Get completed questionnaires statistics for all time
     * Returns count of completed questionnaires grouped by completion date (day)
     */
    QuestionnairesService.prototype.getCompletedQuestionnairesStatisticsLast30Days = function () {
        return __awaiter(this, void 0, void 0, function () {
            var excludedPids, questionnaires;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        excludedPids = ['P000', 'P00'];
                        return [4 /*yield*/, this.questionnairesRepository
                                .createQueryBuilder('q')
                                .leftJoin('q.patient', 'patient')
                                .select([
                                "TO_CHAR(DATE_TRUNC('day', q.completed_at AT TIME ZONE 'America/Sao_Paulo'), 'YYYY-MM-DD') as date",
                                'COUNT(*)::int as count',
                            ])
                                .where('q.completed_at IS NOT NULL')
                                .andWhere('(patient.public_identifier IS NULL OR UPPER(TRIM(patient.public_identifier)) NOT IN (:...excludedPids))', { excludedPids: excludedPids })
                                .groupBy("DATE_TRUNC('day', q.completed_at AT TIME ZONE 'America/Sao_Paulo')")
                                .orderBy("DATE_TRUNC('day', q.completed_at AT TIME ZONE 'America/Sao_Paulo')", 'ASC')
                                .getRawMany()];
                    case 1:
                        questionnaires = _a.sent();
                        return [2 /*return*/, questionnaires.map(function (q) { return ({
                                date: String(q.date || '').trim(),
                                count: parseInt(q.count) || 0,
                            }); })];
                }
            });
        });
    };
    /**
     * DEBUG: Get binary collections debug info for a questionnaire
     */
    QuestionnairesService.prototype.debugBinaryCollections = function (questionnaireId) {
        return __awaiter(this, void 0, void 0, function () {
            var questionnaire, patient, patientCpfHash, patientCpf, byCpfHash, _a, byQuestionnaireId, allCollections, alternativeHash, _b;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.questionnairesRepository.findOne({
                            where: { id: questionnaireId },
                            relations: ['patient'],
                        })];
                    case 1:
                        questionnaire = _e.sent();
                        if (!questionnaire) {
                            throw new common_1.NotFoundException("Questionnaire with ID ".concat(questionnaireId, " not found"));
                        }
                        patient = questionnaire.patient;
                        patientCpfHash = patient === null || patient === void 0 ? void 0 : patient.cpf_hash;
                        patientCpf = patient === null || patient === void 0 ? void 0 : patient.cpf;
                        if (!patientCpfHash) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.binaryCollectionRepository.find({
                                where: { patient_cpf_hash: patientCpfHash },
                                relations: ['active_task'],
                                order: { collected_at: 'DESC' },
                            })];
                    case 2:
                        _a = _e.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _a = [];
                        _e.label = 4;
                    case 4:
                        byCpfHash = _a;
                        return [4 /*yield*/, this.binaryCollectionRepository.find({
                                where: { questionnaire_id: questionnaireId },
                                relations: ['active_task'],
                                order: { collected_at: 'DESC' },
                            })];
                    case 5:
                        byQuestionnaireId = _e.sent();
                        return [4 /*yield*/, this.binaryCollectionRepository
                                .createQueryBuilder('bc')
                                .leftJoinAndSelect('bc.active_task', 'active_task')
                                .orderBy('bc.collected_at', 'DESC')
                                .limit(100)
                                .getMany()];
                    case 6:
                        allCollections = _e.sent();
                        alternativeHash = null;
                        if (patientCpf) {
                            try {
                                alternativeHash = crypto_util_1.CryptoUtil.hashCpf(patientCpf);
                            }
                            catch (e) {
                                // Ignorar erro
                            }
                        }
                        _c = {
                            questionnaire: {
                                id: questionnaire.id,
                                patient_id: questionnaire.patient_id,
                            },
                            patient: {
                                id: patient === null || patient === void 0 ? void 0 : patient.id,
                                cpf: patientCpf ? patientCpf.replace(/\d(?=\d{4})/g, '*') : null, // Mascarado
                                cpf_hash: patientCpfHash
                                    ? patientCpfHash.substring(0, 16) + '...'
                                    : null,
                                alternative_hash: alternativeHash
                                    ? alternativeHash.substring(0, 16) + '...'
                                    : null,
                                hash_match: patientCpfHash === alternativeHash,
                            },
                            binaryCollections: {
                                byCpfHash: {
                                    count: byCpfHash.length,
                                    hashes: Array.from(new Set(byCpfHash.map(function (bc) { var _a; return ((_a = bc.patient_cpf_hash) === null || _a === void 0 ? void 0 : _a.substring(0, 16)) + '...'; }))),
                                    collections: byCpfHash.slice(0, 5).map(function (bc) {
                                        var _a, _b;
                                        return ({
                                            id: bc.id,
                                            patient_cpf_hash: ((_a = bc.patient_cpf_hash) === null || _a === void 0 ? void 0 : _a.substring(0, 16)) + '...',
                                            questionnaire_id: bc.questionnaire_id,
                                            task_id: bc.task_id,
                                            task_code: (_b = bc.active_task) === null || _b === void 0 ? void 0 : _b.task_code,
                                            collected_at: bc.collected_at,
                                        });
                                    }),
                                },
                                byQuestionnaireId: {
                                    count: byQuestionnaireId.length,
                                    collections: byQuestionnaireId.slice(0, 5).map(function (bc) {
                                        var _a, _b;
                                        return ({
                                            id: bc.id,
                                            patient_cpf_hash: ((_a = bc.patient_cpf_hash) === null || _a === void 0 ? void 0 : _a.substring(0, 16)) + '...',
                                            questionnaire_id: bc.questionnaire_id,
                                            task_id: bc.task_id,
                                            task_code: (_b = bc.active_task) === null || _b === void 0 ? void 0 : _b.task_code,
                                            collected_at: bc.collected_at,
                                        });
                                    }),
                                },
                                allInDatabase: {
                                    total: allCollections.length,
                                    uniqueHashes: Array.from(new Set(allCollections.map(function (bc) { var _a; return ((_a = bc.patient_cpf_hash) === null || _a === void 0 ? void 0 : _a.substring(0, 16)) + '...'; }))).slice(0, 10),
                                },
                            }
                        };
                        _d = {
                            patientHash: patientCpfHash
                                ? patientCpfHash.substring(0, 16) + '...'
                                : null,
                            alternativeHash: alternativeHash
                                ? alternativeHash.substring(0, 16) + '...'
                                : null,
                            foundByPatientHash: byCpfHash.length,
                            foundByQuestionnaireId: byQuestionnaireId.length
                        };
                        if (!alternativeHash) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.binaryCollectionRepository.count({
                                where: { patient_cpf_hash: alternativeHash },
                            })];
                    case 7:
                        _b = _e.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        _b = 0;
                        _e.label = 9;
                    case 9: return [2 /*return*/, (_c.comparison = (_d.foundByAlternativeHash = _b,
                            _d),
                            _c)];
                }
            });
        });
    };
    /**
     * Update medications reference table with new standard drugs
     * Creates new medications and optionally deactivates old ones
     */
    QuestionnairesService.prototype.updateMedicationsReference = function () {
        return __awaiter(this, void 0, void 0, function () {
            var NEW_STANDARD_DRUGS, results, _i, NEW_STANDARD_DRUGS_1, drug, medication, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        NEW_STANDARD_DRUGS = [
                            { name: 'Levodopa / Carbidopa', factor: 1, class: 'Levodopa' },
                            { name: 'Levodopa / Benserazida BD', factor: 1, class: 'Levodopa' },
                            { name: 'Levodopa / Benserazida', factor: 1, class: 'Levodopa' },
                            { name: 'Levodopa / Benserazida HBS', factor: 0.75, class: 'Levodopa' },
                            { name: 'Levodopa / Benserazida DR', factor: 0.75, class: 'Levodopa' },
                            {
                                name: 'Levodopa / Carbidopa / Entacapona',
                                factor: 1,
                                class: 'Levodopa',
                            },
                            { name: 'Entacapone', factor: 1, class: 'COMT Inhibitor' },
                            { name: 'Rasagilina', factor: 1, class: 'MAO-B Inhibitor' },
                            { name: 'Safinamida', factor: 1, class: 'MAO-B Inhibitor' },
                            { name: 'Amantadina', factor: 1, class: 'NMDA Antagonist' },
                            { name: 'Pramipexol', factor: 1, class: 'Dopamine Agonist' },
                        ];
                        results = {
                            created: [],
                            updated: [],
                            errors: [],
                        };
                        _i = 0, NEW_STANDARD_DRUGS_1 = NEW_STANDARD_DRUGS;
                        _a.label = 1;
                    case 1:
                        if (!(_i < NEW_STANDARD_DRUGS_1.length)) return [3 /*break*/, 10];
                        drug = NEW_STANDARD_DRUGS_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 8, , 9]);
                        return [4 /*yield*/, this.medicationReferenceRepository.findOne({
                                where: { drug_name: drug.name },
                            })];
                    case 3:
                        medication = _a.sent();
                        if (!medication) return [3 /*break*/, 5];
                        // Atualizar se já existe
                        medication.led_conversion_factor = drug.factor;
                        medication.active = true;
                        medication.medication_class = drug.class;
                        return [4 /*yield*/, this.medicationReferenceRepository.save(medication)];
                    case 4:
                        _a.sent();
                        results.updated.push(drug.name);
                        return [3 /*break*/, 7];
                    case 5:
                        // Criar novo
                        medication = this.medicationReferenceRepository.create({
                            drug_name: drug.name,
                            led_conversion_factor: drug.factor,
                            active: true,
                            medication_class: drug.class,
                        });
                        return [4 /*yield*/, this.medicationReferenceRepository.save(medication)];
                    case 6:
                        _a.sent();
                        results.created.push(drug.name);
                        _a.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_5 = _a.sent();
                        console.error("Error processing medication ".concat(drug.name, ":"), error_5);
                        results.errors.push("".concat(drug.name, ": ").concat(error_5.message));
                        return [3 /*break*/, 9];
                    case 9:
                        _i++;
                        return [3 /*break*/, 1];
                    case 10: return [2 /*return*/, {
                            message: 'Medications reference updated successfully',
                            results: results,
                            totalProcessed: NEW_STANDARD_DRUGS.length,
                            success: results.errors.length === 0,
                        }];
                }
            });
        });
    };
    var QuestionnairesService_1;
    /**
     * Export all questionnaires with all related data
     */
    QuestionnairesService.EXPORT_EXCLUDED_PUBLIC_IDS = ['P000', 'P00'];
    QuestionnairesService = QuestionnairesService_1 = __decorate([
        (0, common_1.Injectable)(),
        __param(0, (0, typeorm_1.InjectRepository)(questionnaire_entity_1.Questionnaire)),
        __param(1, (0, typeorm_1.InjectRepository)(anthropometric_data_entity_1.AnthropometricData)),
        __param(2, (0, typeorm_1.InjectRepository)(clinical_assessment_entity_1.ClinicalAssessment)),
        __param(3, (0, typeorm_1.InjectRepository)(gender_type_entity_1.GenderType)),
        __param(4, (0, typeorm_1.InjectRepository)(ethnicity_type_entity_1.EthnicityType)),
        __param(5, (0, typeorm_1.InjectRepository)(education_level_entity_1.EducationLevel)),
        __param(6, (0, typeorm_1.InjectRepository)(marital_status_type_entity_1.MaritalStatusType)),
        __param(7, (0, typeorm_1.InjectRepository)(income_range_entity_1.IncomeRange)),
        __param(8, (0, typeorm_1.InjectRepository)(patient_medication_entity_1.PatientMedication)),
        __param(9, (0, typeorm_1.InjectRepository)(medication_reference_entity_1.MedicationReference)),
        __param(10, (0, typeorm_1.InjectRepository)(parkinson_phenotype_entity_1.ParkinsonPhenotype)),
        __param(11, (0, typeorm_1.InjectRepository)(dyskinesia_type_entity_1.DyskinesiaType)),
        __param(12, (0, typeorm_1.InjectRepository)(hoehn_yahr_scale_entity_1.HoehnYahrScale)),
        __param(13, (0, typeorm_1.InjectRepository)(surgery_type_entity_1.SurgeryType)),
        __param(14, (0, typeorm_1.InjectRepository)(updrs3_score_entity_1.Updrs3Score)),
        __param(15, (0, typeorm_1.InjectRepository)(meem_score_entity_1.MeemScore)),
        __param(16, (0, typeorm_1.InjectRepository)(udysrs_score_entity_1.UdysrsScore)),
        __param(17, (0, typeorm_1.InjectRepository)(stopbang_score_entity_1.StopbangScore)),
        __param(18, (0, typeorm_1.InjectRepository)(epworth_score_entity_1.EpworthScore)),
        __param(19, (0, typeorm_1.InjectRepository)(pdss2_score_entity_1.Pdss2Score)),
        __param(20, (0, typeorm_1.InjectRepository)(rbdsq_score_entity_1.RbdsqScore)),
        __param(21, (0, typeorm_1.InjectRepository)(rbdsq_br_score_entity_1.RbdsqBrScore)),
        __param(22, (0, typeorm_1.InjectRepository)(fogq_score_entity_1.FogqScore)),
        __param(23, (0, typeorm_1.InjectRepository)(binary_collection_entity_1.BinaryCollection)),
        __param(24, (0, typeorm_1.InjectRepository)(pdf_report_entity_1.PdfReport)),
        __param(25, (0, typeorm_1.InjectRepository)(active_task_definition_entity_1.ActiveTaskDefinition)),
        __metadata("design:paramtypes", [typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            typeorm_2.Repository,
            patients_service_1.PatientsService,
            pdf_reports_service_1.PdfReportsService])
    ], QuestionnairesService);
    return QuestionnairesService;
}());
exports.QuestionnairesService = QuestionnairesService;
