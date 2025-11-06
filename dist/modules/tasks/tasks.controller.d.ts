import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ActiveTaskDefinition } from '../../entities/active-task-definition.entity';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(createTaskDto: CreateTaskDto): Promise<ActiveTaskDefinition>;
    findAll(): Promise<ActiveTaskDefinition[]>;
    findOne(id: number): Promise<ActiveTaskDefinition>;
    findByCode(task_code: string): Promise<ActiveTaskDefinition>;
    update(id: number, updateTaskDto: UpdateTaskDto): Promise<ActiveTaskDefinition>;
    remove(id: number): Promise<void>;
}
