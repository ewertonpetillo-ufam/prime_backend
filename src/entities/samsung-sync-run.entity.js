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
exports.SamsungSyncRun = exports.SamsungSyncRunStatus = void 0;
var typeorm_1 = require("typeorm");
var samsung_sync_run_item_entity_1 = require("./samsung-sync-run-item.entity");
var SamsungSyncRunStatus;
(function (SamsungSyncRunStatus) {
    SamsungSyncRunStatus["RUNNING"] = "running";
    SamsungSyncRunStatus["SUCCESS"] = "success";
    SamsungSyncRunStatus["FAILED"] = "failed";
})(SamsungSyncRunStatus || (exports.SamsungSyncRunStatus = SamsungSyncRunStatus = {}));
var SamsungSyncRun = /** @class */ (function () {
    function SamsungSyncRun() {
    }
    __decorate([
        (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
        __metadata("design:type", String)
    ], SamsungSyncRun.prototype, "id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: SamsungSyncRunStatus.RUNNING }),
        __metadata("design:type", String)
    ], SamsungSyncRun.prototype, "status", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
        __metadata("design:type", String)
    ], SamsungSyncRun.prototype, "triggered_by_user_id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 30, default: 'manual' }),
        __metadata("design:type", String)
    ], SamsungSyncRun.prototype, "trigger_type", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'timestamptz', default: function () { return 'CURRENT_TIMESTAMP'; } }),
        __metadata("design:type", Date)
    ], SamsungSyncRun.prototype, "started_at", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
        __metadata("design:type", Date)
    ], SamsungSyncRun.prototype, "finished_at", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', default: 0 }),
        __metadata("design:type", Number)
    ], SamsungSyncRun.prototype, "total_patients", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', default: 0 }),
        __metadata("design:type", Number)
    ], SamsungSyncRun.prototype, "synced_patients", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', default: 0 }),
        __metadata("design:type", Number)
    ], SamsungSyncRun.prototype, "errored_patients", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', default: 0 }),
        __metadata("design:type", Number)
    ], SamsungSyncRun.prototype, "uploaded_files", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', default: 0 }),
        __metadata("design:type", Number)
    ], SamsungSyncRun.prototype, "skipped_files", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', default: 0 }),
        __metadata("design:type", Number)
    ], SamsungSyncRun.prototype, "deleted_files", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', default: 0 }),
        __metadata("design:type", Number)
    ], SamsungSyncRun.prototype, "error_files", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'jsonb', default: '{}' }),
        __metadata("design:type", Object)
    ], SamsungSyncRun.prototype, "summary", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'text', nullable: true }),
        __metadata("design:type", String)
    ], SamsungSyncRun.prototype, "error_message", void 0);
    __decorate([
        (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz', default: function () { return 'CURRENT_TIMESTAMP'; } }),
        __metadata("design:type", Date)
    ], SamsungSyncRun.prototype, "created_at", void 0);
    __decorate([
        (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz', default: function () { return 'CURRENT_TIMESTAMP'; } }),
        __metadata("design:type", Date)
    ], SamsungSyncRun.prototype, "updated_at", void 0);
    __decorate([
        (0, typeorm_1.OneToMany)(function () { return samsung_sync_run_item_entity_1.SamsungSyncRunItem; }, function (item) { return item.run; }),
        __metadata("design:type", Array)
    ], SamsungSyncRun.prototype, "items", void 0);
    SamsungSyncRun = __decorate([
        (0, typeorm_1.Entity)('samsung_sync_runs')
    ], SamsungSyncRun);
    return SamsungSyncRun;
}());
exports.SamsungSyncRun = SamsungSyncRun;
