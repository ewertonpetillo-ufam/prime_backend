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
exports.SaveStep3Dto = exports.MedicationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class MedicationDto {
}
exports.MedicationDto = MedicationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Drug name', example: 'Levodopa' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MedicationDto.prototype, "drug", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Dose in mg', example: 300 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MedicationDto.prototype, "doseMg", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Quantity per day', example: 3 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MedicationDto.prototype, "qtDose", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'LED value', example: 300 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MedicationDto.prototype, "led", void 0);
class SaveStep3Dto {
}
exports.SaveStep3Dto = SaveStep3Dto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Questionnaire ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SaveStep3Dto.prototype, "questionnaireId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Diagnostic description', example: 'Doença de Parkinson' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep3Dto.prototype, "diagnosticDescription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Age at onset', example: 65 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SaveStep3Dto.prototype, "onsetAge", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Parkinson onset time', example: '5 anos' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep3Dto.prototype, "parkinsonOnset", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Initial symptom', example: 'Tremor' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep3Dto.prototype, "initialSympton", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Parkinson side', example: 'Direito' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep3Dto.prototype, "parkinsonSide", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Family case', example: 'Sim' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep3Dto.prototype, "familyCase", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Kinship degree', example: 'Pai' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep3Dto.prototype, "kinshipDegree", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Main phenotype', example: 'Tremulante' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep3Dto.prototype, "mainPhenotype", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Levodopa ON', example: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], SaveStep3Dto.prototype, "levodopaOn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Medications', type: [MedicationDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => MedicationDto),
    __metadata("design:type", Array)
], SaveStep3Dto.prototype, "medications", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'LEDD result', example: 600 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SaveStep3Dto.prototype, "leddResult", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Comorbidities', example: 'Hipertensão' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep3Dto.prototype, "comorbidities", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Other medications', example: 'Aspirina' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep3Dto.prototype, "otherMedications", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Has dyskinesia', example: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], SaveStep3Dto.prototype, "diskinectiaPresence", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Has freezing of gait', example: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], SaveStep3Dto.prototype, "fog", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'FOG classification', example: 'Pico de dose' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep3Dto.prototype, "fogClassifcation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Has wearing off', example: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], SaveStep3Dto.prototype, "wearingOff", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Duration wearing off', example: '4 horas' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep3Dto.prototype, "durationWearingOff", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Has delay on', example: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], SaveStep3Dto.prototype, "DelayOn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Duration L-Dopa', example: '30 minutos' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep3Dto.prototype, "durationLDopa", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Hoehn-Yahr scale', example: '2.5' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep3Dto.prototype, "scaleHY", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Schwab & England score', example: '80' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep3Dto.prototype, "scaleSE", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Vitamins', example: 'Vitamina D' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep3Dto.prototype, "vitamins", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Has surgery history', example: 'Sim' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep3Dto.prototype, "surgery", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Surgery year', example: '2020' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep3Dto.prototype, "surgerrYear", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Surgery type', example: 'DBS' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep3Dto.prototype, "surgeryType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Surgery target', example: 'STN' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep3Dto.prototype, "surgeryTarget", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Disease evolution', example: 'Estável' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep3Dto.prototype, "evolution", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Current symptoms', example: 'Melhora com levodopa' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep3Dto.prototype, "symptom", void 0);
//# sourceMappingURL=save-step3.dto.js.map