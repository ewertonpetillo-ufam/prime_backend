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
exports.QuestionnairesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const questionnaires_service_1 = require("./questionnaires.service");
const save_step1_dto_1 = require("./dto/save-step1.dto");
const save_step2_dto_1 = require("./dto/save-step2.dto");
const save_step3_dto_1 = require("./dto/save-step3.dto");
const save_updrs3_dto_1 = require("./dto/save-updrs3.dto");
const save_meem_dto_1 = require("./dto/save-meem.dto");
const save_udysrs_dto_1 = require("./dto/save-udysrs.dto");
const save_stopbang_dto_1 = require("./dto/save-stopbang.dto");
const save_epworth_dto_1 = require("./dto/save-epworth.dto");
const save_pdss2_dto_1 = require("./dto/save-pdss2.dto");
const save_rbdsq_dto_1 = require("./dto/save-rbdsq.dto");
const save_fogq_dto_1 = require("./dto/save-fogq.dto");
const user_decorator_1 = require("../../common/decorators/user.decorator");
let QuestionnairesController = class QuestionnairesController {
    constructor(questionnairesService) {
        this.questionnairesService = questionnairesService;
    }
    async saveStep1(dto, user) {
        return this.questionnairesService.saveStep1(dto, user.userId);
    }
    async saveStep2(dto) {
        return this.questionnairesService.saveStep2(dto);
    }
    async saveStep3(dto) {
        return this.questionnairesService.saveStep3(dto);
    }
    async saveUpdrs3(dto) {
        return this.questionnairesService.saveUpdrs3Scores(dto);
    }
    async saveMeem(dto) {
        return this.questionnairesService.saveMeemScores(dto);
    }
    async saveUdysrs(dto) {
        return this.questionnairesService.saveUdysrsScores(dto);
    }
    async saveStopbang(dto) {
        return this.questionnairesService.saveStopbangScores(dto);
    }
    async saveEpworth(dto) {
        return this.questionnairesService.saveEpworthScores(dto);
    }
    async savePdss2(dto) {
        return this.questionnairesService.savePdss2Scores(dto);
    }
    async saveRbdsq(dto) {
        return this.questionnairesService.saveRbdsqScores(dto);
    }
    async saveFogq(dto) {
        return this.questionnairesService.saveFogqScores(dto);
    }
    async getReferenceData() {
        return this.questionnairesService.getReferenceData();
    }
    async searchQuestionnaires(term) {
        return this.questionnairesService.searchQuestionnaires(term);
    }
    async getQuestionnaireById(id) {
        return this.questionnairesService.getQuestionnaireById(id);
    }
    async finalizeQuestionnaire(id) {
        return this.questionnairesService.finalizeQuestionnaire(id);
    }
    async exportQuestionnaireData(id) {
        return this.questionnairesService.exportQuestionnaireData(id);
    }
    async exportPatientData(patientId) {
        return this.questionnairesService.exportPatientData(patientId);
    }
    async exportAllQuestionnairesData() {
        return this.questionnairesService.exportAllQuestionnairesData();
    }
};
exports.QuestionnairesController = QuestionnairesController;
__decorate([
    (0, common_1.Post)('step1'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Save Step 1 - Demographic data',
        description: 'Creates or updates patient and questionnaire with demographic data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Step 1 data saved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid data',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [save_step1_dto_1.SaveStep1Dto, Object]),
    __metadata("design:returntype", Promise)
], QuestionnairesController.prototype, "saveStep1", null);
__decorate([
    (0, common_1.Post)('step2'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Save Step 2 - Anthropometric data',
        description: 'Saves anthropometric measurements for a questionnaire',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Step 2 data saved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Questionnaire not found',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [save_step2_dto_1.SaveStep2Dto]),
    __metadata("design:returntype", Promise)
], QuestionnairesController.prototype, "saveStep2", null);
__decorate([
    (0, common_1.Post)('step3'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Save Step 3 - Clinical data',
        description: 'Saves clinical assessment data for a questionnaire',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Step 3 data saved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Questionnaire not found',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [save_step3_dto_1.SaveStep3Dto]),
    __metadata("design:returntype", Promise)
], QuestionnairesController.prototype, "saveStep3", null);
__decorate([
    (0, common_1.Post)('updrs3'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Salvar protocolo MDS-UPDRS Parte III',
        description: 'Persiste as pontuações motoras do protocolo UPDRS-III para um questionário',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Pontuações UPDRS-III salvas com sucesso',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Questionário não encontrado',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [save_updrs3_dto_1.SaveUpdrs3Dto]),
    __metadata("design:returntype", Promise)
], QuestionnairesController.prototype, "saveUpdrs3", null);
__decorate([
    (0, common_1.Post)('meem'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Salvar protocolo MEEM',
        description: 'Persiste as pontuações do Mini Exame do Estado Mental',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Pontuações MEEM salvas com sucesso',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Questionário não encontrado',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [save_meem_dto_1.SaveMeemDto]),
    __metadata("design:returntype", Promise)
], QuestionnairesController.prototype, "saveMeem", null);
__decorate([
    (0, common_1.Post)('udysrs'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Salvar protocolo UDysRS',
        description: 'Persiste as pontuações da Escala Unificada para Avaliação de Discinesias',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Pontuações UDysRS salvas com sucesso',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Questionário não encontrado',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [save_udysrs_dto_1.SaveUdysrsDto]),
    __metadata("design:returntype", Promise)
], QuestionnairesController.prototype, "saveUdysrs", null);
__decorate([
    (0, common_1.Post)('stopbang'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Salvar protocolo STOP-Bang',
        description: 'Persiste as pontuações do questionário STOP-Bang',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Pontuações STOP-Bang salvas com sucesso',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Questionário não encontrado',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [save_stopbang_dto_1.SaveStopbangDto]),
    __metadata("design:returntype", Promise)
], QuestionnairesController.prototype, "saveStopbang", null);
__decorate([
    (0, common_1.Post)('epworth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Salvar escala de Sonolência de Epworth',
        description: 'Persiste as respostas da escala Epworth',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Pontuações Epworth salvas com sucesso',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Questionário não encontrado',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [save_epworth_dto_1.SaveEpworthDto]),
    __metadata("design:returntype", Promise)
], QuestionnairesController.prototype, "saveEpworth", null);
__decorate([
    (0, common_1.Post)('pdss2'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Salvar protocolo PDSS-2',
        description: 'Persiste as respostas da Parkinson Disease Sleep Scale 2',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Pontuações PDSS-2 salvas com sucesso',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Questionário não encontrado',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [save_pdss2_dto_1.SavePdss2Dto]),
    __metadata("design:returntype", Promise)
], QuestionnairesController.prototype, "savePdss2", null);
__decorate([
    (0, common_1.Post)('rbdsq'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Salvar protocolo RBDSQ',
        description: 'Persiste as respostas do questionário REM Behavior Disorder Screening',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Pontuações RBDSQ salvas com sucesso',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Questionário não encontrado',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [save_rbdsq_dto_1.SaveRbdsqDto]),
    __metadata("design:returntype", Promise)
], QuestionnairesController.prototype, "saveRbdsq", null);
__decorate([
    (0, common_1.Post)('fogq'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Salvar protocolo FOGQ',
        description: 'Persiste as respostas do Freezing of Gait Questionnaire',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Pontuações FOGQ salvas com sucesso',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Questionário não encontrado',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [save_fogq_dto_1.SaveFogqDto]),
    __metadata("design:returntype", Promise)
], QuestionnairesController.prototype, "saveFogq", null);
__decorate([
    (0, common_1.Get)('reference-data'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get reference data for questionnaires',
        description: 'Returns all reference data needed for questionnaire forms (genders, ethnicities, education levels, etc.)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Reference data retrieved successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QuestionnairesController.prototype, "getReferenceData", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Search questionnaires',
        description: 'Search questionnaires by patient name or CPF',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Questionnaires found successfully',
    }),
    __param(0, (0, common_1.Query)('term')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuestionnairesController.prototype, "searchQuestionnaires", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get questionnaire by ID',
        description: 'Returns a complete questionnaire with all related data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Questionnaire found successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Questionnaire not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuestionnairesController.prototype, "getQuestionnaireById", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Finalize questionnaire',
        description: 'Updates questionnaire status to completed',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Questionnaire finalized successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Questionnaire not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuestionnairesController.prototype, "finalizeQuestionnaire", null);
__decorate([
    (0, common_1.Get)(':id/export'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Export questionnaire data',
        description: 'Returns complete questionnaire data with all related information including binary collections',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Questionnaire data exported successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Questionnaire not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuestionnairesController.prototype, "exportQuestionnaireData", null);
__decorate([
    (0, common_1.Get)('patient/:patientId/export'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Export all patient data',
        description: 'Returns all questionnaires and binary collections for a specific patient',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Patient data exported successfully',
    }),
    __param(0, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuestionnairesController.prototype, "exportPatientData", null);
__decorate([
    (0, common_1.Get)('export/all'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Export all questionnaires data',
        description: 'Returns all questionnaires with all related data including binary collections',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'All questionnaires data exported successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QuestionnairesController.prototype, "exportAllQuestionnairesData", null);
exports.QuestionnairesController = QuestionnairesController = __decorate([
    (0, swagger_1.ApiTags)('Questionnaires'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('questionnaires'),
    __metadata("design:paramtypes", [questionnaires_service_1.QuestionnairesService])
], QuestionnairesController);
//# sourceMappingURL=questionnaires.controller.js.map