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
exports.AdminUpsertFreelivingDiaryDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var class_transformer_1 = require("class-transformer");
var AdminUpsertFreelivingDiaryDto = /** @class */ (function () {
    function AdminUpsertFreelivingDiaryDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'UUID do paciente' }),
        (0, class_validator_1.IsUUID)(),
        __metadata("design:type", String)
    ], AdminUpsertFreelivingDiaryDto.prototype, "patientId", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'Dia do protocolo FreeLiving (1 a 7)',
            example: 1,
            minimum: 1,
            maximum: 7,
        }),
        (0, class_transformer_1.Type)(function () { return Number; }),
        (0, class_validator_1.IsInt)(),
        (0, class_validator_1.Min)(1),
        (0, class_validator_1.Max)(7),
        __metadata("design:type", Number)
    ], AdminUpsertFreelivingDiaryDto.prototype, "protocol_day", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'Data civil do diário (YYYY-MM-DD, America/Sao_Paulo)',
            example: '2026-09-14',
        }),
        (0, class_validator_1.IsDateString)(),
        __metadata("design:type", String)
    ], AdminUpsertFreelivingDiaryDto.prototype, "diary_date", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'Snapshot das 4 seções do diário. Chaves em inglês.',
            type: Object,
        }),
        (0, class_validator_1.IsObject)(),
        __metadata("design:type", Object)
    ], AdminUpsertFreelivingDiaryDto.prototype, "payload", void 0);
    return AdminUpsertFreelivingDiaryDto;
}());
exports.AdminUpsertFreelivingDiaryDto = AdminUpsertFreelivingDiaryDto;
