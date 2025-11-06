"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEvaluatorDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_evaluator_dto_1 = require("./create-evaluator.dto");
class UpdateEvaluatorDto extends (0, swagger_1.PartialType)(create_evaluator_dto_1.CreateEvaluatorDto) {
}
exports.UpdateEvaluatorDto = UpdateEvaluatorDto;
//# sourceMappingURL=update-evaluator.dto.js.map