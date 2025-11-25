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
exports.UploadPdfReportDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UploadPdfReportDto {
}
exports.UploadPdfReportDto = UploadPdfReportDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Identificador do questionário relacionado ao relatório',
        format: 'uuid',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UploadPdfReportDto.prototype, "questionnaireId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tipo do relatório PDF',
        enum: ['BIOBIT', 'DELSYS', 'POLYSOMNOGRAPHY', 'OTHER'],
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['BIOBIT', 'DELSYS', 'POLYSOMNOGRAPHY', 'OTHER']),
    __metadata("design:type", String)
], UploadPdfReportDto.prototype, "reportType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Observações adicionais',
        maxLength: 2000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], UploadPdfReportDto.prototype, "notes", void 0);
//# sourceMappingURL=upload-pdf-report.dto.js.map