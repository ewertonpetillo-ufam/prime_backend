import { Repository } from 'typeorm';
import { ActiveTaskDefinition } from '../../entities/active-task-definition.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TasksService {
    private tasksRepository;
    constructor(tasksRepository: Repository<ActiveTaskDefinition>);
    create(createTaskDto: CreateTaskDto): Promise<ActiveTaskDefinition>;
    findAll(): Promise<ActiveTaskDefinition[]>;
    findOne(id: number): Promise<ActiveTaskDefinition>;
    findByCode(task_code: string): Promise<ActiveTaskDefinition>;
    update(id: number, updateTaskDto: UpdateTaskDto): Promise<ActiveTaskDefinition>;
    remove(id: number): Promise<void>;
}
