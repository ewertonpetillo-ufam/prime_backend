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
exports.FreelivingDiary = void 0;
var typeorm_1 = require("typeorm");
var patient_entity_1 = require("./patient.entity");
var FreelivingDiary = /** @class */ (function () {
    function FreelivingDiary() {
    }
    __decorate([
        (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
        __metadata("design:type", String)
    ], FreelivingDiary.prototype, "id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'uuid' }),
        __metadata("design:type", String)
    ], FreelivingDiary.prototype, "patient_id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 128 }),
        __metadata("design:type", String)
    ], FreelivingDiary.prototype, "patient_cpf_hash", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'date' }),
        __metadata("design:type", String)
    ], FreelivingDiary.prototype, "diary_date", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'smallint' }),
        __metadata("design:type", Number)
    ], FreelivingDiary.prototype, "protocol_day", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'rascunho' }),
        __metadata("design:type", String)
    ], FreelivingDiary.prototype, "status", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
        __metadata("design:type", Object)
    ], FreelivingDiary.prototype, "payload", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
        __metadata("design:type", Array)
    ], FreelivingDiary.prototype, "gaps", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', default: 0 }),
        __metadata("design:type", Number)
    ], FreelivingDiary.prototype, "save_count", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'timestamptz', default: function () { return 'CURRENT_TIMESTAMP'; } }),
        __metadata("design:type", Date)
    ], FreelivingDiary.prototype, "first_saved_at", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'timestamptz', default: function () { return 'CURRENT_TIMESTAMP'; } }),
        __metadata("design:type", Date)
    ], FreelivingDiary.prototype, "last_saved_at", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
        __metadata("design:type", String)
    ], FreelivingDiary.prototype, "client_diary_id", void 0);
    __decorate([
        (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz', default: function () { return 'CURRENT_TIMESTAMP'; } }),
        __metadata("design:type", Date)
    ], FreelivingDiary.prototype, "created_at", void 0);
    __decorate([
        (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz', default: function () { return 'CURRENT_TIMESTAMP'; } }),
        __metadata("design:type", Date)
    ], FreelivingDiary.prototype, "updated_at", void 0);
    __decorate([
        (0, typeorm_1.ManyToOne)(function () { return patient_entity_1.Patient; }, { onDelete: 'CASCADE' }),
        (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
        __metadata("design:type", patient_entity_1.Patient)
    ], FreelivingDiary.prototype, "patient", void 0);
    FreelivingDiary = __decorate([
        (0, typeorm_1.Entity)('freeliving_diaries'),
        (0, typeorm_1.Unique)('uq_freeliving_diaries_patient_date', ['patient_id', 'diary_date'])
    ], FreelivingDiary);
    return FreelivingDiary;
}());
exports.FreelivingDiary = FreelivingDiary;
