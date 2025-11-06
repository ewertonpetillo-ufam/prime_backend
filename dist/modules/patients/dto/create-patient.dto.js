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
exports.CreatePatientDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreatePatientDto {
}
exports.CreatePatientDto = CreatePatientDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'CPF of the patient (11 digits, will be hashed with HMAC-SHA256 for storage)',
        example: '12345678900',
        minLength: 11,
        maxLength: 11,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^\d{11}$/, { message: 'CPF must contain exactly 11 digits' }),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "cpf", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Full name of the patient',
        example: 'Maria Santos',
        maxLength: 255,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "full_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date of birth',
        example: '1950-05-15',
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "date_of_birth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Gender type ID (reference to gender_types table)',
        example: 1,
        required: false,
        type: Number,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePatientDto.prototype, "gender_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Ethnicity type ID (reference to ethnicity_types table)',
        example: 1,
        required: false,
        type: Number,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePatientDto.prototype, "ethnicity_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Education level ID (reference to education_levels table)',
        example: 1,
        required: false,
        type: Number,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePatientDto.prototype, "education_level_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Marital status type ID (reference to marital_status_types table)',
        example: 1,
        required: false,
        type: Number,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePatientDto.prototype, "marital_status_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Income range ID (reference to income_ranges table)',
        example: 1,
        required: false,
        type: Number,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePatientDto.prototype, "income_range_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nationality of the patient',
        example: 'Brasileiro',
        required: false,
        default: 'Brasileiro',
        maxLength: 100,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "nationality", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Primary phone number (replaces old "phone" field)',
        example: '(11) 98765-4321',
        required: false,
        maxLength: 20,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "phone_primary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Secondary phone number (optional)',
        example: '(11) 91234-5678',
        required: false,
        maxLength: 20,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "phone_secondary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email address',
        example: 'maria.santos@email.com',
        required: false,
    }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Occupation',
        example: 'Médico',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "occupation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Other education information',
        example: 'Curso técnico em enfermagem',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "education_other", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Is the patient currently a smoker',
        example: false,
        required: false,
        default: false,
        type: Boolean,
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreatePatientDto.prototype, "is_current_smoker", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Smoking duration in years (only if is_current_smoker is true)',
        example: 10,
        required: false,
        type: Number,
        minimum: 0,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePatientDto.prototype, "smoking_duration_years", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Years since quit smoking (only if is_current_smoker is false)',
        example: 5,
        required: false,
        type: Number,
        minimum: 0,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePatientDto.prototype, "years_since_quit_smoking", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Patient active status (soft delete flag)',
        example: true,
        required: false,
        default: true,
        type: Boolean,
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreatePatientDto.prototype, "active", void 0);
//# sourceMappingURL=create-patient.dto.js.map