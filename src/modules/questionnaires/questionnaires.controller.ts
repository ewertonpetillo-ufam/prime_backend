import {
  Controller,
  Post,
  Get,
  Query,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { QuestionnairesService } from './questionnaires.service';
import { SaveStep1Dto } from './dto/save-step1.dto';
import { SaveStep2Dto } from './dto/save-step2.dto';
import { SaveStep3Dto } from './dto/save-step3.dto';
import { CurrentUser } from '../../common/decorators/user.decorator';

@ApiTags('Questionnaires')
@ApiBearerAuth('JWT-auth')
@Controller('questionnaires')
export class QuestionnairesController {
  constructor(private readonly questionnairesService: QuestionnairesService) {}

  @Post('step1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Save Step 1 - Demographic data',
    description: 'Creates or updates patient and questionnaire with demographic data',
  })
  @ApiResponse({
    status: 200,
    description: 'Step 1 data saved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data',
  })
  async saveStep1(
    @Body() dto: SaveStep1Dto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.questionnairesService.saveStep1(dto, user.userId);
  }

  @Post('step2')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Save Step 2 - Anthropometric data',
    description: 'Saves anthropometric measurements for a questionnaire',
  })
  @ApiResponse({
    status: 200,
    description: 'Step 2 data saved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Questionnaire not found',
  })
  async saveStep2(@Body() dto: SaveStep2Dto) {
    return this.questionnairesService.saveStep2(dto);
  }

  @Post('step3')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Save Step 3 - Clinical data',
    description: 'Saves clinical assessment data for a questionnaire',
  })
  @ApiResponse({
    status: 200,
    description: 'Step 3 data saved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Questionnaire not found',
  })
  async saveStep3(@Body() dto: SaveStep3Dto) {
    return this.questionnairesService.saveStep3(dto);
  }

  @Get('reference-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get reference data for questionnaires',
    description: 'Returns all reference data needed for questionnaire forms (genders, ethnicities, education levels, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Reference data retrieved successfully',
  })
  async getReferenceData() {
    return this.questionnairesService.getReferenceData();
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search questionnaires',
    description: 'Search questionnaires by patient name or CPF',
  })
  @ApiResponse({
    status: 200,
    description: 'Questionnaires found successfully',
  })
  async searchQuestionnaires(@Query('term') term?: string) {
    return this.questionnairesService.searchQuestionnaires(term);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get questionnaire by ID',
    description: 'Returns a complete questionnaire with all related data',
  })
  @ApiResponse({
    status: 200,
    description: 'Questionnaire found successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Questionnaire not found',
  })
  async getQuestionnaireById(@Param('id') id: string) {
    return this.questionnairesService.getQuestionnaireById(id);
  }
}

