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
exports.CreateFreelivingEventDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var CreateFreelivingEventDto = /** @class */ (function () {
    function CreateFreelivingEventDto() {
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
    ], CreateFreelivingEventDto.prototype, "patient_cpf", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'Código da ação (catálogo freeliving_action_types)',
            example: 'collection_started',
        }),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.IsNotEmpty)(),
        (0, class_validator_1.MaxLength)(64),
        __metadata("design:type", String)
    ], CreateFreelivingEventDto.prototype, "action_code", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({
            description: 'Contexto opcional da ação (ex.: FL01, FL02). Omitir quando a ação não estiver ligada a uma tarefa ativa.',
            example: 'FL01',
        }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MaxLength)(20),
        __metadata("design:type", String)
    ], CreateFreelivingEventDto.prototype, "task_code", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({
            description: 'Instante da ação no dispositivo (ISO-8601). Default: agora no servidor.',
            example: '2026-09-01T18:30:00.000Z',
        }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsDateString)(),
        __metadata("design:type", String)
    ], CreateFreelivingEventDto.prototype, "occurred_at", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({
            description: 'UUID gerado pelo app para retries idempotentes',
            example: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
        }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsUUID)(),
        __metadata("design:type", String)
    ], CreateFreelivingEventDto.prototype, "client_event_id", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ example: 'smartphone' }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MaxLength)(100),
        __metadata("design:type", String)
    ], CreateFreelivingEventDto.prototype, "device_type", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ example: 'Galaxy Watch 6' }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MaxLength)(100),
        __metadata("design:type", String)
    ], CreateFreelivingEventDto.prototype, "device_model", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ example: 'Android 14' }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MaxLength)(80),
        __metadata("design:type", String)
    ], CreateFreelivingEventDto.prototype, "os_version", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ example: '1.4.0' }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MaxLength)(80),
        __metadata("design:type", String)
    ], CreateFreelivingEventDto.prototype, "app_version", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({
            description: 'Payload extra para ações futuras',
            type: Object,
        }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsObject)(),
        __metadata("design:type", Object)
    ], CreateFreelivingEventDto.prototype, "metadata", void 0);
    return CreateFreelivingEventDto;
}());
exports.CreateFreelivingEventDto = CreateFreelivingEventDto;
