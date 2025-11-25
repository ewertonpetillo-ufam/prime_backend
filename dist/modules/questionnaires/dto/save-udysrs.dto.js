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
exports.SaveUdysrsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const SCORE_MIN = 0;
const SCORE_MAX = 4;
class SaveUdysrsDto {
}
exports.SaveUdysrsDto = SaveUdysrsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Identificador do questionário',
        format: 'uuid',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SaveUdysrsDto.prototype, "questionnaireId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tempo com discinesia em On (Parte 1A)', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUdysrsDto.prototype, "on_dyskinesia_time", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Impacto na fala', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUdysrsDto.prototype, "impact_speech", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Impacto na mastigação/deglutição', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUdysrsDto.prototype, "impact_chewing", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Impacto em tarefas para comer', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUdysrsDto.prototype, "impact_eating", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Impacto em vestir-se', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUdysrsDto.prototype, "impact_dressing", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Impacto em higiene', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUdysrsDto.prototype, "impact_hygiene", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Impacto na escrita', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUdysrsDto.prototype, "impact_writing", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Impacto em passatempos/atividades', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUdysrsDto.prototype, "impact_hobbies", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Impacto na marcha/equilíbrio', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUdysrsDto.prototype, "impact_walking", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Impacto em situações sociais', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUdysrsDto.prototype, "impact_social", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Impacto em situações emocionais', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUdysrsDto.prototype, "impact_emotional", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tempo com distonia em Off', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUdysrsDto.prototype, "off_dystonia_time", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Impacto das distonias nas atividades', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUdysrsDto.prototype, "dystonia_activities", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Impacto da dor das distonias', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUdysrsDto.prototype, "dystonia_pain_impact", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Intensidade da dor das distonias', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUdysrsDto.prototype, "dystonia_pain_severity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Intensidade na face', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUdysrsDto.prototype, "severity_face", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Intensidade no pescoço', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUdysrsDto.prototype, "severity_neck", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Intensidade braço/ombro direito', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUdysrsDto.prototype, "severity_right_arm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Intensidade braço/ombro esquerdo', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUdysrsDto.prototype, "severity_left_arm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Intensidade tronco', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUdysrsDto.prototype, "severity_trunk", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Intensidade perna/coxa direita', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUdysrsDto.prototype, "severity_right_leg", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Intensidade perna/coxa esquerda', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUdysrsDto.prototype, "severity_left_leg", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Incapacidade - comunicação', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUdysrsDto.prototype, "disability_communication", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Incapacidade - beber', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUdysrsDto.prototype, "disability_drinking", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Incapacidade - vestir', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUdysrsDto.prototype, "disability_dressing", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Incapacidade - marcha', minimum: SCORE_MIN, maximum: SCORE_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(SCORE_MIN),
    (0, class_validator_1.Max)(SCORE_MAX),
    __metadata("design:type", Number)
], SaveUdysrsDto.prototype, "disability_walking", void 0);
//# sourceMappingURL=save-udysrs.dto.js.map