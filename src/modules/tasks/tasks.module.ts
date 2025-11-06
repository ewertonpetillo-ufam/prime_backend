import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { ActiveTaskDefinition } from '../../entities/active-task-definition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActiveTaskDefinition])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}

