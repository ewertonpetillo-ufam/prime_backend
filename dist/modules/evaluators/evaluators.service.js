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
exports.EvaluatorsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const evaluator_entity_1 = require("../../entities/evaluator.entity");
let EvaluatorsService = class EvaluatorsService {
    constructor(evaluatorsRepository) {
        this.evaluatorsRepository = evaluatorsRepository;
    }
    async create(createEvaluatorDto) {
        if (createEvaluatorDto.email) {
            const existing = await this.evaluatorsRepository.findOne({
                where: { email: createEvaluatorDto.email },
            });
            if (existing) {
                throw new common_1.ConflictException('Email already registered');
            }
        }
        const evaluator = this.evaluatorsRepository.create(createEvaluatorDto);
        return this.evaluatorsRepository.save(evaluator);
    }
    async findAll() {
        return this.evaluatorsRepository.find({
            order: { full_name: 'ASC' },
        });
    }
    async findOne(id) {
        const evaluator = await this.evaluatorsRepository.findOne({
            where: { id },
        });
        if (!evaluator) {
            throw new common_1.NotFoundException(`Evaluator with ID ${id} not found`);
        }
        return evaluator;
    }
    async update(id, updateEvaluatorDto) {
        const evaluator = await this.findOne(id);
        if (updateEvaluatorDto.email &&
            updateEvaluatorDto.email !== evaluator.email) {
            const existing = await this.evaluatorsRepository.findOne({
                where: { email: updateEvaluatorDto.email },
            });
            if (existing) {
                throw new common_1.ConflictException('Email already registered');
            }
        }
        Object.assign(evaluator, updateEvaluatorDto);
        return this.evaluatorsRepository.save(evaluator);
    }
    async remove(id) {
        const evaluator = await this.findOne(id);
        await this.evaluatorsRepository.remove(evaluator);
    }
};
exports.EvaluatorsService = EvaluatorsService;
exports.EvaluatorsService = EvaluatorsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(evaluator_entity_1.Evaluator)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EvaluatorsService);
//# sourceMappingURL=evaluators.service.js.map