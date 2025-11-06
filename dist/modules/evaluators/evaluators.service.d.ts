import { Repository } from 'typeorm';
import { Evaluator } from '../../entities/evaluator.entity';
import { CreateEvaluatorDto } from './dto/create-evaluator.dto';
import { UpdateEvaluatorDto } from './dto/update-evaluator.dto';
export declare class EvaluatorsService {
    private evaluatorsRepository;
    constructor(evaluatorsRepository: Repository<Evaluator>);
    create(createEvaluatorDto: CreateEvaluatorDto): Promise<Evaluator>;
    findAll(): Promise<Evaluator[]>;
    findOne(id: string): Promise<Evaluator>;
    update(id: string, updateEvaluatorDto: UpdateEvaluatorDto): Promise<Evaluator>;
    remove(id: string): Promise<void>;
}
