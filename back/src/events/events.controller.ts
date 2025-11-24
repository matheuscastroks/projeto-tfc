import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { EventsService } from './events.service';
import { TrackEventDto } from './dto/track-event.dto';
import { TrackBatchDto } from './dto/track-batch.dto';
import { GetEventsDto } from './dto/get-events.dto';
import { EventsListResponse } from './interfaces/events.interface';
import { UnifiedGuard } from '../common/guards/unified.guard';
import { RequireTenant } from '../common/decorators/require-tenant.decorator';
import { SiteKey } from '../common/decorators/site-key.decorator';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * Retorna estatísticas globais públicas
   * @returns Estatísticas gerais (público)
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Obter estatísticas globais',
    description: 'Retorna estatísticas gerais do sistema (endpoint público).',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas retornadas com sucesso.',
  })
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 requisições por minuto
  async getStats(): Promise<{ totalEvents: number; timestamp: string }> {
    return this.eventsService.getGlobalStats();
  }

  /**
   * Retorna eventos filtrados e paginados para um site
   * @param siteKey Chave do site vinda do guard do tenant
   * @param queryDto Parâmetros de filtro e paginação
   * @returns Lista de eventos paginados
   */
  @Get()
  @UseGuards(UnifiedGuard)
  @RequireTenant()
  @ApiOperation({
    summary: 'Obter eventos do site',
    description: 'Retorna eventos de um site com filtros e paginação.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de eventos retornada com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 requisições por minuto
  async getEvents(
    @SiteKey() siteKey: string,
    @Query() queryDto: GetEventsDto,
  ): Promise<EventsListResponse> {
    return await this.eventsService.getEvents(siteKey, queryDto);
  }

  /**
   * Registra um evento único
   * @param siteKey Chave do site vinda do guard do tenant
   * @param req Objeto da requisição
   * @param trackEventDto Dados do evento
   * @returns Resultado do registro
   */
  @Post('track')
  @UseGuards(UnifiedGuard)
  @RequireTenant()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rastrear evento único',
    description: 'Registra um único evento de analytics para o site.',
  })
  @ApiResponse({
    status: 200,
    description: 'Evento registrado com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @Throttle({ default: { limit: 1000, ttl: 60000 } }) // 1000 requisições por minuto por site
  async track(
    @SiteKey() siteKey: string,
    @Req() req: Request,
    @Body() trackEventDto: TrackEventDto,
  ) {
    const metadata = {
      ip: req.ip || req.headers['x-forwarded-for']?.toString(),
      userAgent: req.headers['user-agent'],
    };

    return this.eventsService.ingest(siteKey, trackEventDto, metadata);
  }

  /**
   * Registra vários eventos em lote
   * @param siteKey Chave do site vinda do guard do tenant
   * @param req Objeto da requisição
   * @param trackBatchDto Lote de eventos
   * @returns Resultado do registro em lote
   */
  @Post('track/batch')
  @UseGuards(UnifiedGuard)
  @RequireTenant()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rastrear múltiplos eventos em lote',
    description:
      'Registra múltiplos eventos de analytics em uma única requisição.',
  })
  @ApiResponse({
    status: 200,
    description: 'Eventos registrados com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 requisições por minuto para lote
  async trackBatch(
    @SiteKey() siteKey: string,
    @Req() req: Request,
    @Body() trackBatchDto: TrackBatchDto,
  ) {
    const metadata = {
      ip: req.ip || req.headers['x-forwarded-for']?.toString(),
      userAgent: req.headers['user-agent'],
    };

    return this.eventsService.ingestBatch(
      siteKey,
      trackBatchDto.events,
      metadata,
    );
  }
}
