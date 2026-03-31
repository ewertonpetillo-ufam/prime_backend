import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AdminRoleGuard } from '../../common/guards/admin-role.guard';
import { AdminCollectionOverviewService } from './admin-collection-overview.service';

@ApiTags('Admin - Coleta')
@ApiBearerAuth('JWT-auth')
@UseGuards(AdminRoleGuard)
@Controller('admin/collection-overview')
export class AdminCollectionOverviewController {
  constructor(
    private readonly adminCollectionOverviewService: AdminCollectionOverviewService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Painel admin: resumo ou matriz de ficheiros por TA',
    description:
      'view=summary: KPIs, lista de protocolos e agregação por TA. view=matrix: matriz paciente × TA.',
  })
  @ApiQuery({
    name: 'view',
    required: false,
    enum: ['summary', 'matrix'],
    description: 'summary (defeito) ou matrix',
  })
  @ApiQuery({
    name: 'statuses',
    required: false,
    description:
      "Estados do questionário separados por vírgula (ex.: in_progress ou in_progress,draft). Defeito: in_progress",
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Máximo de questionários (1–500, defeito 200)',
  })
  async getOverview(
    @Query('view') view?: string,
    @Query('statuses') statuses?: string,
    @Query('limit') limitStr?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;
    const params = { statuses, limit };

    if (view === 'matrix') {
      return this.adminCollectionOverviewService.getMatrix(params);
    }

    return this.adminCollectionOverviewService.getSummary(params);
  }
}
