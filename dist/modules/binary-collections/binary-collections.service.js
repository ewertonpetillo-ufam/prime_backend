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
exports.BinaryCollectionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const binary_collection_entity_1 = require("../../entities/binary-collection.entity");
const patient_entity_1 = require("../../entities/patient.entity");
const active_task_definition_entity_1 = require("../../entities/active-task-definition.entity");
const crypto_util_1 = require("../../utils/crypto.util");
let BinaryCollectionsService = class BinaryCollectionsService {
    constructor(binaryCollectionsRepository, patientsRepository, activeTaskRepository) {
        this.binaryCollectionsRepository = binaryCollectionsRepository;
        this.patientsRepository = patientsRepository;
        this.activeTaskRepository = activeTaskRepository;
    }
    async uploadCsv(patient_cpf, task_code, file) {
        if (!crypto_util_1.CryptoUtil.isValidCpfFormat(patient_cpf)) {
            throw new common_1.BadRequestException('Invalid CPF format');
        }
        const cpf_hash = crypto_util_1.CryptoUtil.hashCpf(patient_cpf);
        const patient = await this.patientsRepository.findOne({
            where: { cpf_hash },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient with this CPF not found');
        }
        const activeTask = await this.activeTaskRepository.findOne({
            where: { task_code },
        });
        if (!activeTask) {
            throw new common_1.NotFoundException(`Task with code ${task_code} not found`);
        }
        if (!file || !file.buffer) {
            throw new common_1.BadRequestException('File is required');
        }
        const binaryCollection = this.binaryCollectionsRepository.create({
            patient_cpf_hash: cpf_hash,
            task_id: activeTask.id,
            csv_data: file.buffer,
            file_size_bytes: file.size,
            repetitions_count: 1,
            collection_type: activeTask.task_category ? activeTask.task_category : null,
            collected_at: new Date(),
            uploaded_at: new Date(),
            processing_status: binary_collection_entity_1.ProcessingStatus.PENDING,
            metadata: {
                uploaded_at: new Date().toISOString(),
                patient_id: patient.id,
                task_code: task_code,
                file_name: file.originalname,
                file_format: file.mimetype,
            },
        });
        const saved = await this.binaryCollectionsRepository.save(binaryCollection);
        const { csv_data, ...response } = saved;
        return response;
    }
    async findAll() {
        return this.binaryCollectionsRepository.find({
            select: [
                'id',
                'questionnaire_id',
                'patient_cpf_hash',
                'task_id',
                'repetitions_count',
                'file_size_bytes',
                'file_checksum',
                'collection_type',
                'device_type',
                'device_serial',
                'sampling_rate_hz',
                'processing_status',
                'collected_at',
                'uploaded_at',
            ],
            order: { collected_at: 'DESC' },
        });
    }
    async findOne(id) {
        const collection = await this.binaryCollectionsRepository.findOne({
            where: { id },
        });
        if (!collection) {
            throw new common_1.NotFoundException(`Binary collection with ID ${id} not found`);
        }
        return collection;
    }
    async findByCpf(patient_cpf) {
        if (!crypto_util_1.CryptoUtil.isValidCpfFormat(patient_cpf)) {
            throw new common_1.BadRequestException('Invalid CPF format');
        }
        const cpf_hash = crypto_util_1.CryptoUtil.hashCpf(patient_cpf);
        const collections = await this.binaryCollectionsRepository.find({
            where: { patient_cpf_hash: cpf_hash },
            select: [
                'id',
                'questionnaire_id',
                'patient_cpf_hash',
                'task_id',
                'repetitions_count',
                'file_size_bytes',
                'file_checksum',
                'collection_type',
                'device_type',
                'device_serial',
                'sampling_rate_hz',
                'processing_status',
                'collected_at',
                'uploaded_at',
                'metadata',
                'processing_error',
            ],
            order: { collected_at: 'DESC' },
        });
        return collections;
    }
    async remove(id) {
        const collection = await this.findOne(id);
        await this.binaryCollectionsRepository.remove(collection);
    }
    async downloadCsv(id) {
        const collection = await this.binaryCollectionsRepository.findOne({
            where: { id },
            select: ['id', 'csv_data', 'metadata'],
        });
        if (!collection) {
            throw new common_1.NotFoundException(`Binary collection with ID ${id} not found`);
        }
        if (!collection.csv_data) {
            throw new common_1.NotFoundException(`CSV data not found for binary collection ${id}`);
        }
        const filename = collection.metadata?.file_name ||
            `binary-collection-${id}.csv`;
        return {
            buffer: collection.csv_data,
            filename,
        };
    }
};
exports.BinaryCollectionsService = BinaryCollectionsService;
exports.BinaryCollectionsService = BinaryCollectionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(binary_collection_entity_1.BinaryCollection)),
    __param(1, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __param(2, (0, typeorm_1.InjectRepository)(active_task_definition_entity_1.ActiveTaskDefinition)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BinaryCollectionsService);
//# sourceMappingURL=binary-collections.service.js.map