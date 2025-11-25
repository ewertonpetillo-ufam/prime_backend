"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfReportsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const pdf_reports_controller_1 = require("./pdf-reports.controller");
const pdf_reports_service_1 = require("./pdf-reports.service");
const pdf_report_entity_1 = require("../../entities/pdf-report.entity");
const questionnaire_entity_1 = require("../../entities/questionnaire.entity");
let PdfReportsModule = class PdfReportsModule {
};
exports.PdfReportsModule = PdfReportsModule;
exports.PdfReportsModule = PdfReportsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([pdf_report_entity_1.PdfReport, questionnaire_entity_1.Questionnaire])],
        controllers: [pdf_reports_controller_1.PdfReportsController],
        providers: [pdf_reports_service_1.PdfReportsService],
        exports: [pdf_reports_service_1.PdfReportsService],
    })
], PdfReportsModule);
//# sourceMappingURL=pdf-reports.module.js.map