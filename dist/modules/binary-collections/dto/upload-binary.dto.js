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
exports.UploadBinaryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UploadBinaryDto {
}
exports.UploadBinaryDto = UploadBinaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'CPF of the patient (11 digits, will be hashed)',
        example: '12345678900',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^\d{11}$/, { message: 'CPF must contain exactly 11 digits' }),
    __metadata("design:type", String)
], UploadBinaryDto.prototype, "patient_cpf", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Task code (e.g., TA1, TA2, TA3)',
        example: 'TA1',
        maxLength: 20,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], UploadBinaryDto.prototype, "task_code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        format: 'binary',
        description: 'CSV file containing sensor data',
    }),
    __metadata("design:type", Object)
], UploadBinaryDto.prototype, "file", void 0);
//# sourceMappingURL=upload-binary.dto.js.map