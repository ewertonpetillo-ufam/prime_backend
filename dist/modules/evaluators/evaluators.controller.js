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
exports.EvaluatorsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const evaluators_service_1 = require("./evaluators.service");
const create_evaluator_dto_1 = require("./dto/create-evaluator.dto");
const update_evaluator_dto_1 = require("./dto/update-evaluator.dto");
let EvaluatorsController = class EvaluatorsController {
    constructor(evaluatorsService) {
        this.evaluatorsService = evaluatorsService;
    }
    create(createEvaluatorDto) {
        return this.evaluatorsService.create(createEvaluatorDto);
    }
    findAll() {
        return this.evaluatorsService.findAll();
    }
    findOne(id) {
        return this.evaluatorsService.findOne(id);
    }
    update(id, updateEvaluatorDto) {
        return this.evaluatorsService.update(id, updateEvaluatorDto);
    }
    remove(id) {
        return this.evaluatorsService.remove(id);
    }
};
exports.EvaluatorsController = EvaluatorsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new evaluator' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Evaluator created successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email already registered' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_evaluator_dto_1.CreateEvaluatorDto]),
    __metadata("design:returntype", void 0)
], EvaluatorsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all evaluators' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of all evaluators',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EvaluatorsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get evaluator by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Evaluator UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Evaluator found',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Evaluator not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EvaluatorsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update evaluator' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Evaluator UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Evaluator updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Evaluator not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email already registered' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_evaluator_dto_1.UpdateEvaluatorDto]),
    __metadata("design:returntype", void 0)
], EvaluatorsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete evaluator' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Evaluator UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 204,
        description: 'Evaluator deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Evaluator not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EvaluatorsController.prototype, "remove", null);
exports.EvaluatorsController = EvaluatorsController = __decorate([
    (0, swagger_1.ApiTags)('Evaluators'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('evaluators'),
    __metadata("design:paramtypes", [evaluators_service_1.EvaluatorsService])
], EvaluatorsController);
//# sourceMappingURL=evaluators.controller.js.map