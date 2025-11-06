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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const patients_service_1 = require("./patients.service");
const create_patient_dto_1 = require("./dto/create-patient.dto");
const update_patient_dto_1 = require("./dto/update-patient.dto");
let PatientsController = class PatientsController {
    constructor(patientsService) {
        this.patientsService = patientsService;
    }
    create(createPatientDto) {
        return this.patientsService.create(createPatientDto);
    }
    findAll() {
        return this.patientsService.findAll();
    }
    findByCpf(cpf) {
        return this.patientsService.findByCpf(cpf);
    }
    findOne(id) {
        return this.patientsService.findOne(id);
    }
    update(id, updatePatientDto) {
        return this.patientsService.update(id, updatePatientDto);
    }
    remove(id) {
        return this.patientsService.remove(id);
    }
};
exports.PatientsController = PatientsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new patient',
        description: 'Creates a new patient. The CPF will be anonymized using HMAC-SHA256 before storing.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Patient created successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid CPF format',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Patient with this CPF already registered',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_patient_dto_1.CreatePatientDto]),
    __metadata("design:returntype", void 0)
], PatientsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all patients' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of all patients',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PatientsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-cpf'),
    (0, swagger_1.ApiOperation)({
        summary: 'Find patient by CPF',
        description: 'Searches for a patient using CPF. The CPF will be hashed before searching.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'cpf',
        description: 'CPF (11 digits)',
        example: '12345678900',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Patient found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid CPF format',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Patient not found',
    }),
    __param(0, (0, common_1.Query)('cpf')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PatientsController.prototype, "findByCpf", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get patient by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Patient UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Patient found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Patient not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PatientsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update patient',
        description: 'Updates patient data. CPF cannot be changed.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Patient UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Patient updated successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Patient not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_patient_dto_1.UpdatePatientDto]),
    __metadata("design:returntype", void 0)
], PatientsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete patient' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Patient UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 204,
        description: 'Patient deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Patient not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PatientsController.prototype, "remove", null);
exports.PatientsController = PatientsController = __decorate([
    (0, swagger_1.ApiTags)('Patients'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('patients'),
    __metadata("design:paramtypes", [patients_service_1.PatientsService])
], PatientsController);
//# sourceMappingURL=patients.controller.js.map