import {
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CreateFreelivingEventDto } from './dto/create-freeliving-event.dto';
import { FreelivingService } from './freeliving.service';

@ApiTags('FreeLiving')
@ApiBearerAuth('JWT-auth')
@Controller('freeliving')
export class FreelivingEventsController {
  constructor(private readonly freelivingService: FreelivingService) {}

  @Post('events')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Registra ação do app de coleta FreeLiving',
    description:
      'Auditoria append-only. Ações iniciais: collection_started (Iniciou coleta) e collection_finished (Finalizou coleta). ' +
      'Se client_event_id já existir, devolve o evento original com HTTP 409.',
  })
  @ApiCreatedResponse({ description: 'Evento registrado' })
  @ApiConflictResponse({
    description: 'client_event_id duplicado — devolve o evento existente',
  })
  async createEvent(
    @Body() dto: CreateFreelivingEventDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { created, event } = await this.freelivingService.createEvent(dto);
    res.status(created ? 201 : 409);
    return event;
  }
}
