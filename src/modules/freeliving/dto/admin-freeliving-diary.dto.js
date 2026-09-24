"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.FreelivingDiaryEditorDto = exports.FreelivingDiaryListResponseDto = exports.FreelivingDiaryListItemDto = exports.FreelivingDiaryPatientSearchDto = exports.FreelivingClinicalMedicationDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var freeliving_overview_dto_1 = require("./freeliving-overview.dto");
var FreelivingClinicalMedicationDto = /** @class */ (function () {
    function FreelivingClinicalMedicationDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingClinicalMedicationDto.prototype, "name", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
        __metadata("design:type", Number)
    ], FreelivingClinicalMedicationDto.prototype, "doseMg", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
        __metadata("design:type", Number)
    ], FreelivingClinicalMedicationDto.prototype, "dosesPerDay", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingClinicalMedicationDto.prototype, "label", void 0);
    return FreelivingClinicalMedicationDto;
}());
exports.FreelivingClinicalMedicationDto = FreelivingClinicalMedicationDto;
var FreelivingDiaryPatientSearchDto = /** @class */ (function () {
    function FreelivingDiaryPatientSearchDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingDiaryPatientSearchDto.prototype, "patientId", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingDiaryPatientSearchDto.prototype, "fullName", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingDiaryPatientSearchDto.prototype, "cpf", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
        __metadata("design:type", String)
    ], FreelivingDiaryPatientSearchDto.prototype, "publicIdentifier", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({ type: [FreelivingClinicalMedicationDto] }),
        __metadata("design:type", Array)
    ], FreelivingDiaryPatientSearchDto.prototype, "medications", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'Quantidade de medicamentos além dos 5 slots M1–M5',
        }),
        __metadata("design:type", Number)
    ], FreelivingDiaryPatientSearchDto.prototype, "extraMedicationCount", void 0);
    return FreelivingDiaryPatientSearchDto;
}());
exports.FreelivingDiaryPatientSearchDto = FreelivingDiaryPatientSearchDto;
var FreelivingDiaryListItemDto = /** @class */ (function () {
    function FreelivingDiaryListItemDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingDiaryListItemDto.prototype, "id", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingDiaryListItemDto.prototype, "diaryDate", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Number)
    ], FreelivingDiaryListItemDto.prototype, "protocolDay", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingDiaryListItemDto.prototype, "status", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Number)
    ], FreelivingDiaryListItemDto.prototype, "gapCount", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Number)
    ], FreelivingDiaryListItemDto.prototype, "filledSectionCount", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Number)
    ], FreelivingDiaryListItemDto.prototype, "sectionCount", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Number)
    ], FreelivingDiaryListItemDto.prototype, "saveCount", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingDiaryListItemDto.prototype, "lastSavedAt", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({
            enum: ['app', 'admin'],
            description: 'Origem do registro: enviado pelo app de coleta ou digitado no painel',
        }),
        __metadata("design:type", String)
    ], FreelivingDiaryListItemDto.prototype, "source", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)(),
        __metadata("design:type", String)
    ], FreelivingDiaryListItemDto.prototype, "patientId", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)(),
        __metadata("design:type", String)
    ], FreelivingDiaryListItemDto.prototype, "patientName", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
        __metadata("design:type", String)
    ], FreelivingDiaryListItemDto.prototype, "publicIdentifier", void 0);
    return FreelivingDiaryListItemDto;
}());
exports.FreelivingDiaryListItemDto = FreelivingDiaryListItemDto;
var FreelivingDiaryListResponseDto = /** @class */ (function () {
    function FreelivingDiaryListResponseDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)({ type: [FreelivingDiaryListItemDto] }),
        __metadata("design:type", Array)
    ], FreelivingDiaryListResponseDto.prototype, "items", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Number)
    ], FreelivingDiaryListResponseDto.prototype, "total", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Number)
    ], FreelivingDiaryListResponseDto.prototype, "page", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Number)
    ], FreelivingDiaryListResponseDto.prototype, "pageSize", void 0);
    return FreelivingDiaryListResponseDto;
}());
exports.FreelivingDiaryListResponseDto = FreelivingDiaryListResponseDto;
var FreelivingDiaryEditorDto = /** @class */ (function (_super) {
    __extends(FreelivingDiaryEditorDto, _super);
    function FreelivingDiaryEditorDto() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingDiaryEditorDto.prototype, "patientId", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingDiaryEditorDto.prototype, "patientName", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
        __metadata("design:type", String)
    ], FreelivingDiaryEditorDto.prototype, "publicIdentifier", void 0);
    return FreelivingDiaryEditorDto;
}(freeliving_overview_dto_1.FreelivingDiaryDto));
exports.FreelivingDiaryEditorDto = FreelivingDiaryEditorDto;
