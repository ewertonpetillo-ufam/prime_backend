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
exports.SaveUpdrs3Dto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const SCORE_MIN = 0;
const SCORE_MAX = 4;
class SaveUpdrs3Dto {
}
exports.SaveUpdrs3Dto = SaveUpdrs3Dto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Identificador do questionário ao qual o protocolo pertence',
        format: 'uuid',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SaveUpdrs3Dto.prototype, "questionnaireId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.1 - Fala', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "speech", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.2 - Expressão facial', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "facial_expression", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.3 - Rigidez (Pescoço)', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "rigidity_neck", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.3 - Rigidez (MS Direito)', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "rigidity_rue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.3 - Rigidez (MS Esquerdo)', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "rigidity_lue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.3 - Rigidez (MI Direito)', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "rigidity_rle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.3 - Rigidez (MI Esquerdo)', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "rigidity_lle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.4 - Bater dos dedos das mãos (Direita)', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "finger_tapping_right", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.4 - Bater dos dedos das mãos (Esquerda)', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "finger_tapping_left", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.5 - Movimentos das mãos (Direita)', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "hand_movements_right", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.5 - Movimentos das mãos (Esquerda)', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "hand_movements_left", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.6 - Pronação/supinação (Direita)', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "pronation_supination_right", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.6 - Pronação/supinação (Esquerda)', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "pronation_supination_left", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.7 - Bater dos dedos dos pés (Direito)', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "toe_tapping_right", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.7 - Bater dos dedos dos pés (Esquerdo)', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "toe_tapping_left", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.8 - Agilidade das pernas (Direita)', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "leg_agility_right", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.8 - Agilidade das pernas (Esquerda)', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "leg_agility_left", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.9 - Levantar-se da cadeira', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "rising_from_chair", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.10 - Marcha', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "gait", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.11 - Freezing de marcha', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "freezing_of_gait", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.12 - Estabilidade postural', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "postural_stability", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.13 - Postura', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "posture", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.14 - Bradicinesia global', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "global_bradykinesia", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.15 - Tremor postural (Direita)', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "postural_tremor_right", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.15 - Tremor postural (Esquerda)', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "postural_tremor_left", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.16 - Tremor cinético (Direita)', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "kinetic_tremor_right", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.16 - Tremor cinético (Esquerda)', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "kinetic_tremor_left", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.17 - Tremor de repouso (MS Direito)', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "rest_tremor_rue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.17 - Tremor de repouso (MS Esquerdo)', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "rest_tremor_lue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.17 - Tremor de repouso (MI Direito)', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "rest_tremor_rle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.17 - Tremor de repouso (MI Esquerdo)', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "rest_tremor_lle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.17 - Tremor de repouso (Lábios/Mandíbula)', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "rest_tremor_lip_jaw", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '3.18 - Persistência do tremor de repouso', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUpdrs3Dto.prototype, "postural_tremor_amplitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discinesias presentes durante a avaliação' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SaveUpdrs3Dto.prototype, "dyskinesia_present", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discinesias interferiram nas pontuações' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SaveUpdrs3Dto.prototype, "dyskinesia_interfered", void 0);
//# sourceMappingURL=save-updrs3.dto.js.map