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
exports.PdfReport = void 0;
var typeorm_1 = require("typeorm");
var questionnaire_entity_1 = require("./questionnaire.entity");
var PdfReport = /** @class */ (function () {
    function PdfReport() {
    }
    __decorate([
        (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
        __metadata("design:type", String)
    ], PdfReport.prototype, "id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'uuid' }),
        __metadata("design:type", String)
    ], PdfReport.prototype, "questionnaire_id", void 0);
    __decorate([
        (0, typeorm_1.Column)({
            type: 'varchar',
            length: 50,
        }),
        __metadata("design:type", String)
    ], PdfReport.prototype, "report_type", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
        __metadata("design:type", String)
    ], PdfReport.prototype, "file_path", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'bytea', nullable: true, select: false }),
        __metadata("design:type", Buffer)
    ], PdfReport.prototype, "file_data", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
        __metadata("design:type", String)
    ], PdfReport.prototype, "file_name", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Number)
    ], PdfReport.prototype, "file_size_bytes", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 100, default: 'application/pdf' }),
        __metadata("design:type", String)
    ], PdfReport.prototype, "mime_type", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
        __metadata("design:type", String)
    ], PdfReport.prototype, "uploaded_by", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'timestamp', default: function () { return 'CURRENT_TIMESTAMP'; } }),
        __metadata("design:type", Date)
    ], PdfReport.prototype, "uploaded_at", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', default: true }),
        __metadata("design:type", Boolean)
    ], PdfReport.prototype, "file_sync_pending", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
        __metadata("design:type", Date)
    ], PdfReport.prototype, "file_synced_at", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'text', nullable: true }),
        __metadata("design:type", String)
    ], PdfReport.prototype, "notes", void 0);
    __decorate([
        (0, typeorm_1.ManyToOne)(function () { return questionnaire_entity_1.Questionnaire; }, function (q) { return q.pdf_reports; }, { onDelete: 'CASCADE' }),
        (0, typeorm_1.JoinColumn)({ name: 'questionnaire_id' }),
        __metadata("design:type", questionnaire_entity_1.Questionnaire)
    ], PdfReport.prototype, "questionnaire", void 0);
    PdfReport = __decorate([
        (0, typeorm_1.Entity)('pdf_reports')
    ], PdfReport);
    return PdfReport;
}());
exports.PdfReport = PdfReport;
