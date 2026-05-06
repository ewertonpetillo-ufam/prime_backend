import { Body, Controller, Delete, Get, Logger, NotFoundException, Param, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { AdminRoleGuard } from '../../common/guards/admin-role.guard';
import { SamsungSyncService } from './samsung-sync.service';

@ApiTags('Admin - Samsung Sync')
@ApiBearerAuth('JWT-auth')
@UseGuards(AdminRoleGuard)
@Controller('sync/samsung')
export class SamsungSyncController {
  private readonly logger = new Logger(SamsungSyncController.name);

  constructor(private readonly samsungSyncService: SamsungSyncService) {}

  @Post('run')
  @ApiOperation({ summary: 'Executa sincronização manual com BART' })
  async runSync(
    @CurrentUser() user: { userId: string },
    @Body()
    body?: {
      patientStart?: string;
      patientEnd?: string;
      dateStart?: string;
      dateEnd?: string;
    },
  ) {
    const userId = user?.userId || null;
    this.logger.log(`Solicitação manual de sync recebida. userId=${userId ?? 'n/a'}`);
    const startedAt = Date.now();
    try {
      const result = await this.samsungSyncService.runSyncAsync(userId, 'manual', body || {});
      this.logger.log(
        `Sync manual disparado. runId=${result?.run_id ?? 'n/a'} elapsedMs=${Date.now() - startedAt}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Erro na execução manual de sync. elapsedMs=${Date.now() - startedAt}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  @Get('pending')
  @ApiOperation({ summary: 'Lista pacientes/arquivos pendentes para sincronização' })
  async pending() {
    return this.samsungSyncService.getPendingSummary();
  }

  @Get('history')
  @ApiOperation({ summary: 'Histórico de execuções de sincronização' })
  async history(@Query('limit') limit?: string) {
    const parsedLimit = limit ? Number(limit) : undefined;
    return this.samsungSyncService.getHistory(parsedLimit);
  }

  @Get('runs/:id')
  @ApiOperation({ summary: 'Status detalhado de uma execução específica' })
  async runStatus(@Param('id') runId: string) {
    const run = await this.samsungSyncService.getRunStatus(runId);
    if (!run) {
      throw new NotFoundException('Execução de sincronização não encontrada');
    }
    return run;
  }

  @Post('runs/:id/cancel')
  @ApiOperation({ summary: 'Solicita cancelamento da execução de sincronização' })
  async cancelRun(
    @Param('id') runId: string,
    @CurrentUser() user: { userId: string },
  ) {
    const userId = user?.userId || null;
    return this.samsungSyncService.cancelRun(runId, userId);
  }

  @Get('tree')
  @ApiOperation({
    summary: 'Visualização da estrutura de diretórios e artefatos sincronizados',
  })
  async tree(@Query('limit') limit?: string) {
    const parsedLimit = limit ? Number(limit) : undefined;
    return this.samsungSyncService.getDirectoryTree(parsedLimit);
  }

  @Get('artifacts')
  @ApiOperation({ summary: 'Lista artefatos ZIP gerados no BART' })
  async listArtifacts() {
    return this.samsungSyncService.listZipArtifacts();
  }

  @Get('artifacts/:name/download')
  @ApiOperation({ summary: 'Baixa artefato ZIP gerado no BART' })
  async downloadArtifact(@Param('name') name: string, @Res() res: Response) {
    const artifact = await this.samsungSyncService.downloadZipArtifact(name);
    res.setHeader('Content-Type', artifact.contentType || 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
    res.send(artifact.buffer);
  }

  @Delete('artifacts/:name')
  @ApiOperation({ summary: 'Remove artefato ZIP gerado no BART' })
  async deleteArtifact(@Param('name') name: string) {
    await this.samsungSyncService.deleteZipArtifact(name);
    return { success: true };
  }
}
