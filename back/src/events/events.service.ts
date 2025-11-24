import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrackEventDto } from './dto/track-event.dto';
import { GetEventsDto, DateFilter } from './dto/get-events.dto';
import { EventsListResponse } from './interfaces/events.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retorna estatísticas globais do sistema
   * @returns Estatísticas globais
   */
  async getGlobalStats() {
    const totalEvents = await this.prisma.event.count();

    return {
      totalEvents,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Ingere um único evento
   * @param siteKey Chave do site (tenant)
   * @param eventDto Dados do evento
   * @param metadata Metadados do servidor (IP, userAgent, etc)
   * @returns Evento criado
   */
  async ingest(
    siteKey: string,
    eventDto: TrackEventDto,
    metadata: { ip?: string; userAgent?: string },
  ) {
    const { name, userId, sessionId, ts, properties, context } = eventDto;

    // Valida o nome do evento
    if (!name || name.length === 0) {
      throw new BadRequestException('Nome do evento é obrigatório');
    }

    // Adiciona informações do servidor no contexto
    const enrichedContext = {
      ...context,
      serverTs: new Date().toISOString(),
      ip: metadata.ip ? this.anonymizeIp(metadata.ip) : undefined,
      userAgent: metadata.userAgent,
    };

    // Cria o evento
    const event = await this.prisma.event.create({
      data: {
        siteKey,
        name,
        userId,
        sessionId,
        ts: ts ? new Date(ts) : new Date(),
        properties: (properties || {}) as Prisma.InputJsonValue,
        context: enrichedContext as Prisma.InputJsonValue,
      },
    });

    this.logger.log(`Evento ingerido: ${name} para site: ${siteKey}`);

    return {
      id: event.id.toString(),
      success: true,
    };
  }

  /**
   * Ingere vários eventos em lote
   * @param siteKey Chave do site (tenant)
   * @param events Array de eventos
   * @param metadata Metadados do servidor
   * @returns Resultado do lote
   */
  async ingestBatch(
    siteKey: string,
    events: TrackEventDto[],
    metadata: { ip?: string; userAgent?: string },
  ) {
    // Valida se o array de eventos foi enviado
    if (!events || events.length === 0) {
      throw new BadRequestException('O array de eventos é obrigatório');
    }

    // Limita o tamanho máximo do lote
    if (events.length > 500) {
      throw new BadRequestException('Máximo de 500 eventos por lote');
    }

    const enrichedContext = {
      serverTs: new Date().toISOString(),
      ip: metadata.ip ? this.anonymizeIp(metadata.ip) : undefined,
      userAgent: metadata.userAgent,
    };

    // Prepara os eventos para o insert em lote
    const eventsData = events.map((event) => ({
      siteKey,
      name: event.name,
      userId: event.userId,
      sessionId: event.sessionId,
      ts: event.ts ? new Date(event.ts) : new Date(),
      properties: event.properties || {},
      context: {
        ...event.context,
        ...enrichedContext,
      },
    }));

    // Insere em lotes menores se a quantidade for muito grande
    const chunkSize = 100;
    let totalInserted = 0;

    for (let i = 0; i < eventsData.length; i += chunkSize) {
      const chunk = eventsData.slice(i, i + chunkSize);
      const result = await this.prisma.event.createMany({
        data: chunk as Prisma.EventCreateManyInput[],
        skipDuplicates: false,
      });
      totalInserted += result.count;
    }

    this.logger.log(
      `Lote ingerido: ${totalInserted} eventos para site: ${siteKey}`,
    );

    return {
      success: true,
      count: totalInserted,
    };
  }

  /**
   * Busca eventos para um site com filtros e paginação
   * @param siteKey Chave do site (tenant)
   * @param queryDto Parâmetros de filtro
   * @returns Lista paginada de eventos
   */
  async getEvents(
    siteKey: string,
    queryDto: GetEventsDto,
  ): Promise<EventsListResponse> {
    try {
      const {
        name,
        userId,
        sessionId,
        dateFilter,
        startDate,
        endDate,
        limit = 100,
        offset = 0,
        orderBy = 'ts',
        order = 'desc',
      } = queryDto;

      // Monta o filtro (where)
      const where: Prisma.EventWhereInput = {
        siteKey,
      };

      // Filtro por nome do evento
      if (name) {
        where.name = {
          contains: name,
          mode: 'insensitive',
        };
      }

      // Filtro por ID do usuário
      if (userId) {
        where.userId = userId;
      }

      // Filtro por ID da sessão
      if (sessionId) {
        where.sessionId = sessionId;
      }

      // Aplica filtros de data
      const dateRange = this.getDateRange(dateFilter, startDate, endDate);
      if (dateRange.start && dateRange.end) {
        where.ts = {
          gte: dateRange.start,
          lte: dateRange.end,
        };
      }

      // Monta critério de ordenação
      const orderByClause: Prisma.EventOrderByWithRelationInput = {};
      orderByClause[orderBy] = order;

      // Executa consulta com paginação
      const [events, totalCount] = await Promise.all([
        this.prisma.event.findMany({
          where,
          orderBy: orderByClause,
          take: limit,
          skip: offset,
          select: {
            id: true,
            name: true,
            userId: true,
            sessionId: true,
            properties: true,
            context: true,
            ts: true,
            createdAt: true,
          },
        }),
        this.prisma.event.count({ where }),
      ]);

      this.logger.log(
        `Recuperados ${events.length} eventos para site: ${siteKey} (total: ${totalCount})`,
      );

      return {
        events: events.map((event) => ({
          id: event.id.toString(),
          name: event.name,
          userId: event.userId,
          sessionId: event.sessionId,
          properties: event.properties,
          context: event.context,
          ts: event.ts.toISOString(),
          createdAt: event.createdAt.toISOString(),
        })),
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        },
      };
    } catch (error) {
      this.logger.error(
        `Erro ao recuperar eventos do site ${siteKey}:`,
        error instanceof Error ? error.stack : 'Erro desconhecido',
      );
      throw error;
    }
  }

  /**
   * Retorna o intervalo de datas baseado no tipo do filtro
   * @param dateFilter Tipo do filtro de data
   * @param startDate Data inicial personalizada
   * @param endDate Data final personalizada
   * @returns Objeto com o intervalo de datas
   */
  private getDateRange(
    dateFilter?: DateFilter,
    startDate?: string,
    endDate?: string,
  ) {
    const now = new Date();

    if (dateFilter === DateFilter.CUSTOM && startDate && endDate) {
      return {
        start: new Date(startDate),
        end: new Date(endDate),
      };
    }

    if (dateFilter === DateFilter.DAY) {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    if (dateFilter === DateFilter.WEEK) {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay()); // Início da semana (domingo)
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    if (dateFilter === DateFilter.MONTH) {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      return { start, end };
    }

    if (dateFilter === DateFilter.YEAR) {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { start, end };
    }

    // Padrão: últimos 30 dias
    const start = new Date(now);
    start.setDate(now.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  /**
   * Anonimiza endereço IP para LGPD/GDPR
   * @param ip Endereço IP
   * @returns IP anonimizado
   */
  private anonymizeIp(ip: string): string {
    const parts = ip.split('.');
    if (parts.length === 4) {
      // IPv4: troca o último octeto por 0
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
    // IPv6: mantêm só os primeiros 48 bits
    const ipv6Parts = ip.split(':');
    if (ipv6Parts.length >= 3) {
      return `${ipv6Parts[0]}:${ipv6Parts[1]}:${ipv6Parts[2]}::`;
    }
    return ip;
  }
}
