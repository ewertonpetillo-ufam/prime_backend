import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { EvaluatorsService } from './evaluators.service';
import { CreateEvaluatorDto } from './dto/create-evaluator.dto';
import { UpdateEvaluatorDto } from './dto/update-evaluator.dto';

@ApiTags('Evaluators')
@ApiBearerAuth('JWT-auth')
@Controller('evaluators')
export class EvaluatorsController {
  constructor(private readonly evaluatorsService: EvaluatorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new evaluator' })
  @ApiResponse({
    status: 201,
    description: 'Evaluator created successfully',
  })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  create(@Body() createEvaluatorDto: CreateEvaluatorDto) {
    return this.evaluatorsService.create(createEvaluatorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all evaluators' })
  @ApiResponse({
    status: 200,
    description: 'List of all evaluators',
  })
  findAll() {
    return this.evaluatorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get evaluator by ID' })
  @ApiParam({ name: 'id', description: 'Evaluator UUID' })
  @ApiResponse({
    status: 200,
    description: 'Evaluator found',
  })
  @ApiResponse({ status: 404, description: 'Evaluator not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.evaluatorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update evaluator' })
  @ApiParam({ name: 'id', description: 'Evaluator UUID' })
  @ApiResponse({
    status: 200,
    description: 'Evaluator updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Evaluator not found' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEvaluatorDto: UpdateEvaluatorDto,
  ) {
    return this.evaluatorsService.update(id, updateEvaluatorDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete evaluator' })
  @ApiParam({ name: 'id', description: 'Evaluator UUID' })
  @ApiResponse({
    status: 204,
    description: 'Evaluator deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Evaluator not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.evaluatorsService.remove(id);
  }
}
