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
exports.BinaryCollectionsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const binary_collections_service_1 = require("./binary-collections.service");
let BinaryCollectionsController = class BinaryCollectionsController {
    constructor(binaryCollectionsService) {
        this.binaryCollectionsService = binaryCollectionsService;
    }
    async uploadCsv(file, patient_cpf, task_code) {
        if (!file) {
            throw new common_1.BadRequestException('File is required');
        }
        if (!task_code) {
            throw new common_1.BadRequestException('task_code is required');
        }
        return this.binaryCollectionsService.uploadCsv(patient_cpf, task_code, file);
    }
    findAll() {
        return this.binaryCollectionsService.findAll();
    }
    findByCpf(cpf) {
        return this.binaryCollectionsService.findByCpf(cpf);
    }
    findOne(id) {
        return this.binaryCollectionsService.findOne(id);
    }
    remove(id) {
        return this.binaryCollectionsService.remove(id);
    }
};
exports.BinaryCollectionsController = BinaryCollectionsController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload CSV file from collection app',
        description: 'Receives CPF (plain text), task code (e.g., TA1), and CSV file. ' +
            'The CPF will be hashed with HMAC to find the patient, then the binary file will be stored.',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['patient_cpf', 'task_code', 'file'],
            properties: {
                patient_cpf: {
                    type: 'string',
                    description: 'CPF of the patient (11 digits)',
                    example: '12345678900',
                },
                task_code: {
                    type: 'string',
                    description: 'Task code (e.g., TA1, TA2, TA3)',
                    example: 'TA1',
                },
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'CSV file',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'File uploaded successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid CPF format or missing file',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Patient or task not found',
    }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('patient_cpf')),
    __param(2, (0, common_1.Body)('task_code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], BinaryCollectionsController.prototype, "uploadCsv", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all binary collections',
        description: 'Returns list of all binary collections (without binary data)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of binary collections',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BinaryCollectionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-cpf/:cpf'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get binary collections by patient CPF',
        description: 'Returns all binary collections for a patient identified by CPF. ' +
            'The CPF will be hashed with HMAC-SHA256 to find the patient\'s collections. ' +
            'Returns an array of binary collections without the csv_data field to reduce payload size.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'cpf',
        description: 'Patient CPF (11 digits, plain text)',
        example: '12345678900',
        type: String,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of binary collections for the patient (without csv_data)',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
                    patient_cpf_hash: { type: 'string', example: '540c70713031a70595de28f3c0c80100edb79e1733943274d82133d50ca3d7db' },
                    task_id: { type: 'number', example: 1 },
                    questionnaire_id: { type: 'string', format: 'uuid', nullable: true },
                    repetitions_count: { type: 'number', example: 1 },
                    file_size_bytes: { type: 'number', example: 1024 },
                    file_checksum: { type: 'string', nullable: true },
                    collection_type: { type: 'string', enum: ['MOTOR', 'GAIT', 'TREMOR', 'SPEECH', 'OTHER'], example: 'MOTOR' },
                    device_type: { type: 'string', nullable: true },
                    device_serial: { type: 'string', nullable: true },
                    sampling_rate_hz: { type: 'number', nullable: true },
                    processing_status: { type: 'string', enum: ['pending', 'processing', 'completed', 'error'], example: 'pending' },
                    collected_at: { type: 'string', format: 'date-time' },
                    uploaded_at: { type: 'string', format: 'date-time' },
                    metadata: { type: 'object' },
                    processing_error: { type: 'string', nullable: true },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid CPF format - CPF must contain exactly 11 digits',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'No collections found for this CPF (returns empty array)',
    }),
    __param(0, (0, common_1.Param)('cpf')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BinaryCollectionsController.prototype, "findByCpf", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get binary collection by ID',
        description: 'Returns binary collection including the binary data',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Binary collection UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Binary collection found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Binary collection not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BinaryCollectionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete binary collection' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Binary collection UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 204,
        description: 'Binary collection deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Binary collection not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BinaryCollectionsController.prototype, "remove", null);
exports.BinaryCollectionsController = BinaryCollectionsController = __decorate([
    (0, swagger_1.ApiTags)('Binary Collections'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('binary-collections'),
    __metadata("design:paramtypes", [binary_collections_service_1.BinaryCollectionsService])
], BinaryCollectionsController);
//# sourceMappingURL=binary-collections.controller.js.map