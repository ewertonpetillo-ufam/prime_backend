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
exports.SaveStep1Dto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class SaveStep1Dto {
}
exports.SaveStep1Dto = SaveStep1Dto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'CPF of the patient (11 digits)',
        example: '12345678900',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^\d{11}$/, { message: 'CPF must contain exactly 11 digits' }),
    __metadata("design:type", String)
], SaveStep1Dto.prototype, "cpf", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Full name', example: 'Maria Santos' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], SaveStep1Dto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date of birth', example: '1950-05-15' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SaveStep1Dto.prototype, "birthday", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Age', example: '73' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep1Dto.prototype, "age", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Gender (M, F, Outro)', example: 'F' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep1Dto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Ethnicity', example: 'Branco' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep1Dto.prototype, "etnia", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Nationality', example: 'Brasileiro' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep1Dto.prototype, "nationality", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Education level', example: 'Ensino Superior Completo' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep1Dto.prototype, "education", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Other education', example: 'Curso técnico' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep1Dto.prototype, "educationOther", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Marital status', example: 'Casado' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep1Dto.prototype, "maritalStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Occupation', example: 'Médico' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep1Dto.prototype, "occupation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Phone number', example: '(11) 98765-4321' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep1Dto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Contact phone number', example: '(11) 91234-5678' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep1Dto.prototype, "phoneNumberContact", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Email (opcional)', example: 'maria@email.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.email !== undefined && o.email !== null && o.email !== ''),
    (0, class_validator_1.IsEmail)({}, { message: 'Email deve ter um formato válido' }),
    __metadata("design:type", String)
], SaveStep1Dto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is current smoker', example: 'Sim' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SaveStep1Dto.prototype, "fumaCase", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Smoked before', example: 'Sim' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SaveStep1Dto.prototype, "fumouAntes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Smoking duration', example: '10 anos' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep1Dto.prototype, "smokingDuration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Stopped smoking duration', example: '2 anos' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep1Dto.prototype, "stoppedSmokingDuration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Collection date', example: '2024-01-15' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SaveStep1Dto.prototype, "dataColeta", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Evaluator name', example: 'Dr. João Silva' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep1Dto.prototype, "nomeAvaliador", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Family income', example: 'ate_1_salario' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep1Dto.prototype, "rendaFamiliar", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Visual deficiency', example: 'Não' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep1Dto.prototype, "deficienciaVisual", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Hoarseness', example: 'Não' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep1Dto.prototype, "rouquidao", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Stuttering', example: 'Não' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep1Dto.prototype, "gagueja", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Existing questionnaire ID (if editing)', example: 'uuid' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveStep1Dto.prototype, "questionnaireId", void 0);
//# sourceMappingURL=save-step1.dto.js.map