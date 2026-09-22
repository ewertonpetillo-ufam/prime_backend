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
exports.UpsertFreelivingDiaryDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var class_transformer_1 = require("class-transformer");
var UpsertFreelivingDiaryDto = /** @class */ (function () {
    function UpsertFreelivingDiaryDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'CPF do paciente (11 dígitos, com ou sem pontuação)',
            example: '12345678900',
        }),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.IsNotEmpty)(),
        (0, class_validator_1.MaxLength)(20),
        __metadata("design:type", String)
    ], UpsertFreelivingDiaryDto.prototype, "patient_cpf", void 0);
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
    ], UpsertFreelivingDiaryDto.prototype, "protocol_day", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({
            description: 'Data civil do diário (YYYY-MM-DD, America/Sao_Paulo). Default: hoje.',
            example: '2026-09-02',
        }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsDateString)(),
        __metadata("design:type", String)
    ], UpsertFreelivingDiaryDto.prototype, "diary_date", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({
            description: 'Instante do save no dispositivo (ISO-8601)',
            example: '2026-09-02T14:30:00.000Z',
        }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsDateString)(),
        __metadata("design:type", String)
    ], UpsertFreelivingDiaryDto.prototype, "occurred_at", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({
            description: 'UUID gerado pelo app para retries do mesmo documento',
            example: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
        }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsUUID)(),
        __metadata("design:type", String)
    ], UpsertFreelivingDiaryDto.prototype, "client_diary_id", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ example: 'smartphone' }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MaxLength)(100),
        __metadata("design:type", String)
    ], UpsertFreelivingDiaryDto.prototype, "device_type", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ example: 'Galaxy Watch 6' }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MaxLength)(100),
        __metadata("design:type", String)
    ], UpsertFreelivingDiaryDto.prototype, "device_model", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ example: 'Android 14' }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MaxLength)(80),
        __metadata("design:type", String)
    ], UpsertFreelivingDiaryDto.prototype, "os_version", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ example: '1.4.0' }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MaxLength)(80),
        __metadata("design:type", String)
    ], UpsertFreelivingDiaryDto.prototype, "app_version", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'Snapshot das 4 seções do diário. Seções omitidas preservam o valor já salvo. Chaves em inglês.',
            type: Object,
            example: {
                medication: {
                    labels: { m1: 'Levodopa', m2: null, m3: null, m4: null, m5: null },
                    doses: [
                        {
                            time: '08:00',
                            m1: true,
                            m2: false,
                            m3: false,
                            m4: false,
                            m5: false,
                            notes: null,
                        },
                    ],
                },
                activities: {
                    morning_hygiene: { time: '07:00', notes: null },
                    meal_1: { time: '08:00', notes: null },
                    short_walk: { time: '10:00', notes: null },
                    arms_extended_1: { time: '11:00', notes: null },
                    arms_extended_2: { time: '16:00', notes: null },
                },
                symptoms: {
                    tremor: { '06': 0, '07': 1 },
                    slowness: { '06': 0 },
                    dyskinesia: { '06': 0 },
                    walking: { '06': 0 },
                    freezing: { '06': 0 },
                },
                devices: {
                    watch_usage: 'all_day',
                    phone_nearby: 'yes',
                    watch_removed: { from: null, to: null, reason: null },
                    device_problem: false,
                    device_problem_detail: null,
                    charged_end_of_day: true,
                    sleep_with_smartwatch: true,
                    day_notes: null,
                },
            },
        }),
        (0, class_validator_1.IsObject)(),
        __metadata("design:type", Object)
    ], UpsertFreelivingDiaryDto.prototype, "payload", void 0);
    return UpsertFreelivingDiaryDto;
}());
exports.UpsertFreelivingDiaryDto = UpsertFreelivingDiaryDto;
