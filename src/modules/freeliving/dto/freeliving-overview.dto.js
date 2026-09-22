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
exports.FreelivingPatientDetailResponseDto = exports.FreelivingDiaryDto = exports.FreelivingFileDto = exports.FreelivingEventDto = exports.FreelivingOverviewResponseDto = exports.FreelivingOverviewMetaDto = exports.FreelivingOverviewRowDto = exports.FreelivingOverviewKpisDto = exports.FreelivingActionTypeDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var FreelivingActionTypeDto = /** @class */ (function () {
    function FreelivingActionTypeDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingActionTypeDto.prototype, "code", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingActionTypeDto.prototype, "label_pt", void 0);
    return FreelivingActionTypeDto;
}());
exports.FreelivingActionTypeDto = FreelivingActionTypeDto;
var FreelivingOverviewKpisDto = /** @class */ (function () {
    function FreelivingOverviewKpisDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Number)
    ], FreelivingOverviewKpisDto.prototype, "pacientesComAtividade", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Number)
    ], FreelivingOverviewKpisDto.prototype, "iniciaram", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Number)
    ], FreelivingOverviewKpisDto.prototype, "finalizaram", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Number)
    ], FreelivingOverviewKpisDto.prototype, "arquivosFl01", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Number)
    ], FreelivingOverviewKpisDto.prototype, "arquivosFl02", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Number)
    ], FreelivingOverviewKpisDto.prototype, "diariosEmPreenchimento", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Number)
    ], FreelivingOverviewKpisDto.prototype, "diariosCompletos", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
        __metadata("design:type", String)
    ], FreelivingOverviewKpisDto.prototype, "ultimoEventoRecebidoAt", void 0);
    return FreelivingOverviewKpisDto;
}());
exports.FreelivingOverviewKpisDto = FreelivingOverviewKpisDto;
var FreelivingOverviewRowDto = /** @class */ (function () {
    function FreelivingOverviewRowDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingOverviewRowDto.prototype, "patientId", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingOverviewRowDto.prototype, "patientLabel", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingOverviewRowDto.prototype, "patientName", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Dia civil America/Sao_Paulo (YYYY-MM-DD)' }),
        __metadata("design:type", String)
    ], FreelivingOverviewRowDto.prototype, "collectionDate", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({
            enum: ['sem_acao', 'iniciou', 'finalizou', 'iniciou_e_finalizou'],
        }),
        __metadata("design:type", String)
    ], FreelivingOverviewRowDto.prototype, "dayStatus", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
        __metadata("design:type", String)
    ], FreelivingOverviewRowDto.prototype, "firstStartedAt", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
        __metadata("design:type", String)
    ], FreelivingOverviewRowDto.prototype, "lastFinishedAt", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Number)
    ], FreelivingOverviewRowDto.prototype, "eventCount", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({
            enum: ['sem_acao', 'iniciou', 'finalizou', 'iniciou_e_finalizou'],
        }),
        __metadata("design:type", String)
    ], FreelivingOverviewRowDto.prototype, "fl01DayStatus", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({
            enum: ['sem_acao', 'iniciou', 'finalizou', 'iniciou_e_finalizou'],
        }),
        __metadata("design:type", String)
    ], FreelivingOverviewRowDto.prototype, "fl02DayStatus", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Number)
    ], FreelivingOverviewRowDto.prototype, "fl01FileCount", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
        __metadata("design:type", String)
    ], FreelivingOverviewRowDto.prototype, "fl01LastUploadedAt", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Number)
    ], FreelivingOverviewRowDto.prototype, "fl02FileCount", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
        __metadata("design:type", String)
    ], FreelivingOverviewRowDto.prototype, "fl02LastUploadedAt", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
        __metadata("design:type", String)
    ], FreelivingOverviewRowDto.prototype, "lastEventAt", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
        __metadata("design:type", String)
    ], FreelivingOverviewRowDto.prototype, "lastEventReceivedAt", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({
            enum: ['sem_registro', 'em_preenchimento', 'completo'],
        }),
        __metadata("design:type", String)
    ], FreelivingOverviewRowDto.prototype, "diaryStatus", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
        __metadata("design:type", Number)
    ], FreelivingOverviewRowDto.prototype, "diaryProtocolDay", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Number)
    ], FreelivingOverviewRowDto.prototype, "diarySaveCount", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Number)
    ], FreelivingOverviewRowDto.prototype, "diaryGapCount", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Number)
    ], FreelivingOverviewRowDto.prototype, "diaryFilledSectionCount", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
        __metadata("design:type", String)
    ], FreelivingOverviewRowDto.prototype, "diaryLastSavedAt", void 0);
    return FreelivingOverviewRowDto;
}());
exports.FreelivingOverviewRowDto = FreelivingOverviewRowDto;
var FreelivingOverviewMetaDto = /** @class */ (function () {
    function FreelivingOverviewMetaDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingOverviewMetaDto.prototype, "dateFrom", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingOverviewMetaDto.prototype, "dateTo", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingOverviewMetaDto.prototype, "generatedAt", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({ type: [FreelivingActionTypeDto] }),
        __metadata("design:type", Array)
    ], FreelivingOverviewMetaDto.prototype, "actionTypes", void 0);
    return FreelivingOverviewMetaDto;
}());
exports.FreelivingOverviewMetaDto = FreelivingOverviewMetaDto;
var FreelivingOverviewResponseDto = /** @class */ (function () {
    function FreelivingOverviewResponseDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", FreelivingOverviewKpisDto)
    ], FreelivingOverviewResponseDto.prototype, "kpis", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({ type: [FreelivingOverviewRowDto] }),
        __metadata("design:type", Array)
    ], FreelivingOverviewResponseDto.prototype, "rows", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", FreelivingOverviewMetaDto)
    ], FreelivingOverviewResponseDto.prototype, "meta", void 0);
    return FreelivingOverviewResponseDto;
}());
exports.FreelivingOverviewResponseDto = FreelivingOverviewResponseDto;
var FreelivingEventDto = /** @class */ (function () {
    function FreelivingEventDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingEventDto.prototype, "id", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingEventDto.prototype, "actionCode", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingEventDto.prototype, "actionLabel", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({
            nullable: true,
            description: 'Contexto opcional da ação (FL01, FL02 ou outro código). Nulo quando a ação não está ligada a uma tarefa.',
        }),
        __metadata("design:type", String)
    ], FreelivingEventDto.prototype, "taskCode", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingEventDto.prototype, "occurredAt", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingEventDto.prototype, "receivedAt", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingEventDto.prototype, "collectionDate", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
        __metadata("design:type", String)
    ], FreelivingEventDto.prototype, "deviceType", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
        __metadata("design:type", String)
    ], FreelivingEventDto.prototype, "deviceModel", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
        __metadata("design:type", String)
    ], FreelivingEventDto.prototype, "osVersion", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
        __metadata("design:type", String)
    ], FreelivingEventDto.prototype, "appVersion", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Object)
    ], FreelivingEventDto.prototype, "metadata", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingEventDto.prototype, "source", void 0);
    return FreelivingEventDto;
}());
exports.FreelivingEventDto = FreelivingEventDto;
var FreelivingFileDto = /** @class */ (function () {
    function FreelivingFileDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingFileDto.prototype, "id", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingFileDto.prototype, "taskCode", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingFileDto.prototype, "fileName", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Number)
    ], FreelivingFileDto.prototype, "fileSizeBytes", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingFileDto.prototype, "uploadedAt", void 0);
    return FreelivingFileDto;
}());
exports.FreelivingFileDto = FreelivingFileDto;
var FreelivingDiaryDto = /** @class */ (function () {
    function FreelivingDiaryDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingDiaryDto.prototype, "id", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingDiaryDto.prototype, "diaryDate", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Number)
    ], FreelivingDiaryDto.prototype, "protocolDay", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({ enum: ['rascunho', 'completo'] }),
        __metadata("design:type", String)
    ], FreelivingDiaryDto.prototype, "status", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Object)
    ], FreelivingDiaryDto.prototype, "payload", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({ type: [Object] }),
        __metadata("design:type", Array)
    ], FreelivingDiaryDto.prototype, "gaps", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Number)
    ], FreelivingDiaryDto.prototype, "gapCount", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Number)
    ], FreelivingDiaryDto.prototype, "filledSectionCount", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Number)
    ], FreelivingDiaryDto.prototype, "sectionCount", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", Number)
    ], FreelivingDiaryDto.prototype, "saveCount", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingDiaryDto.prototype, "firstSavedAt", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingDiaryDto.prototype, "lastSavedAt", void 0);
    return FreelivingDiaryDto;
}());
exports.FreelivingDiaryDto = FreelivingDiaryDto;
var FreelivingPatientDetailResponseDto = /** @class */ (function () {
    function FreelivingPatientDetailResponseDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingPatientDetailResponseDto.prototype, "patientId", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingPatientDetailResponseDto.prototype, "patientLabel", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingPatientDetailResponseDto.prototype, "patientName", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)(),
        __metadata("design:type", String)
    ], FreelivingPatientDetailResponseDto.prototype, "collectionDate", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({ type: [FreelivingEventDto] }),
        __metadata("design:type", Array)
    ], FreelivingPatientDetailResponseDto.prototype, "events", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({ type: [FreelivingFileDto] }),
        __metadata("design:type", Array)
    ], FreelivingPatientDetailResponseDto.prototype, "files", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ type: function () { return FreelivingDiaryDto; }, nullable: true }),
        __metadata("design:type", FreelivingDiaryDto)
    ], FreelivingPatientDetailResponseDto.prototype, "diary", void 0);
    return FreelivingPatientDetailResponseDto;
}());
exports.FreelivingPatientDetailResponseDto = FreelivingPatientDetailResponseDto;
