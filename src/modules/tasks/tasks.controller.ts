import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ActiveTaskDefinition } from '../../entities/active-task-definition.entity';

@ApiTags('Active Tasks')
@ApiBearerAuth('JWT-auth')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new active task definition' })
  @ApiResponse({ status: 201, description: 'Task created successfully', type: ActiveTaskDefinition })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createTaskDto: CreateTaskDto): Promise<ActiveTaskDefinition> {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active task definitions' })
  @ApiResponse({ status: 200, description: 'List of all tasks', type: [ActiveTaskDefinition] })
  findAll(): Promise<ActiveTaskDefinition[]> {
    return this.tasksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiResponse({ status: 200, description: 'Task found', type: ActiveTaskDefinition })
  @ApiResponse({ status: 404, description: 'Task not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ActiveTaskDefinition> {
    return this.tasksService.findOne(id);
  }

  @Get('code/:task_code')
  @ApiOperation({ summary: 'Get a task by code' })
  @ApiResponse({ status: 200, description: 'Task found', type: ActiveTaskDefinition })
  @ApiResponse({ status: 404, description: 'Task not found' })
  findByCode(@Param('task_code') task_code: string): Promise<ActiveTaskDefinition> {
    return this.tasksService.findByCode(task_code);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully', type: ActiveTaskDefinition })
  @ApiResponse({ status: 404, description: 'Task not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<ActiveTaskDefinition> {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.tasksService.remove(id);
  }
}

