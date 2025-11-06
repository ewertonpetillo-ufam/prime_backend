import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActiveTaskDefinition } from '../../entities/active-task-definition.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(ActiveTaskDefinition)
    private tasksRepository: Repository<ActiveTaskDefinition>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<ActiveTaskDefinition> {
    const task = this.tasksRepository.create(createTaskDto);
    return this.tasksRepository.save(task);
  }

  async findAll(): Promise<ActiveTaskDefinition[]> {
    return this.tasksRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<ActiveTaskDefinition> {
    const task = await this.tasksRepository.findOne({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async findByCode(task_code: string): Promise<ActiveTaskDefinition> {
    const task = await this.tasksRepository.findOne({
      where: { task_code },
    });

    if (!task) {
      throw new NotFoundException(`Task with code ${task_code} not found`);
    }

    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<ActiveTaskDefinition> {
    const task = await this.findOne(id);
    Object.assign(task, updateTaskDto);
    return this.tasksRepository.save(task);
  }

  async remove(id: number): Promise<void> {
    const task = await this.findOne(id);
    await this.tasksRepository.remove(task);
  }
}

