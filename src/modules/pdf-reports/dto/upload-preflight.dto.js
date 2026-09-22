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
exports.UploadPreflightDto = exports.PreflightFileItemDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_transformer_1 = require("class-transformer");
var class_validator_1 = require("class-validator");
var PreflightFileItemDto = /** @class */ (function () {
    function PreflightFileItemDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)({ example: 'emg-relatorio.pdf' }),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.IsNotEmpty)(),
        __metadata("design:type", String)
    ], PreflightFileItemDto.prototype, "fileName", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({ example: 134217728 }),
        (0, class_validator_1.IsInt)(),
        (0, class_validator_1.Min)(1),
        __metadata("design:type", Number)
    ], PreflightFileItemDto.prototype, "fileSizeBytes", void 0);
    return PreflightFileItemDto;
}());
exports.PreflightFileItemDto = PreflightFileItemDto;
var UploadPreflightDto = /** @class */ (function () {
    function UploadPreflightDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)({ format: 'uuid' }),
        (0, class_validator_1.IsUUID)(),
        __metadata("design:type", String)
    ], UploadPreflightDto.prototype, "questionnaireId", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({ enum: ['BIOBIT', 'DELSYS', 'POLYSOMNOGRAPHY', 'OTHER'] }),
        (0, class_validator_1.IsIn)(['BIOBIT', 'DELSYS', 'POLYSOMNOGRAPHY', 'OTHER']),
        __metadata("design:type", String)
    ], UploadPreflightDto.prototype, "reportType", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({ type: [PreflightFileItemDto] }),
        (0, class_validator_1.IsArray)(),
        (0, class_validator_1.ArrayMinSize)(1),
        (0, class_validator_1.ValidateNested)({ each: true }),
        (0, class_transformer_1.Type)(function () { return PreflightFileItemDto; }),
        __metadata("design:type", Array)
    ], UploadPreflightDto.prototype, "files", void 0);
    return UploadPreflightDto;
}());
exports.UploadPreflightDto = UploadPreflightDto;
