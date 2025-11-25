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
exports.SavePdss2Dto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const MIN_P = 0;
const MAX_P = 4;
class SavePdss2Dto {
}
exports.SavePdss2Dto = SavePdss2Dto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Identificador do questionário',
        format: 'uuid',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SavePdss2Dto.prototype, "questionnaireId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Questão 1', minimum: MIN_P, maximum: MAX_P }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(MIN_P),
    (0, class_validator_1.Max)(MAX_P),
    __metadata("design:type", Number)
], SavePdss2Dto.prototype, "q1", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Questão 2', minimum: MIN_P, maximum: MAX_P }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(MIN_P),
    (0, class_validator_1.Max)(MAX_P),
    __metadata("design:type", Number)
], SavePdss2Dto.prototype, "q2", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Questão 3', minimum: MIN_P, maximum: MAX_P }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(MIN_P),
    (0, class_validator_1.Max)(MAX_P),
    __metadata("design:type", Number)
], SavePdss2Dto.prototype, "q3", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Questão 4', minimum: MIN_P, maximum: MAX_P }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(MIN_P),
    (0, class_validator_1.Max)(MAX_P),
    __metadata("design:type", Number)
], SavePdss2Dto.prototype, "q4", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Questão 5', minimum: MIN_P, maximum: MAX_P }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(MIN_P),
    (0, class_validator_1.Max)(MAX_P),
    __metadata("design:type", Number)
], SavePdss2Dto.prototype, "q5", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Questão 6', minimum: MIN_P, maximum: MAX_P }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(MIN_P),
    (0, class_validator_1.Max)(MAX_P),
    __metadata("design:type", Number)
], SavePdss2Dto.prototype, "q6", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Questão 7', minimum: MIN_P, maximum: MAX_P }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(MIN_P),
    (0, class_validator_1.Max)(MAX_P),
    __metadata("design:type", Number)
], SavePdss2Dto.prototype, "q7", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Questão 8', minimum: MIN_P, maximum: MAX_P }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(MIN_P),
    (0, class_validator_1.Max)(MAX_P),
    __metadata("design:type", Number)
], SavePdss2Dto.prototype, "q8", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Questão 9', minimum: MIN_P, maximum: MAX_P }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(MIN_P),
    (0, class_validator_1.Max)(MAX_P),
    __metadata("design:type", Number)
], SavePdss2Dto.prototype, "q9", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Questão 10', minimum: MIN_P, maximum: MAX_P }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(MIN_P),
    (0, class_validator_1.Max)(MAX_P),
    __metadata("design:type", Number)
], SavePdss2Dto.prototype, "q10", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Questão 11', minimum: MIN_P, maximum: MAX_P }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(MIN_P),
    (0, class_validator_1.Max)(MAX_P),
    __metadata("design:type", Number)
], SavePdss2Dto.prototype, "q11", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Questão 12', minimum: MIN_P, maximum: MAX_P }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(MIN_P),
    (0, class_validator_1.Max)(MAX_P),
    __metadata("design:type", Number)
], SavePdss2Dto.prototype, "q12", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Questão 13', minimum: MIN_P, maximum: MAX_P }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(MIN_P),
    (0, class_validator_1.Max)(MAX_P),
    __metadata("design:type", Number)
], SavePdss2Dto.prototype, "q13", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Questão 14', minimum: MIN_P, maximum: MAX_P }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(MIN_P),
    (0, class_validator_1.Max)(MAX_P),
    __metadata("design:type", Number)
], SavePdss2Dto.prototype, "q14", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Questão 15', minimum: MIN_P, maximum: MAX_P }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(MIN_P),
    (0, class_validator_1.Max)(MAX_P),
    __metadata("design:type", Number)
], SavePdss2Dto.prototype, "q15", void 0);
//# sourceMappingURL=save-pdss2.dto.js.map