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
exports.CreateEvaluatorDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateEvaluatorDto {
}
exports.CreateEvaluatorDto = CreateEvaluatorDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Full name of the evaluator',
        example: 'Dr. João Silva',
        maxLength: 255,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateEvaluatorDto.prototype, "full_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Professional registration number',
        example: 'CRM-123456',
        required: false,
        maxLength: 50,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateEvaluatorDto.prototype, "registration_number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Medical specialty',
        example: 'Neurologist',
        required: false,
        maxLength: 100,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateEvaluatorDto.prototype, "specialty", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email address',
        example: 'joao.silva@hospital.com',
        required: false,
        maxLength: 255,
    }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateEvaluatorDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Phone number',
        example: '(11) 98765-4321',
        required: false,
        maxLength: 20,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], CreateEvaluatorDto.prototype, "phone", void 0);
//# sourceMappingURL=create-evaluator.dto.js.map