"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluatorsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const evaluators_service_1 = require("./evaluators.service");
const evaluators_controller_1 = require("./evaluators.controller");
const evaluator_entity_1 = require("../../entities/evaluator.entity");
let EvaluatorsModule = class EvaluatorsModule {
};
exports.EvaluatorsModule = EvaluatorsModule;
exports.EvaluatorsModule = EvaluatorsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([evaluator_entity_1.Evaluator])],
        controllers: [evaluators_controller_1.EvaluatorsController],
        providers: [evaluators_service_1.EvaluatorsService],
        exports: [evaluators_service_1.EvaluatorsService],
    })
], EvaluatorsModule);
//# sourceMappingURL=evaluators.module.js.map