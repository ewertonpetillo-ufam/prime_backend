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
exports.SaveFogqDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const MIN_P = 0;
const MAX_P = 4;
class SaveFogqDto {
}
exports.SaveFogqDto = SaveFogqDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Identificador do questionário',
        format: 'uuid',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SaveFogqDto.prototype, "questionnaireId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Gait worst state', minimum: MIN_P, maximum: MAX_P }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(MIN_P),
    (0, class_validator_1.Max)(MAX_P),
    __metadata("design:type", Number)
], SaveFogqDto.prototype, "gait_worst_state", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Impact daily activities', minimum: MIN_P, maximum: MAX_P }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(MIN_P),
    (0, class_validator_1.Max)(MAX_P),
    __metadata("design:type", Number)
], SaveFogqDto.prototype, "impact_daily_activities", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Feet stuck', minimum: MIN_P, maximum: MAX_P }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(MIN_P),
    (0, class_validator_1.Max)(MAX_P),
    __metadata("design:type", Number)
], SaveFogqDto.prototype, "feet_stuck", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Longest episode', minimum: MIN_P, maximum: MAX_P }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(MIN_P),
    (0, class_validator_1.Max)(MAX_P),
    __metadata("design:type", Number)
], SaveFogqDto.prototype, "longest_episode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Hesitation initiation', minimum: MIN_P, maximum: MAX_P }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(MIN_P),
    (0, class_validator_1.Max)(MAX_P),
    __metadata("design:type", Number)
], SaveFogqDto.prototype, "hesitation_initiation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Hesitation turning', minimum: MIN_P, maximum: MAX_P }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(MIN_P),
    (0, class_validator_1.Max)(MAX_P),
    __metadata("design:type", Number)
], SaveFogqDto.prototype, "hesitation_turning", void 0);
//# sourceMappingURL=save-fogq.dto.js.map