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
exports.SaveEpworthDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class SaveEpworthDto {
}
exports.SaveEpworthDto = SaveEpworthDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Identificador do questionário',
        format: 'uuid',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SaveEpworthDto.prototype, "questionnaireId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sentado e lendo', minimum: 0, maximum: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(3),
    __metadata("design:type", Number)
], SaveEpworthDto.prototype, "sitting_reading", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Assistindo TV', minimum: 0, maximum: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(3),
    __metadata("design:type", Number)
], SaveEpworthDto.prototype, "watching_tv", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sentado inativo em público', minimum: 0, maximum: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(3),
    __metadata("design:type", Number)
], SaveEpworthDto.prototype, "sitting_inactive_public", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Passageiro em carro por 1h', minimum: 0, maximum: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(3),
    __metadata("design:type", Number)
], SaveEpworthDto.prototype, "passenger_car", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Deitado à tarde', minimum: 0, maximum: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(3),
    __metadata("design:type", Number)
], SaveEpworthDto.prototype, "lying_down_afternoon", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sentado conversando', minimum: 0, maximum: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(3),
    __metadata("design:type", Number)
], SaveEpworthDto.prototype, "sitting_talking", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sentado após o almoço', minimum: 0, maximum: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(3),
    __metadata("design:type", Number)
], SaveEpworthDto.prototype, "sitting_after_lunch", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Carro parado no trânsito', minimum: 0, maximum: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(3),
    __metadata("design:type", Number)
], SaveEpworthDto.prototype, "car_stopped_traffic", void 0);
//# sourceMappingURL=save-epworth.dto.js.map