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
exports.Questionnaire = void 0;
const typeorm_1 = require("typeorm");
const patient_entity_1 = require("./patient.entity");
const user_entity_1 = require("./user.entity");
const anthropometric_data_entity_1 = require("./anthropometric-data.entity");
const clinical_assessment_entity_1 = require("./clinical-assessment.entity");
const patient_medication_entity_1 = require("./patient-medication.entity");
const updrs3_score_entity_1 = require("./updrs3-score.entity");
const meem_score_entity_1 = require("./meem-score.entity");
const udysrs_score_entity_1 = require("./udysrs-score.entity");
const nms_score_entity_1 = require("./nms-score.entity");
const nmf_score_entity_1 = require("./nmf-score.entity");
const fogq_score_entity_1 = require("./fogq-score.entity");
const stopbang_score_entity_1 = require("./stopbang-score.entity");
const epworth_score_entity_1 = require("./epworth-score.entity");
const pdss2_score_entity_1 = require("./pdss2-score.entity");
const rbdsq_score_entity_1 = require("./rbdsq-score.entity");
const patient_task_collection_entity_1 = require("./patient-task-collection.entity");
const pdf_report_entity_1 = require("./pdf-report.entity");
const clinical_impression_entity_1 = require("./clinical-impression.entity");
const binary_collection_entity_1 = require("./binary-collection.entity");
let Questionnaire = class Questionnaire {
};
exports.Questionnaire = Questionnaire;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Questionnaire.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Questionnaire.prototype, "patient_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Questionnaire.prototype, "evaluator_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Questionnaire.prototype, "collection_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        default: 'draft',
    }),
    __metadata("design:type", String)
], Questionnaire.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true, default: '1.0' }),
    __metadata("design:type", String)
], Questionnaire.prototype, "assessment_version", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Questionnaire.prototype, "completed_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Questionnaire.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Questionnaire.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_entity_1.Patient, (patient) => patient.questionnaires, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", patient_entity_1.Patient)
], Questionnaire.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.questionnaires, {
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'evaluator_id' }),
    __metadata("design:type", user_entity_1.User)
], Questionnaire.prototype, "evaluator", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => anthropometric_data_entity_1.AnthropometricData, (anthropometric) => anthropometric.questionnaire, { cascade: true }),
    __metadata("design:type", anthropometric_data_entity_1.AnthropometricData)
], Questionnaire.prototype, "anthropometric_data", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => clinical_assessment_entity_1.ClinicalAssessment, (clinical) => clinical.questionnaire, { cascade: true }),
    __metadata("design:type", clinical_assessment_entity_1.ClinicalAssessment)
], Questionnaire.prototype, "clinical_assessment", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => patient_medication_entity_1.PatientMedication, (medication) => medication.questionnaire, { cascade: true }),
    __metadata("design:type", Array)
], Questionnaire.prototype, "medications", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => updrs3_score_entity_1.Updrs3Score, (updrs3) => updrs3.questionnaire, {
        cascade: true,
    }),
    __metadata("design:type", updrs3_score_entity_1.Updrs3Score)
], Questionnaire.prototype, "updrs3_score", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => meem_score_entity_1.MeemScore, (meem) => meem.questionnaire, { cascade: true }),
    __metadata("design:type", meem_score_entity_1.MeemScore)
], Questionnaire.prototype, "meem_score", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => udysrs_score_entity_1.UdysrsScore, (udysrs) => udysrs.questionnaire, {
        cascade: true,
    }),
    __metadata("design:type", udysrs_score_entity_1.UdysrsScore)
], Questionnaire.prototype, "udysrs_score", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => nms_score_entity_1.NmsScore, (nms) => nms.questionnaire, { cascade: true }),
    __metadata("design:type", nms_score_entity_1.NmsScore)
], Questionnaire.prototype, "nms_score", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => nmf_score_entity_1.NmfScore, (nmf) => nmf.questionnaire, { cascade: true }),
    __metadata("design:type", nmf_score_entity_1.NmfScore)
], Questionnaire.prototype, "nmf_score", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => fogq_score_entity_1.FogqScore, (fogq) => fogq.questionnaire, { cascade: true }),
    __metadata("design:type", fogq_score_entity_1.FogqScore)
], Questionnaire.prototype, "fogq_score", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => stopbang_score_entity_1.StopbangScore, (stopbang) => stopbang.questionnaire, {
        cascade: true,
    }),
    __metadata("design:type", stopbang_score_entity_1.StopbangScore)
], Questionnaire.prototype, "stopbang_score", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => epworth_score_entity_1.EpworthScore, (epworth) => epworth.questionnaire, {
        cascade: true,
    }),
    __metadata("design:type", epworth_score_entity_1.EpworthScore)
], Questionnaire.prototype, "epworth_score", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => pdss2_score_entity_1.Pdss2Score, (pdss2) => pdss2.questionnaire, {
        cascade: true,
    }),
    __metadata("design:type", pdss2_score_entity_1.Pdss2Score)
], Questionnaire.prototype, "pdss2_score", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => rbdsq_score_entity_1.RbdsqScore, (rbdsq) => rbdsq.questionnaire, {
        cascade: true,
    }),
    __metadata("design:type", rbdsq_score_entity_1.RbdsqScore)
], Questionnaire.prototype, "rbdsq_score", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => patient_task_collection_entity_1.PatientTaskCollection, (task) => task.questionnaire, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Questionnaire.prototype, "task_collections", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => pdf_report_entity_1.PdfReport, (pdf) => pdf.questionnaire, { cascade: true }),
    __metadata("design:type", Array)
], Questionnaire.prototype, "pdf_reports", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => clinical_impression_entity_1.ClinicalImpression, (impression) => impression.questionnaire, { cascade: true }),
    __metadata("design:type", clinical_impression_entity_1.ClinicalImpression)
], Questionnaire.prototype, "clinical_impression", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => binary_collection_entity_1.BinaryCollection, (binary) => binary.questionnaire, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Questionnaire.prototype, "binary_collections", void 0);
exports.Questionnaire = Questionnaire = __decorate([
    (0, typeorm_1.Entity)('questionnaires')
], Questionnaire);
//# sourceMappingURL=questionnaire.entity.js.map