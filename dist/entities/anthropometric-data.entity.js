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
exports.AnthropometricData = void 0;
const typeorm_1 = require("typeorm");
const questionnaire_entity_1 = require("./questionnaire.entity");
let AnthropometricData = class AnthropometricData {
};
exports.AnthropometricData = AnthropometricData;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AnthropometricData.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', unique: true }),
    __metadata("design:type", String)
], AnthropometricData.prototype, "questionnaire_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], AnthropometricData.prototype, "weight_kg", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], AnthropometricData.prototype, "height_cm", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'numeric',
        precision: 5,
        scale: 2,
        nullable: true,
        generatedType: 'STORED',
        asExpression: 'weight_kg / ((height_cm / 100) * (height_cm / 100))',
    }),
    __metadata("design:type", Number)
], AnthropometricData.prototype, "bmi", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], AnthropometricData.prototype, "waist_circumference_cm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], AnthropometricData.prototype, "hip_circumference_cm", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'numeric',
        precision: 4,
        scale: 3,
        nullable: true,
        generatedType: 'STORED',
        asExpression: 'waist_circumference_cm / NULLIF(hip_circumference_cm, 0)',
    }),
    __metadata("design:type", Number)
], AnthropometricData.prototype, "waist_hip_ratio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], AnthropometricData.prototype, "neck_circumference_cm", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], AnthropometricData.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], AnthropometricData.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => questionnaire_entity_1.Questionnaire, (questionnaire) => questionnaire.anthropometric_data, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'questionnaire_id' }),
    __metadata("design:type", questionnaire_entity_1.Questionnaire)
], AnthropometricData.prototype, "questionnaire", void 0);
exports.AnthropometricData = AnthropometricData = __decorate([
    (0, typeorm_1.Entity)('anthropometric_data')
], AnthropometricData);
//# sourceMappingURL=anthropometric-data.entity.js.map