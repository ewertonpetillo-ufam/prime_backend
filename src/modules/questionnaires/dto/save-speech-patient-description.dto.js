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
exports.SaveSpeechPatientDescriptionDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var SaveSpeechPatientDescriptionDto = /** @class */ (function () {
    function SaveSpeechPatientDescriptionDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'Identificador do questionário',
            format: 'uuid',
        }),
        (0, class_validator_1.IsUUID)(),
        (0, class_validator_1.IsNotEmpty)(),
        __metadata("design:type", String)
    ], SaveSpeechPatientDescriptionDto.prototype, "questionnaireId", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({
            description: 'Descrição do paciente na avaliação da fala',
        }),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.IsOptional)(),
        __metadata("design:type", String)
    ], SaveSpeechPatientDescriptionDto.prototype, "speechPatientDescription", void 0);
    return SaveSpeechPatientDescriptionDto;
}());
exports.SaveSpeechPatientDescriptionDto = SaveSpeechPatientDescriptionDto;
