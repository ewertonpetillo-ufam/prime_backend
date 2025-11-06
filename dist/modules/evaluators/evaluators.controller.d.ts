import { EvaluatorsService } from './evaluators.service';
import { CreateEvaluatorDto } from './dto/create-evaluator.dto';
import { UpdateEvaluatorDto } from './dto/update-evaluator.dto';
export declare class EvaluatorsController {
    private readonly evaluatorsService;
    constructor(evaluatorsService: EvaluatorsService);
    create(createEvaluatorDto: CreateEvaluatorDto): Promise<import("../../entities/evaluator.entity").Evaluator>;
    findAll(): Promise<import("../../entities/evaluator.entity").Evaluator[]>;
    findOne(id: string): Promise<import("../../entities/evaluator.entity").Evaluator>;
    update(id: string, updateEvaluatorDto: UpdateEvaluatorDto): Promise<import("../../entities/evaluator.entity").Evaluator>;
    remove(id: string): Promise<void>;
}
