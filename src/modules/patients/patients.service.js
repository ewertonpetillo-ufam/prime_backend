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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientsService = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var typeorm_2 = require("typeorm");
var patient_entity_1 = require("../../entities/patient.entity");
var crypto_util_1 = require("../../utils/crypto.util");
var PatientsService = /** @class */ (function () {
    function PatientsService(patientsRepository) {
        this.patientsRepository = patientsRepository;
    }
    PatientsService.prototype.create = function (createPatientDto) {
        return __awaiter(this, void 0, void 0, function () {
            var cpf_hash, existing, cpf, patientData, patient;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Validate CPF format
                        if (!crypto_util_1.CryptoUtil.isValidCpfFormat(createPatientDto.cpf)) {
                            throw new common_1.BadRequestException('Invalid CPF format');
                        }
                        cpf_hash = crypto_util_1.CryptoUtil.hashCpf(createPatientDto.cpf);
                        return [4 /*yield*/, this.patientsRepository.findOne({
                                where: { cpf_hash: cpf_hash },
                            })];
                    case 1:
                        existing = _a.sent();
                        if (existing) {
                            throw new common_1.ConflictException('Patient with this CPF already registered');
                        }
                        cpf = createPatientDto.cpf, patientData = __rest(createPatientDto, ["cpf"]);
                        patient = this.patientsRepository.create(__assign(__assign({}, patientData), { cpf_hash: cpf_hash, cpf: cpf }));
                        return [2 /*return*/, this.patientsRepository.save(patient)];
                }
            });
        });
    };
    /**
     * Cria paciente no fluxo do questionário (Step 1).
     * public_identifier fica nulo; o trigger BEFORE INSERT atribui na mesma transação do INSERT.
     */
    PatientsService.prototype.createWithPublicIdentifier = function (createPatientDto) {
        return __awaiter(this, void 0, void 0, function () {
            var cpf_hash, existing, cpf, patientData, patient;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!crypto_util_1.CryptoUtil.isValidCpfFormat(createPatientDto.cpf)) {
                            throw new common_1.BadRequestException('Invalid CPF format');
                        }
                        cpf_hash = crypto_util_1.CryptoUtil.hashCpf(createPatientDto.cpf);
                        return [4 /*yield*/, this.patientsRepository.findOne({
                                where: { cpf_hash: cpf_hash },
                            })];
                    case 1:
                        existing = _a.sent();
                        if (existing) {
                            throw new common_1.ConflictException('Patient with this CPF already registered');
                        }
                        cpf = createPatientDto.cpf, patientData = __rest(createPatientDto, ["cpf"]);
                        patient = this.patientsRepository.create(__assign(__assign({}, patientData), { cpf_hash: cpf_hash, cpf: cpf }));
                        return [2 /*return*/, this.patientsRepository.save(patient)];
                }
            });
        });
    };
    /**
     * Garante public_identifier se ainda for nulo (idempotente; seguro com concorrência no UPDATE).
     */
    PatientsService.prototype.ensurePublicIdentifier = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findOne(patientId)];
                    case 1:
                        existing = _a.sent();
                        if (existing.public_identifier) {
                            return [2 /*return*/, existing];
                        }
                        return [4 /*yield*/, this.patientsRepository.query("UPDATE patients\n         SET public_identifier = generate_patient_identifier()\n         WHERE id = $1 AND public_identifier IS NULL\n         RETURNING public_identifier", [patientId])];
                    case 2:
                        rows = _a.sent();
                        if (rows.length > 0) {
                            return [2 /*return*/, this.findOne(patientId)];
                        }
                        return [2 /*return*/, this.findOne(patientId)];
                }
            });
        });
    };
    PatientsService.prototype.findAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.patientsRepository.find({
                        order: { full_name: 'ASC' },
                    })];
            });
        });
    };
    PatientsService.prototype.findOne = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var patient;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.patientsRepository.findOne({
                            where: { id: id },
                            // Don't load relations eagerly to improve performance
                            relations: [],
                        })];
                    case 1:
                        patient = _a.sent();
                        if (!patient) {
                            throw new common_1.NotFoundException("Patient with ID ".concat(id, " not found"));
                        }
                        return [2 /*return*/, patient];
                }
            });
        });
    };
    /**
     * Find patient by CPF (will hash the CPF before searching)
     */
    PatientsService.prototype.findByCpf = function (cpf) {
        return __awaiter(this, void 0, void 0, function () {
            var cpf_hash, patient;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!crypto_util_1.CryptoUtil.isValidCpfFormat(cpf)) {
                            throw new common_1.BadRequestException('Invalid CPF format');
                        }
                        cpf_hash = crypto_util_1.CryptoUtil.hashCpf(cpf);
                        return [4 /*yield*/, this.patientsRepository.findOne({
                                where: { cpf_hash: cpf_hash },
                            })];
                    case 1:
                        patient = _a.sent();
                        if (!patient) {
                            throw new common_1.NotFoundException('Patient with this CPF not found');
                        }
                        return [2 /*return*/, patient];
                }
            });
        });
    };
    PatientsService.prototype.update = function (id, updatePatientDto) {
        return __awaiter(this, void 0, void 0, function () {
            var updateData, currentCpf, updatedPatient;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateData = __assign({}, updatePatientDto);
                        if (!updateData.cpf) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.patientsRepository
                                .createQueryBuilder('patient')
                                .select('patient.cpf', 'cpf')
                                .where('patient.id = :id', { id: id })
                                .getRawOne()];
                    case 1:
                        currentCpf = _a.sent();
                        // Don't update CPF if it already exists
                        if (currentCpf === null || currentCpf === void 0 ? void 0 : currentCpf.cpf) {
                            delete updateData.cpf;
                        }
                        _a.label = 2;
                    case 2: 
                    // Use update() for better performance - avoids loading full entity and relations
                    return [4 /*yield*/, this.patientsRepository.update(id, updateData)];
                    case 3:
                        // Use update() for better performance - avoids loading full entity and relations
                        _a.sent();
                        return [4 /*yield*/, this.patientsRepository
                                .createQueryBuilder('patient')
                                .where('patient.id = :id', { id: id })
                                .getOne()];
                    case 4:
                        updatedPatient = _a.sent();
                        if (!updatedPatient) {
                            throw new common_1.NotFoundException("Patient with ID ".concat(id, " not found"));
                        }
                        return [2 /*return*/, updatedPatient];
                }
            });
        });
    };
    PatientsService.prototype.remove = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var patient;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findOne(id)];
                    case 1:
                        patient = _a.sent();
                        return [4 /*yield*/, this.patientsRepository.remove(patient)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PatientsService = __decorate([
        (0, common_1.Injectable)(),
        __param(0, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
        __metadata("design:paramtypes", [typeorm_2.Repository])
    ], PatientsService);
    return PatientsService;
}());
exports.PatientsService = PatientsService;
