import { PartialType } from '@nestjs/swagger';
import { CreateEvaluatorDto } from './create-evaluator.dto';

export class UpdateEvaluatorDto extends PartialType(CreateEvaluatorDto) {}
