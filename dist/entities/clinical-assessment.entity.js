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
exports.ClinicalAssessment = void 0;
const typeorm_1 = require("typeorm");
const questionnaire_entity_1 = require("./questionnaire.entity");
let ClinicalAssessment = class ClinicalAssessment {
};
exports.ClinicalAssessment = ClinicalAssessment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ClinicalAssessment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', unique: true }),
    __metadata("design:type", String)
], ClinicalAssessment.prototype, "questionnaire_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ClinicalAssessment.prototype, "diagnosis_year", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ClinicalAssessment.prototype, "phenotype_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ClinicalAssessment.prototype, "hoehn_yahr_stage_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', nullable: true }),
    __metadata("design:type", Boolean)
], ClinicalAssessment.prototype, "motor_fluctuations", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', nullable: true }),
    __metadata("design:type", Boolean)
], ClinicalAssessment.prototype, "wearing_off", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', nullable: true }),
    __metadata("design:type", Boolean)
], ClinicalAssessment.prototype, "dyskinesia", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ClinicalAssessment.prototype, "dyskinesia_type_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', nullable: true }),
    __metadata("design:type", Boolean)
], ClinicalAssessment.prototype, "previous_surgery", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ClinicalAssessment.prototype, "surgery_type_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ClinicalAssessment.prototype, "surgery_year", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ClinicalAssessment.prototype, "comorbidities", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ClinicalAssessment.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], ClinicalAssessment.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], ClinicalAssessment.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => questionnaire_entity_1.Questionnaire, (q) => q.clinical_assessment, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'questionnaire_id' }),
    __metadata("design:type", questionnaire_entity_1.Questionnaire)
], ClinicalAssessment.prototype, "questionnaire", void 0);
exports.ClinicalAssessment = ClinicalAssessment = __decorate([
    (0, typeorm_1.Entity)('clinical_assessments')
], ClinicalAssessment);
//# sourceMappingURL=clinical-assessment.entity.js.map