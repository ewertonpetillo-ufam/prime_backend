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
var typeorm_1 = require("typeorm");
var patient_entity_1 = require("./patient.entity");
var user_entity_1 = require("./user.entity");
var anthropometric_data_entity_1 = require("./anthropometric-data.entity");
var clinical_assessment_entity_1 = require("./clinical-assessment.entity");
var patient_medication_entity_1 = require("./patient-medication.entity");
var updrs3_score_entity_1 = require("./updrs3-score.entity");
var meem_score_entity_1 = require("./meem-score.entity");
var udysrs_score_entity_1 = require("./udysrs-score.entity");
var nms_score_entity_1 = require("./nms-score.entity");
var nmf_score_entity_1 = require("./nmf-score.entity");
var fogq_score_entity_1 = require("./fogq-score.entity");
var stopbang_score_entity_1 = require("./stopbang-score.entity");
var epworth_score_entity_1 = require("./epworth-score.entity");
var pdss2_score_entity_1 = require("./pdss2-score.entity");
var rbdsq_score_entity_1 = require("./rbdsq-score.entity");
var rbdsq_br_score_entity_1 = require("./rbdsq-br-score.entity");
var patient_task_collection_entity_1 = require("./patient-task-collection.entity");
var pdf_report_entity_1 = require("./pdf-report.entity");
var clinical_impression_entity_1 = require("./clinical-impression.entity");
var binary_collection_entity_1 = require("./binary-collection.entity");
// Status values: 'draft', 'in_progress', 'completed', 'archived'
var Questionnaire = /** @class */ (function () {
    function Questionnaire() {
    }
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
        (0, typeorm_1.Column)({ type: 'integer', nullable: true, default: 1 }),
        __metadata("design:type", Number)
    ], Questionnaire.prototype, "last_step", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
        __metadata("design:type", Date)
    ], Questionnaire.prototype, "completed_at", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
        __metadata("design:type", Number)
    ], Questionnaire.prototype, "collection_time_seconds", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', default: false }),
        __metadata("design:type", Boolean)
    ], Questionnaire.prototype, "is_healthy_control", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', default: false }),
        __metadata("design:type", Boolean)
    ], Questionnaire.prototype, "sleep_test_recommended", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', default: false }),
        __metadata("design:type", Boolean)
    ], Questionnaire.prototype, "free_living_test_recommended", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
        __metadata("design:type", Date)
    ], Questionnaire.prototype, "current_session_started_at", void 0);
    __decorate([
        (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', default: function () { return 'CURRENT_TIMESTAMP'; } }),
        __metadata("design:type", Date)
    ], Questionnaire.prototype, "created_at", void 0);
    __decorate([
        (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp', default: function () { return 'CURRENT_TIMESTAMP'; } }),
        __metadata("design:type", Date)
    ], Questionnaire.prototype, "updated_at", void 0);
    __decorate([
        (0, typeorm_1.ManyToOne)(function () { return patient_entity_1.Patient; }, function (patient) { return patient.questionnaires; }, {
            onDelete: 'CASCADE',
        }),
        (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
        __metadata("design:type", patient_entity_1.Patient)
    ], Questionnaire.prototype, "patient", void 0);
    __decorate([
        (0, typeorm_1.ManyToOne)(function () { return user_entity_1.User; }, function (user) { return user.questionnaires; }, {
            onDelete: 'SET NULL',
        }),
        (0, typeorm_1.JoinColumn)({ name: 'evaluator_id' }),
        __metadata("design:type", user_entity_1.User)
    ], Questionnaire.prototype, "evaluator", void 0);
    __decorate([
        (0, typeorm_1.OneToOne)(function () { return anthropometric_data_entity_1.AnthropometricData; }, function (anthropometric) { return anthropometric.questionnaire; }, { cascade: true }),
        __metadata("design:type", anthropometric_data_entity_1.AnthropometricData)
    ], Questionnaire.prototype, "anthropometric_data", void 0);
    __decorate([
        (0, typeorm_1.OneToOne)(function () { return clinical_assessment_entity_1.ClinicalAssessment; }, function (clinical) { return clinical.questionnaire; }, { cascade: true }),
        __metadata("design:type", clinical_assessment_entity_1.ClinicalAssessment)
    ], Questionnaire.prototype, "clinical_assessment", void 0);
    __decorate([
        (0, typeorm_1.OneToMany)(function () { return patient_medication_entity_1.PatientMedication; }, function (medication) { return medication.questionnaire; }, { cascade: true }),
        __metadata("design:type", Array)
    ], Questionnaire.prototype, "medications", void 0);
    __decorate([
        (0, typeorm_1.OneToOne)(function () { return updrs3_score_entity_1.Updrs3Score; }, function (updrs3) { return updrs3.questionnaire; }, {
            cascade: true,
        }),
        __metadata("design:type", updrs3_score_entity_1.Updrs3Score)
    ], Questionnaire.prototype, "updrs3_score", void 0);
    __decorate([
        (0, typeorm_1.OneToOne)(function () { return meem_score_entity_1.MeemScore; }, function (meem) { return meem.questionnaire; }, { cascade: true }),
        __metadata("design:type", meem_score_entity_1.MeemScore)
    ], Questionnaire.prototype, "meem_score", void 0);
    __decorate([
        (0, typeorm_1.OneToOne)(function () { return udysrs_score_entity_1.UdysrsScore; }, function (udysrs) { return udysrs.questionnaire; }, {
            cascade: true,
        }),
        __metadata("design:type", udysrs_score_entity_1.UdysrsScore)
    ], Questionnaire.prototype, "udysrs_score", void 0);
    __decorate([
        (0, typeorm_1.OneToOne)(function () { return nms_score_entity_1.NmsScore; }, function (nms) { return nms.questionnaire; }, { cascade: true }),
        __metadata("design:type", nms_score_entity_1.NmsScore)
    ], Questionnaire.prototype, "nms_score", void 0);
    __decorate([
        (0, typeorm_1.OneToOne)(function () { return nmf_score_entity_1.NmfScore; }, function (nmf) { return nmf.questionnaire; }, { cascade: true }),
        __metadata("design:type", nmf_score_entity_1.NmfScore)
    ], Questionnaire.prototype, "nmf_score", void 0);
    __decorate([
        (0, typeorm_1.OneToOne)(function () { return fogq_score_entity_1.FogqScore; }, function (fogq) { return fogq.questionnaire; }, { cascade: true }),
        __metadata("design:type", fogq_score_entity_1.FogqScore)
    ], Questionnaire.prototype, "fogq_score", void 0);
    __decorate([
        (0, typeorm_1.OneToOne)(function () { return stopbang_score_entity_1.StopbangScore; }, function (stopbang) { return stopbang.questionnaire; }, {
            cascade: true,
        }),
        __metadata("design:type", stopbang_score_entity_1.StopbangScore)
    ], Questionnaire.prototype, "stopbang_score", void 0);
    __decorate([
        (0, typeorm_1.OneToOne)(function () { return epworth_score_entity_1.EpworthScore; }, function (epworth) { return epworth.questionnaire; }, {
            cascade: true,
        }),
        __metadata("design:type", epworth_score_entity_1.EpworthScore)
    ], Questionnaire.prototype, "epworth_score", void 0);
    __decorate([
        (0, typeorm_1.OneToOne)(function () { return pdss2_score_entity_1.Pdss2Score; }, function (pdss2) { return pdss2.questionnaire; }, {
            cascade: true,
        }),
        __metadata("design:type", pdss2_score_entity_1.Pdss2Score)
    ], Questionnaire.prototype, "pdss2_score", void 0);
    __decorate([
        (0, typeorm_1.OneToOne)(function () { return rbdsq_score_entity_1.RbdsqScore; }, function (rbdsq) { return rbdsq.questionnaire; }, {
            cascade: true,
        }),
        __metadata("design:type", rbdsq_score_entity_1.RbdsqScore)
    ], Questionnaire.prototype, "rbdsq_score", void 0);
    __decorate([
        (0, typeorm_1.OneToOne)(function () { return rbdsq_br_score_entity_1.RbdsqBrScore; }, function (rbdsqBr) { return rbdsqBr.questionnaire; }, {
            cascade: true,
        }),
        __metadata("design:type", rbdsq_br_score_entity_1.RbdsqBrScore)
    ], Questionnaire.prototype, "rbdsq_br_score", void 0);
    __decorate([
        (0, typeorm_1.OneToMany)(function () { return patient_task_collection_entity_1.PatientTaskCollection; }, function (task) { return task.questionnaire; }, {
            cascade: true,
        }),
        __metadata("design:type", Array)
    ], Questionnaire.prototype, "task_collections", void 0);
    __decorate([
        (0, typeorm_1.OneToMany)(function () { return pdf_report_entity_1.PdfReport; }, function (pdf) { return pdf.questionnaire; }, { cascade: true }),
        __metadata("design:type", Array)
    ], Questionnaire.prototype, "pdf_reports", void 0);
    __decorate([
        (0, typeorm_1.OneToOne)(function () { return clinical_impression_entity_1.ClinicalImpression; }, function (impression) { return impression.questionnaire; }, { cascade: true }),
        __metadata("design:type", clinical_impression_entity_1.ClinicalImpression)
    ], Questionnaire.prototype, "clinical_impression", void 0);
    __decorate([
        (0, typeorm_1.OneToMany)(function () { return binary_collection_entity_1.BinaryCollection; }, function (binary) { return binary.questionnaire; }, {
            cascade: true,
        }),
        __metadata("design:type", Array)
    ], Questionnaire.prototype, "binary_collections", void 0);
    Questionnaire = __decorate([
        (0, typeorm_1.Entity)('questionnaires')
    ], Questionnaire);
    return Questionnaire;
}());
exports.Questionnaire = Questionnaire;
