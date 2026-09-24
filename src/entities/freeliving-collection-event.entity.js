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
exports.FreelivingCollectionEvent = void 0;
var typeorm_1 = require("typeorm");
var patient_entity_1 = require("./patient.entity");
var freeliving_action_type_entity_1 = require("./freeliving-action-type.entity");
var FreelivingCollectionEvent = /** @class */ (function () {
    function FreelivingCollectionEvent() {
    }
    __decorate([
        (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
        __metadata("design:type", String)
    ], FreelivingCollectionEvent.prototype, "id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'uuid' }),
        __metadata("design:type", String)
    ], FreelivingCollectionEvent.prototype, "patient_id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 128 }),
        __metadata("design:type", String)
    ], FreelivingCollectionEvent.prototype, "patient_cpf_hash", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 64 }),
        __metadata("design:type", String)
    ], FreelivingCollectionEvent.prototype, "action_code", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
        __metadata("design:type", String)
    ], FreelivingCollectionEvent.prototype, "task_code", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'timestamptz' }),
        __metadata("design:type", Date)
    ], FreelivingCollectionEvent.prototype, "occurred_at", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'timestamptz', default: function () { return 'CURRENT_TIMESTAMP'; } }),
        __metadata("design:type", Date)
    ], FreelivingCollectionEvent.prototype, "received_at", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'date' }),
        __metadata("design:type", String)
    ], FreelivingCollectionEvent.prototype, "collection_date", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'uuid', nullable: true, unique: true }),
        __metadata("design:type", String)
    ], FreelivingCollectionEvent.prototype, "client_event_id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 40, default: 'collection_app' }),
        __metadata("design:type", String)
    ], FreelivingCollectionEvent.prototype, "source", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
        __metadata("design:type", String)
    ], FreelivingCollectionEvent.prototype, "device_type", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
        __metadata("design:type", String)
    ], FreelivingCollectionEvent.prototype, "device_model", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 80, nullable: true }),
        __metadata("design:type", String)
    ], FreelivingCollectionEvent.prototype, "os_version", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 80, nullable: true }),
        __metadata("design:type", String)
    ], FreelivingCollectionEvent.prototype, "app_version", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'jsonb', default: '{}' }),
        __metadata("design:type", Object)
    ], FreelivingCollectionEvent.prototype, "metadata", void 0);
    __decorate([
        (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz', default: function () { return 'CURRENT_TIMESTAMP'; } }),
        __metadata("design:type", Date)
    ], FreelivingCollectionEvent.prototype, "created_at", void 0);
    __decorate([
        (0, typeorm_1.ManyToOne)(function () { return patient_entity_1.Patient; }, { onDelete: 'CASCADE' }),
        (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
        __metadata("design:type", patient_entity_1.Patient)
    ], FreelivingCollectionEvent.prototype, "patient", void 0);
    __decorate([
        (0, typeorm_1.ManyToOne)(function () { return freeliving_action_type_entity_1.FreelivingActionType; }),
        (0, typeorm_1.JoinColumn)({ name: 'action_code' }),
        __metadata("design:type", freeliving_action_type_entity_1.FreelivingActionType)
    ], FreelivingCollectionEvent.prototype, "action_type", void 0);
    FreelivingCollectionEvent = __decorate([
        (0, typeorm_1.Entity)('freeliving_collection_events')
    ], FreelivingCollectionEvent);
    return FreelivingCollectionEvent;
}());
exports.FreelivingCollectionEvent = FreelivingCollectionEvent;
