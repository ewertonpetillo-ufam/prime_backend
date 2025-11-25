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
exports.PdfReportsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const pdf_reports_service_1 = require("./pdf-reports.service");
const upload_pdf_report_dto_1 = require("./dto/upload-pdf-report.dto");
const user_decorator_1 = require("../../common/decorators/user.decorator");
let PdfReportsController = class PdfReportsController {
    constructor(pdfReportsService) {
        this.pdfReportsService = pdfReportsService;
    }
    async uploadReport(dto, file, user) {
        return this.pdfReportsService.uploadReport(dto, file, user?.userId);
    }
    async downloadReport(id, res) {
        const report = await this.pdfReportsService.getReportById(id);
        const mimeType = report.mime_type || 'application/pdf';
        const dispositionFileName = encodeURIComponent(report.file_name || 'relatorio.pdf');
        res.set({
            'Content-Type': mimeType,
            'Content-Disposition': `attachment; filename="${dispositionFileName}"`,
        });
        if (report.file_size_bytes) {
            res.set('Content-Length', report.file_size_bytes.toString());
        }
        res.send(report.file_data ?? Buffer.from([]));
    }
};
exports.PdfReportsController = PdfReportsController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload de relatório PDF',
        description: 'Armazena um relatório PDF associado a um questionário',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                questionnaireId: { type: 'string', format: 'uuid' },
                reportType: {
                    type: 'string',
                    enum: ['BIOBIT', 'DELSYS', 'POLYSOMNOGRAPHY', 'OTHER'],
                },
                notes: { type: 'string' },
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
            required: ['questionnaireId', 'reportType', 'file'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Relatório salvo com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Arquivo inválido' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upload_pdf_report_dto_1.UploadPdfReportDto, Object, Object]),
    __metadata("design:returntype", Promise)
], PdfReportsController.prototype, "uploadReport", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Download de relatório PDF',
        description: 'Retorna o arquivo PDF original para download',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Relatório retornado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Relatório não encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PdfReportsController.prototype, "downloadReport", null);
exports.PdfReportsController = PdfReportsController = __decorate([
    (0, swagger_1.ApiTags)('PDF Reports'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('pdf-reports'),
    __metadata("design:paramtypes", [pdf_reports_service_1.PdfReportsService])
], PdfReportsController);
//# sourceMappingURL=pdf-reports.controller.js.map