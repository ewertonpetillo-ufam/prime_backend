import {
  Controller,
  Post,
  Get,
  Query,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Patch,
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
import { SaveUpdrs3Dto } from './dto/save-updrs3.dto';
import { SaveMeemDto } from './dto/save-meem.dto';
import { SaveUdysrsDto } from './dto/save-udysrs.dto';
import { SaveStopbangDto } from './dto/save-stopbang.dto';
import { SaveEpworthDto } from './dto/save-epworth.dto';
import { SavePdss2Dto } from './dto/save-pdss2.dto';
import { SaveRbdsqDto } from './dto/save-rbdsq.dto';
import { SaveFogqDto } from './dto/save-fogq.dto';
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

  @Post('updrs3')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Salvar protocolo MDS-UPDRS Parte III',
    description: 'Persiste as pontuações motoras do protocolo UPDRS-III para um questionário',
  })
  @ApiResponse({
    status: 200,
    description: 'Pontuações UPDRS-III salvas com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Questionário não encontrado',
  })
  async saveUpdrs3(@Body() dto: SaveUpdrs3Dto) {
    return this.questionnairesService.saveUpdrs3Scores(dto);
  }

  @Post('meem')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Salvar protocolo MEEM',
    description: 'Persiste as pontuações do Mini Exame do Estado Mental',
  })
  @ApiResponse({
    status: 200,
    description: 'Pontuações MEEM salvas com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Questionário não encontrado',
  })
  async saveMeem(@Body() dto: SaveMeemDto) {
    return this.questionnairesService.saveMeemScores(dto);
  }

  @Post('udysrs')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Salvar protocolo UDysRS',
    description: 'Persiste as pontuações da Escala Unificada para Avaliação de Discinesias',
  })
  @ApiResponse({
    status: 200,
    description: 'Pontuações UDysRS salvas com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Questionário não encontrado',
  })
  async saveUdysrs(@Body() dto: SaveUdysrsDto) {
    return this.questionnairesService.saveUdysrsScores(dto);
  }

  @Post('stopbang')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Salvar protocolo STOP-Bang',
    description: 'Persiste as pontuações do questionário STOP-Bang',
  })
  @ApiResponse({
    status: 200,
    description: 'Pontuações STOP-Bang salvas com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Questionário não encontrado',
  })
  async saveStopbang(@Body() dto: SaveStopbangDto) {
    return this.questionnairesService.saveStopbangScores(dto);
  }

  @Post('epworth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Salvar escala de Sonolência de Epworth',
    description: 'Persiste as respostas da escala Epworth',
  })
  @ApiResponse({
    status: 200,
    description: 'Pontuações Epworth salvas com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Questionário não encontrado',
  })
  async saveEpworth(@Body() dto: SaveEpworthDto) {
    return this.questionnairesService.saveEpworthScores(dto);
  }

  @Post('pdss2')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Salvar protocolo PDSS-2',
    description: 'Persiste as respostas da Parkinson Disease Sleep Scale 2',
  })
  @ApiResponse({
    status: 200,
    description: 'Pontuações PDSS-2 salvas com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Questionário não encontrado',
  })
  async savePdss2(@Body() dto: SavePdss2Dto) {
    return this.questionnairesService.savePdss2Scores(dto);
  }

  @Post('rbdsq')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Salvar protocolo RBDSQ',
    description: 'Persiste as respostas do questionário REM Behavior Disorder Screening',
  })
  @ApiResponse({
    status: 200,
    description: 'Pontuações RBDSQ salvas com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Questionário não encontrado',
  })
  async saveRbdsq(@Body() dto: SaveRbdsqDto) {
    return this.questionnairesService.saveRbdsqScores(dto);
  }

  @Post('fogq')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Salvar protocolo FOGQ',
    description: 'Persiste as respostas do Freezing of Gait Questionnaire',
  })
  @ApiResponse({
    status: 200,
    description: 'Pontuações FOGQ salvas com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Questionário não encontrado',
  })
  async saveFogq(@Body() dto: SaveFogqDto) {
    return this.questionnairesService.saveFogqScores(dto);
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

  @Get(':id/debug/binary-collections')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'DEBUG: Get binary collections debug info',
    description: 'Returns debug information about binary collections for a questionnaire',
  })
  @ApiResponse({
    status: 200,
    description: 'Debug info returned successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Questionnaire not found',
  })
  async debugBinaryCollections(@Param('id') id: string) {
    return this.questionnairesService.debugBinaryCollections(id);
  }

  @Patch(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Finalize questionnaire',
    description: 'Updates questionnaire status to completed',
  })
  @ApiResponse({ status: 200, description: 'Questionnaire finalized successfully' })
  @ApiResponse({ status: 404, description: 'Questionnaire not found' })
  async finalizeQuestionnaire(@Param('id') id: string) {
    return this.questionnairesService.finalizeQuestionnaire(id);
  }

  @Get(':id/export')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Export questionnaire data',
    description: 'Returns complete questionnaire data with all related information including binary collections',
  })
  @ApiResponse({
    status: 200,
    description: 'Questionnaire data exported successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Questionnaire not found',
  })
  async exportQuestionnaireData(@Param('id') id: string) {
    return this.questionnairesService.exportQuestionnaireData(id);
  }

  @Get('patient/:patientId/export')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Export all patient data',
    description: 'Returns all questionnaires and binary collections for a specific patient',
  })
  @ApiResponse({
    status: 200,
    description: 'Patient data exported successfully',
  })
  async exportPatientData(@Param('patientId') patientId: string) {
    return this.questionnairesService.exportPatientData(patientId);
  }

  @Get('export/all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Export all questionnaires data',
    description: 'Returns all questionnaires with all related data including binary collections',
  })
  @ApiResponse({
    status: 200,
    description: 'All questionnaires data exported successfully',
  })
  async exportAllQuestionnairesData() {
    return this.questionnairesService.exportAllQuestionnairesData();
  }

  @Get('statistics/last-30-days')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get questionnaire statistics for last 30 days',
    description: 'Returns count of questionnaires grouped by date for the last 30 days',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getQuestionnaireStatisticsLast30Days() {
    return this.questionnairesService.getQuestionnaireStatisticsLast30Days();
  }
}

