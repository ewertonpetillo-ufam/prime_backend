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
exports.Patient = void 0;
var typeorm_1 = require("typeorm");
var questionnaire_entity_1 = require("./questionnaire.entity");
var gender_type_entity_1 = require("./gender-type.entity");
var ethnicity_type_entity_1 = require("./ethnicity-type.entity");
var education_level_entity_1 = require("./education-level.entity");
var marital_status_type_entity_1 = require("./marital-status-type.entity");
var income_range_entity_1 = require("./income-range.entity");
var Patient = /** @class */ (function () {
    function Patient() {
    }
    __decorate([
        (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
        __metadata("design:type", String)
    ], Patient.prototype, "id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true, unique: true }),
        __metadata("design:type", String)
    ], Patient.prototype, "public_identifier", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 128, unique: true }),
        __metadata("design:type", String)
    ], Patient.prototype, "cpf_hash", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 11, nullable: true }),
        __metadata("design:type", String)
    ], Patient.prototype, "cpf", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
        __metadata("design:type", String)
    ], Patient.prototype, "full_name", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'date' }),
        __metadata("design:type", Date)
    ], Patient.prototype, "date_of_birth", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Number)
    ], Patient.prototype, "gender_id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Number)
    ], Patient.prototype, "ethnicity_id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true, default: 'Brasileiro' }),
        __metadata("design:type", String)
    ], Patient.prototype, "nationality", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
        __metadata("design:type", String)
    ], Patient.prototype, "email", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
        __metadata("design:type", String)
    ], Patient.prototype, "phone_primary", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
        __metadata("design:type", String)
    ], Patient.prototype, "phone_secondary", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Number)
    ], Patient.prototype, "education_level_id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
        __metadata("design:type", String)
    ], Patient.prototype, "education_other", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Number)
    ], Patient.prototype, "marital_status_id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
        __metadata("design:type", String)
    ], Patient.prototype, "occupation", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Number)
    ], Patient.prototype, "income_range_id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', default: false }),
        __metadata("design:type", Boolean)
    ], Patient.prototype, "is_current_smoker", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Number)
    ], Patient.prototype, "smoking_duration_years", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Number)
    ], Patient.prototype, "years_since_quit_smoking", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', nullable: true, default: false }),
        __metadata("design:type", Boolean)
    ], Patient.prototype, "smoked_before", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', nullable: true, default: false }),
        __metadata("design:type", Boolean)
    ], Patient.prototype, "visual_impairment", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', nullable: true, default: false }),
        __metadata("design:type", Boolean)
    ], Patient.prototype, "hoarseness", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', nullable: true, default: false }),
        __metadata("design:type", Boolean)
    ], Patient.prototype, "stuttering", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', nullable: true }),
        __metadata("design:type", Boolean)
    ], Patient.prototype, "can_read", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', nullable: true }),
        __metadata("design:type", Boolean)
    ], Patient.prototype, "can_write", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
        __metadata("design:type", String)
    ], Patient.prototype, "dominant_hand", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', nullable: true }),
        __metadata("design:type", Boolean)
    ], Patient.prototype, "tcle_signed", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', default: true }),
        __metadata("design:type", Boolean)
    ], Patient.prototype, "active", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', default: false }),
        __metadata("design:type", Boolean)
    ], Patient.prototype, "sync_pending", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
        __metadata("design:type", Date)
    ], Patient.prototype, "sync_pending_at", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
        __metadata("design:type", Date)
    ], Patient.prototype, "synced_at", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'bigint', default: 0 }),
        __metadata("design:type", String)
    ], Patient.prototype, "sync_version", void 0);
    __decorate([
        (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', default: function () { return 'CURRENT_TIMESTAMP'; } }),
        __metadata("design:type", Date)
    ], Patient.prototype, "created_at", void 0);
    __decorate([
        (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp', default: function () { return 'CURRENT_TIMESTAMP'; } }),
        __metadata("design:type", Date)
    ], Patient.prototype, "updated_at", void 0);
    __decorate([
        (0, typeorm_1.ManyToOne)(function () { return gender_type_entity_1.GenderType; }, { eager: true }),
        (0, typeorm_1.JoinColumn)({ name: 'gender_id' }),
        __metadata("design:type", gender_type_entity_1.GenderType)
    ], Patient.prototype, "gender", void 0);
    __decorate([
        (0, typeorm_1.ManyToOne)(function () { return ethnicity_type_entity_1.EthnicityType; }, { eager: true }),
        (0, typeorm_1.JoinColumn)({ name: 'ethnicity_id' }),
        __metadata("design:type", ethnicity_type_entity_1.EthnicityType)
    ], Patient.prototype, "ethnicity", void 0);
    __decorate([
        (0, typeorm_1.ManyToOne)(function () { return education_level_entity_1.EducationLevel; }, { eager: true }),
        (0, typeorm_1.JoinColumn)({ name: 'education_level_id' }),
        __metadata("design:type", education_level_entity_1.EducationLevel)
    ], Patient.prototype, "education_level", void 0);
    __decorate([
        (0, typeorm_1.ManyToOne)(function () { return marital_status_type_entity_1.MaritalStatusType; }, { eager: true }),
        (0, typeorm_1.JoinColumn)({ name: 'marital_status_id' }),
        __metadata("design:type", marital_status_type_entity_1.MaritalStatusType)
    ], Patient.prototype, "marital_status", void 0);
    __decorate([
        (0, typeorm_1.ManyToOne)(function () { return income_range_entity_1.IncomeRange; }, { eager: true }),
        (0, typeorm_1.JoinColumn)({ name: 'income_range_id' }),
        __metadata("design:type", income_range_entity_1.IncomeRange)
    ], Patient.prototype, "income_range", void 0);
    __decorate([
        (0, typeorm_1.OneToMany)(function () { return questionnaire_entity_1.Questionnaire; }, function (questionnaire) { return questionnaire.patient; }),
        __metadata("design:type", Array)
    ], Patient.prototype, "questionnaires", void 0);
    Patient = __decorate([
        (0, typeorm_1.Entity)('patients')
    ], Patient);
    return Patient;
}());
exports.Patient = Patient;
