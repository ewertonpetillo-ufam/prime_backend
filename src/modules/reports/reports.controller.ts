import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AdminCollectionOverviewService } from '../admin-collection-overview/admin-collection-overview.service';

@ApiTags('Reports')
@ApiBearerAuth('JWT-auth')
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly adminCollectionOverviewService: AdminCollectionOverviewService,
  ) {}

  @Get('patients')
  @ApiOperation({
    summary: 'Relatório de pacientes com indicação ao teste de sono',
    description:
      'Lista pacientes no mesmo escopo dos Indicadores de Coleta, com dados demográficos, indicação ao sono e status TA13.',
  })
  @ApiQuery({
    name: 'statuses',
    required: false,
    description:
      'Estados do questionário separados por vírgula (ex.: in_progress). Defeito: in_progress',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Máximo de questionários (1–500, defeito 200)',
  })
  async getReportsPatients(
    @Query('statuses') statuses?: string,
    @Query('limit') limitStr?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;
    return this.adminCollectionOverviewService.getReportsPatients({
      statuses,
      limit,
    });
  }
}
