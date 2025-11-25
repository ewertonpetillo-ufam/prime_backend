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
exports.SaveRbdsqDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class SaveRbdsqDto {
}
exports.SaveRbdsqDto = SaveRbdsqDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Identificador do questionário',
        format: 'uuid',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SaveRbdsqDto.prototype, "questionnaireId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Q1 - Sonhos vívidos' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SaveRbdsqDto.prototype, "q1_vivid_dreams", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Q2 - Conteúdo agressivo' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SaveRbdsqDto.prototype, "q2_aggressive_content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Q3 - Encenar sonhos' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SaveRbdsqDto.prototype, "q3_dream_enactment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Q4 - Movimentos de membros' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SaveRbdsqDto.prototype, "q4_limb_movements", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Q5 - Potencial de lesão' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SaveRbdsqDto.prototype, "q5_injury_potential", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Q6 - Desorganização da cama' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SaveRbdsqDto.prototype, "q6_bed_disruption", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Q7 - Recordação do despertar' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SaveRbdsqDto.prototype, "q7_awakening_recall", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Q8 - Perturbação do sono' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SaveRbdsqDto.prototype, "q8_sleep_disruption", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Q9 - Distúrbio neurológico' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SaveRbdsqDto.prototype, "q9_neurological_disorder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Q10 - Problemas prévios de comportamento REM' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SaveRbdsqDto.prototype, "q10_rem_behavior_problem", void 0);
//# sourceMappingURL=save-rbdsq.dto.js.map