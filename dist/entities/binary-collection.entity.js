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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryCollection = exports.ProcessingStatus = exports.CollectionType = void 0;
const typeorm_1 = require("typeorm");
const questionnaire_entity_1 = require("./questionnaire.entity");
const active_task_definition_entity_1 = require("./active-task-definition.entity");
var CollectionType;
(function (CollectionType) {
    CollectionType["MOTOR"] = "MOTOR";
    CollectionType["GAIT"] = "GAIT";
    CollectionType["TREMOR"] = "TREMOR";
    CollectionType["SPEECH"] = "SPEECH";
    CollectionType["OTHER"] = "OTHER";
})(CollectionType || (exports.CollectionType = CollectionType = {}));
var ProcessingStatus;
(function (ProcessingStatus) {
    ProcessingStatus["PENDING"] = "pending";
    ProcessingStatus["PROCESSING"] = "processing";
    ProcessingStatus["COMPLETED"] = "completed";
    ProcessingStatus["ERROR"] = "error";
})(ProcessingStatus || (exports.ProcessingStatus = ProcessingStatus = {}));
let BinaryCollection = class BinaryCollection {
};
exports.BinaryCollection = BinaryCollection;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BinaryCollection.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128 }),
    __metadata("design:type", String)
], BinaryCollection.prototype, "patient_cpf_hash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], BinaryCollection.prototype, "repetitions_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], BinaryCollection.prototype, "task_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], BinaryCollection.prototype, "questionnaire_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bytea' }),
    __metadata("design:type", Buffer)
], BinaryCollection.prototype, "csv_data", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], BinaryCollection.prototype, "file_size_bytes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, nullable: true }),
    __metadata("design:type", String)
], BinaryCollection.prototype, "file_checksum", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", String)
], BinaryCollection.prototype, "collection_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], BinaryCollection.prototype, "device_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], BinaryCollection.prototype, "device_serial", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 8, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], BinaryCollection.prototype, "sampling_rate_hz", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], BinaryCollection.prototype, "collected_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], BinaryCollection.prototype, "uploaded_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: '{}' }),
    __metadata("design:type", Object)
], BinaryCollection.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        default: ProcessingStatus.PENDING,
    }),
    __metadata("design:type", String)
], BinaryCollection.prototype, "processing_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BinaryCollection.prototype, "processing_error", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], BinaryCollection.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => questionnaire_entity_1.Questionnaire, (questionnaire) => questionnaire.binary_collections, {
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'questionnaire_id' }),
    __metadata("design:type", questionnaire_entity_1.Questionnaire)
], BinaryCollection.prototype, "questionnaire", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => active_task_definition_entity_1.ActiveTaskDefinition),
    (0, typeorm_1.JoinColumn)({ name: 'task_id' }),
    __metadata("design:type", active_task_definition_entity_1.ActiveTaskDefinition)
], BinaryCollection.prototype, "active_task", void 0);
exports.BinaryCollection = BinaryCollection = __decorate([
    (0, typeorm_1.Entity)('binary_collections')
], BinaryCollection);
//# sourceMappingURL=binary-collection.entity.js.map