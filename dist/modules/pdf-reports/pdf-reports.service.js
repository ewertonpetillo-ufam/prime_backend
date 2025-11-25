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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pdf_report_entity_1 = require("../../entities/pdf-report.entity");
const questionnaire_entity_1 = require("../../entities/questionnaire.entity");
let PdfReportsService = class PdfReportsService {
    constructor(pdfReportRepository, questionnaireRepository) {
        this.pdfReportRepository = pdfReportRepository;
        this.questionnaireRepository = questionnaireRepository;
    }
    async uploadReport(dto, file, uploadedBy) {
        if (!file) {
            throw new common_1.BadRequestException('Arquivo PDF é obrigatório');
        }
        const questionnaire = await this.questionnaireRepository.findOne({
            where: { id: dto.questionnaireId },
        });
        if (!questionnaire) {
            throw new common_1.NotFoundException(`Questionnaire with ID ${dto.questionnaireId} not found`);
        }
        const pdfReport = this.pdfReportRepository.create({
            questionnaire_id: dto.questionnaireId,
            report_type: dto.reportType,
            file_name: file.originalname,
            file_size_bytes: file.size,
            mime_type: file.mimetype || 'application/pdf',
            file_data: file.buffer,
            notes: dto.notes || null,
            uploaded_by: uploadedBy || null,
        });
        return this.pdfReportRepository.save(pdfReport);
    }
    async getReportById(id) {
        const report = await this.pdfReportRepository
            .createQueryBuilder('report')
            .addSelect('report.file_data')
            .where('report.id = :id', { id })
            .getOne();
        if (!report) {
            throw new common_1.NotFoundException(`Relatório com ID ${id} não encontrado`);
        }
        return report;
    }
};
exports.PdfReportsService = PdfReportsService;
exports.PdfReportsService = PdfReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pdf_report_entity_1.PdfReport)),
    __param(1, (0, typeorm_1.InjectRepository)(questionnaire_entity_1.Questionnaire)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PdfReportsService);
//# sourceMappingURL=pdf-reports.service.js.map