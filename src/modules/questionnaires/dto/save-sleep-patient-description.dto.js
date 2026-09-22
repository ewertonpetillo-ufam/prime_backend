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
exports.SaveSleepPatientDescriptionDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var SaveSleepPatientDescriptionDto = /** @class */ (function () {
    function SaveSleepPatientDescriptionDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'Identificador do questionário',
            format: 'uuid',
        }),
        (0, class_validator_1.IsUUID)(),
        (0, class_validator_1.IsNotEmpty)(),
        __metadata("design:type", String)
    ], SaveSleepPatientDescriptionDto.prototype, "questionnaireId", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({
            description: 'Descrição do paciente na avaliação do sono',
        }),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.IsOptional)(),
        __metadata("design:type", String)
    ], SaveSleepPatientDescriptionDto.prototype, "sleepPatientDescription", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({
            description: 'Data do exame do sono (YYYY-MM-DD). Envie vazio para limpar.',
            example: '2026-07-23',
        }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.ValidateIf)(function (_, v) { return v !== '' && v != null; }),
        (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/, {
            message: 'sleepExamDate must be YYYY-MM-DD',
        }),
        __metadata("design:type", String)
    ], SaveSleepPatientDescriptionDto.prototype, "sleepExamDate", void 0);
    return SaveSleepPatientDescriptionDto;
}());
exports.SaveSleepPatientDescriptionDto = SaveSleepPatientDescriptionDto;
