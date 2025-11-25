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
exports.SaveMeemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const BIN_MIN = 0;
const BIN_MAX = 1;
class SaveMeemDto {
}
exports.SaveMeemDto = SaveMeemDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Identificador do questionário',
        format: 'uuid',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SaveMeemDto.prototype, "questionnaireId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Dia da semana', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "orientation_day", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Dia do mês', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "orientation_date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Mês', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "orientation_month", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Ano', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "orientation_year", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Hora aproximada', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "orientation_time", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Local específico', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "orientation_location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Instituição', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "orientation_institution", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cidade', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "orientation_city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Estado', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "orientation_state", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'País', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "orientation_country", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Memória imediata - palavra 1', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "registration_word1", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Memória imediata - palavra 2', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "registration_word2", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Memória imediata - palavra 3', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "registration_word3", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Atenção - resposta 1', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "attention_calc1", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Atenção - resposta 2', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "attention_calc2", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Atenção - resposta 3', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "attention_calc3", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Atenção - resposta 4', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "attention_calc4", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Atenção - resposta 5', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "attention_calc5", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Evocação - palavra 1', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "recall_word1", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Evocação - palavra 2', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "recall_word2", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Evocação - palavra 3', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "recall_word3", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Nomear relógio', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "language_naming1", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Nomear caneta', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "language_naming2", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Repetir frase', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "language_repetition", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Comando 1', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "language_command1", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Comando 2', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "language_command2", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Comando 3', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "language_command3", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Ler e obedecer', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "language_reading", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Escrever uma frase', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "language_writing", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Copiar desenho', minimum: BIN_MIN, maximum: BIN_MAX }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(BIN_MIN),
    (0, class_validator_1.Max)(BIN_MAX),
    __metadata("design:type", Number)
], SaveMeemDto.prototype, "language_copying", void 0);
//# sourceMappingURL=save-meem.dto.js.map