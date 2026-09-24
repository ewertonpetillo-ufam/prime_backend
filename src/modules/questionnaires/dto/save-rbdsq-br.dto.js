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
exports.SaveRbdsqBrDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var SaveRbdsqBrDto = /** @class */ (function () {
    function SaveRbdsqBrDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'Identificador do questionário',
            format: 'uuid',
        }),
        (0, class_validator_1.IsUUID)(),
        __metadata("design:type", String)
    ], SaveRbdsqBrDto.prototype, "questionnaireId", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ description: 'Q1 - Sonhos que parecem reais' }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsBoolean)(),
        __metadata("design:type", Boolean)
    ], SaveRbdsqBrDto.prototype, "q1_realistic_dreams", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ description: 'Q2 - Sonhos com conteúdo agressivo ou muita ação' }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsBoolean)(),
        __metadata("design:type", Boolean)
    ], SaveRbdsqBrDto.prototype, "q2_aggressive_dreams", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ description: 'Q3 - Comportamentos que refletem os sonhos' }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsBoolean)(),
        __metadata("design:type", Boolean)
    ], SaveRbdsqBrDto.prototype, "q3_dream_enactment", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ description: 'Q4 - Movimentos de braços e pernas durante o sono' }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsBoolean)(),
        __metadata("design:type", Boolean)
    ], SaveRbdsqBrDto.prototype, "q4_limb_movements", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ description: 'Q5 - (Quase) se machucou ou (quase) machucou o parceiro durante o sono' }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsBoolean)(),
        __metadata("design:type", Boolean)
    ], SaveRbdsqBrDto.prototype, "q5_injury_potential", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ description: 'Q6.1 - Falar, gritar, xingar, rir alto' }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsBoolean)(),
        __metadata("design:type", Boolean)
    ], SaveRbdsqBrDto.prototype, "q6_1_vocalizations", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ description: 'Q6.2 - Movimentar bruscamente os membros, “lutar”' }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsBoolean)(),
        __metadata("design:type", Boolean)
    ], SaveRbdsqBrDto.prototype, "q6_2_fighting_movements", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ description: 'Q6.3 - Movimentos complexos sem sentido ou quedas da cama' }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsBoolean)(),
        __metadata("design:type", Boolean)
    ], SaveRbdsqBrDto.prototype, "q6_3_complex_movements_or_falls", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ description: 'Q6.4 - Derrubar objetos ao redor da cama' }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsBoolean)(),
        __metadata("design:type", Boolean)
    ], SaveRbdsqBrDto.prototype, "q6_4_objects_falling", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ description: 'Q7 - Movimentos que acordam o paciente' }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsBoolean)(),
        __metadata("design:type", Boolean)
    ], SaveRbdsqBrDto.prototype, "q7_movements_cause_awakenings", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ description: 'Q8 - Recordação vívida dos sonhos' }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsBoolean)(),
        __metadata("design:type", Boolean)
    ], SaveRbdsqBrDto.prototype, "q8_dream_recall", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ description: 'Q9 - Sono frequentemente agitado ou perturbado' }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsBoolean)(),
        __metadata("design:type", Boolean)
    ], SaveRbdsqBrDto.prototype, "q9_disturbed_sleep", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ description: 'Q10 - Presença de doença neurológica' }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsBoolean)(),
        __metadata("design:type", Boolean)
    ], SaveRbdsqBrDto.prototype, "q10_neurological_disease", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({
            description: 'Descrição da doença neurológica (campo livre correspondente a “Qual doença?”)',
            maxLength: 500,
        }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MaxLength)(500),
        __metadata("design:type", String)
    ], SaveRbdsqBrDto.prototype, "neuroDiseaseDescription", void 0);
    return SaveRbdsqBrDto;
}());
exports.SaveRbdsqBrDto = SaveRbdsqBrDto;
