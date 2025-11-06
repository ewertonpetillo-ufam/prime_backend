import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evaluator } from '../../entities/evaluator.entity';
import { CreateEvaluatorDto } from './dto/create-evaluator.dto';
import { UpdateEvaluatorDto } from './dto/update-evaluator.dto';

@Injectable()
export class EvaluatorsService {
  constructor(
    @InjectRepository(Evaluator)
    private evaluatorsRepository: Repository<Evaluator>,
  ) {}

  async create(createEvaluatorDto: CreateEvaluatorDto): Promise<Evaluator> {
    // Check if email already exists
    if (createEvaluatorDto.email) {
      const existing = await this.evaluatorsRepository.findOne({
        where: { email: createEvaluatorDto.email },
      });

      if (existing) {
        throw new ConflictException('Email already registered');
      }
    }

    const evaluator = this.evaluatorsRepository.create(createEvaluatorDto);
    return this.evaluatorsRepository.save(evaluator);
  }

  async findAll(): Promise<Evaluator[]> {
    return this.evaluatorsRepository.find({
      order: { full_name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Evaluator> {
    const evaluator = await this.evaluatorsRepository.findOne({
      where: { id },
    });

    if (!evaluator) {
      throw new NotFoundException(`Evaluator with ID ${id} not found`);
    }

    return evaluator;
  }

  async update(
    id: string,
    updateEvaluatorDto: UpdateEvaluatorDto,
  ): Promise<Evaluator> {
    const evaluator = await this.findOne(id);

    // Check if email is being changed and if it's already in use
    if (
      updateEvaluatorDto.email &&
      updateEvaluatorDto.email !== evaluator.email
    ) {
      const existing = await this.evaluatorsRepository.findOne({
        where: { email: updateEvaluatorDto.email },
      });

      if (existing) {
        throw new ConflictException('Email already registered');
      }
    }

    Object.assign(evaluator, updateEvaluatorDto);
    return this.evaluatorsRepository.save(evaluator);
  }

  async remove(id: string): Promise<void> {
    const evaluator = await this.findOne(id);
    await this.evaluatorsRepository.remove(evaluator);
  }
}
