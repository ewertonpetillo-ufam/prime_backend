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
exports.SaveStopbangDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class SaveStopbangDto {
}
exports.SaveStopbangDto = SaveStopbangDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Identificador do questionário',
        format: 'uuid',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SaveStopbangDto.prototype, "questionnaireId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Ronco alto' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SaveStopbangDto.prototype, "snoring", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sensação de cansaço diurno' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SaveStopbangDto.prototype, "tired", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Apneia observada' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SaveStopbangDto.prototype, "observed_apnea", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Hipertensão arterial' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SaveStopbangDto.prototype, "blood_pressure", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'IMC superior a 35kg/m²' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SaveStopbangDto.prototype, "bmi_over_35", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Idade acima de 50 anos' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SaveStopbangDto.prototype, "age_over_50", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Pescoço largo (≥ 40 cm)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SaveStopbangDto.prototype, "neck_circumference_large", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sexo masculino' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SaveStopbangDto.prototype, "gender_male", void 0);
//# sourceMappingURL=save-stopbang.dto.js.map