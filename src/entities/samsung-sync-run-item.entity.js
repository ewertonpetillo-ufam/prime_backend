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
exports.SamsungSyncRunItem = exports.SamsungSyncItemAction = void 0;
var typeorm_1 = require("typeorm");
var samsung_sync_run_entity_1 = require("./samsung-sync-run.entity");
var SamsungSyncItemAction;
(function (SamsungSyncItemAction) {
    SamsungSyncItemAction["UPLOAD"] = "upload";
    SamsungSyncItemAction["SKIP"] = "skip";
    SamsungSyncItemAction["DELETE"] = "delete";
    SamsungSyncItemAction["ERROR"] = "error";
    SamsungSyncItemAction["METADATA"] = "metadata";
})(SamsungSyncItemAction || (exports.SamsungSyncItemAction = SamsungSyncItemAction = {}));
var SamsungSyncRunItem = /** @class */ (function () {
    function SamsungSyncRunItem() {
    }
    __decorate([
        (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
        __metadata("design:type", String)
    ], SamsungSyncRunItem.prototype, "id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'uuid' }),
        __metadata("design:type", String)
    ], SamsungSyncRunItem.prototype, "run_id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
        __metadata("design:type", String)
    ], SamsungSyncRunItem.prototype, "patient_id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
        __metadata("design:type", String)
    ], SamsungSyncRunItem.prototype, "binary_collection_id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
        __metadata("design:type", String)
    ], SamsungSyncRunItem.prototype, "action", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 120 }),
        __metadata("design:type", String)
    ], SamsungSyncRunItem.prototype, "artifact_repo", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'text' }),
        __metadata("design:type", String)
    ], SamsungSyncRunItem.prototype, "artifact_path", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'text', nullable: true }),
        __metadata("design:type", String)
    ], SamsungSyncRunItem.prototype, "sha256", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', default: false }),
        __metadata("design:type", Boolean)
    ], SamsungSyncRunItem.prototype, "uploaded", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'text', nullable: true }),
        __metadata("design:type", String)
    ], SamsungSyncRunItem.prototype, "message", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'text', nullable: true }),
        __metadata("design:type", String)
    ], SamsungSyncRunItem.prototype, "error_message", void 0);
    __decorate([
        (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz', default: function () { return 'CURRENT_TIMESTAMP'; } }),
        __metadata("design:type", Date)
    ], SamsungSyncRunItem.prototype, "created_at", void 0);
    __decorate([
        (0, typeorm_1.ManyToOne)(function () { return samsung_sync_run_entity_1.SamsungSyncRun; }, function (run) { return run.items; }, { onDelete: 'CASCADE' }),
        (0, typeorm_1.JoinColumn)({ name: 'run_id' }),
        __metadata("design:type", samsung_sync_run_entity_1.SamsungSyncRun)
    ], SamsungSyncRunItem.prototype, "run", void 0);
    SamsungSyncRunItem = __decorate([
        (0, typeorm_1.Entity)('samsung_sync_run_items')
    ], SamsungSyncRunItem);
    return SamsungSyncRunItem;
}());
exports.SamsungSyncRunItem = SamsungSyncRunItem;
