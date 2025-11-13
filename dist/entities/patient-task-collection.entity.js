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
exports.PatientTaskCollection = void 0;
const typeorm_1 = require("typeorm");
const questionnaire_entity_1 = require("./questionnaire.entity");
const active_task_definition_entity_1 = require("./active-task-definition.entity");
let PatientTaskCollection = class PatientTaskCollection {
};
exports.PatientTaskCollection = PatientTaskCollection;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PatientTaskCollection.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], PatientTaskCollection.prototype, "questionnaire_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], PatientTaskCollection.prototype, "task_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PatientTaskCollection.prototype, "completion_percentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], PatientTaskCollection.prototype, "completed_items", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PatientTaskCollection.prototype, "collected_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PatientTaskCollection.prototype, "collector_notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], PatientTaskCollection.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => questionnaire_entity_1.Questionnaire, (q) => q.task_collections, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'questionnaire_id' }),
    __metadata("design:type", questionnaire_entity_1.Questionnaire)
], PatientTaskCollection.prototype, "questionnaire", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => active_task_definition_entity_1.ActiveTaskDefinition, (t) => t.patient_tasks),
    (0, typeorm_1.JoinColumn)({ name: 'task_id' }),
    __metadata("design:type", active_task_definition_entity_1.ActiveTaskDefinition)
], PatientTaskCollection.prototype, "active_task", void 0);
exports.PatientTaskCollection = PatientTaskCollection = __decorate([
    (0, typeorm_1.Entity)('patient_task_collections')
], PatientTaskCollection);
//# sourceMappingURL=patient-task-collection.entity.js.map