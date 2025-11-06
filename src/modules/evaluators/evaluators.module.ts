import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluatorsService } from './evaluators.service';
import { EvaluatorsController } from './evaluators.controller';
import { Evaluator } from '../../entities/evaluator.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Evaluator])],
  controllers: [EvaluatorsController],
  providers: [EvaluatorsService],
  exports: [EvaluatorsService],
})
export class EvaluatorsModule {}
