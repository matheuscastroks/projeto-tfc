import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InsightsQueryDto } from '../dto/insights-query.dto';
import { DateFilter } from '../../events/dto/get-events.dto';
import {
  PopularPropertiesResponse,
  PropertyEngagementResponse,
  PropertyFunnelResponse,
} from '../interfaces/categorized-insights.interface';

@Injectable()
export class PropertyService {
  private readonly logger = new Logger(PropertyService.name);

  constructor(private readonly prisma: PrismaService) {}

  private getDateRange(
    dateFilter?: DateFilter,
    startDate?: string,
    endDate?: string,
  ) {
    const now = new Date();

    if (dateFilter === DateFilter.CUSTOM && startDate && endDate) {
      // Ensure dates are interpreted as start/end of day in local timezone
      // If date is in YYYY-MM-DD format, add time component
      const startStr = startDate.includes('T')
        ? startDate
        : `${startDate}T00:00:00`;
      const endStr = endDate.includes('T')
        ? endDate
        : `${endDate}T23:59:59.999`;
      return {
        start: new Date(startStr),
        end: new Date(endStr),
      };
    }

    if (dateFilter === DateFilter.DAY) {
      // Filtro por dia atual
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    if (dateFilter === DateFilter.WEEK) {
      // Filtro por semana atual
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    if (dateFilter === DateFilter.MONTH) {
      // Filtro por mês atual
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
      // Filtro por ano atual
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

  async getPopularProperties(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<PopularPropertiesResponse> {
    // Verifica se o site existe
    const site = await this.prisma.site.findUnique({
      where: { siteKey },
      select: { id: true },
    });

    if (!site) {
      throw new NotFoundException('Site não encontrado');
    }

    const dateRange = this.getDateRange(
      queryDto.dateFilter,
      queryDto.startDate,
      queryDto.endDate,
    );

    // Busca imóveis populares com métricas de engajamento e URL
    const properties = await this.prisma.$queryRaw<
      Array<{
        property_code: string;
        property_url: string;
        views: bigint;
        favorites: bigint;
        leads: bigint;
      }>
    >`
      WITH property_urls AS (
        SELECT DISTINCT ON (properties->>'codigo')
          properties->>'codigo' as property_code,
          properties->>'url' as property_url
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'property_page_view'
          AND properties->>'codigo' IS NOT NULL
          AND properties->>'url' IS NOT NULL
        ORDER BY properties->>'codigo', ts DESC
      )
      SELECT
        properties->>'codigo' as property_code,
        COALESCE(pu.property_url, '') as property_url,
        COUNT(CASE WHEN name = 'property_page_view' THEN 1 END) as views,
        COUNT(CASE WHEN name = 'favorite_toggle' AND properties->>'action' = 'add' THEN 1 END) as favorites,
        COUNT(CASE WHEN name IN ('conversion_whatsapp_click', 'thank_you_view') THEN 1 END) as leads
      FROM "Event"
      LEFT JOIN property_urls pu ON properties->>'codigo' = pu.property_code
      WHERE "siteKey" = ${siteKey}
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->>'codigo' IS NOT NULL
        AND properties->>'codigo' != ''
        AND name IN ('property_page_view', 'favorite_toggle', 'conversion_whatsapp_click', 'thank_you_view')
      GROUP BY properties->>'codigo', pu.property_url
      ORDER BY views DESC
      LIMIT ${queryDto.limit || 10}
    `;

    return {
      properties: properties.map((p) => {
        const views = Number(p.views);
        const favorites = Number(p.favorites);
        const leads = Number(p.leads);

        // Calcula o score de engajamento (ponderado)
        const engagementScore = views * 1 + favorites * 3;

        return {
          codigo: p.property_code,
          url: p.property_url,
          views,
          favorites,
          leads,
          engagementScore,
        };
      }),
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    };
  }

  async getPropertyEngagement(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<PropertyEngagementResponse> {
    // Verifica se o site existe
    const site = await this.prisma.site.findUnique({
      where: { siteKey },
      select: { id: true },
    });

    if (!site) {
      throw new NotFoundException('Site não encontrado');
    }

    const dateRange = this.getDateRange(
      queryDto.dateFilter,
      queryDto.startDate,
      queryDto.endDate,
    );

    // Busca métricas gerais de engajamento dos imóveis
    const engagement = await this.prisma.$queryRaw<
      Array<{
        total_views: bigint;
        total_favorites: bigint;
      }>
    >`
      SELECT
        COUNT(*) FILTER (WHERE name = 'property_page_view') as total_views,
        COUNT(*) FILTER (WHERE name = 'favorite_toggle' AND properties->>'action' = 'add') as total_favorites
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND name IN ('property_page_view', 'favorite_toggle')
    `;

    const data = engagement[0] || {
      total_views: BigInt(0),
      total_favorites: BigInt(0),
    };

    return {
      totalViews: Number(data.total_views),
      totalFavorites: Number(data.total_favorites),
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    };
  }

  async getPropertyFunnel(
    siteKey: string,
    propertyCode: string,
    queryDto: InsightsQueryDto,
  ): Promise<PropertyFunnelResponse> {
    // Verifica se o site existe
    const site = await this.prisma.site.findUnique({
      where: { siteKey },
      select: { id: true },
    });
    if (!site) throw new NotFoundException('Site não encontrado');

    const dateRange = this.getDateRange(
      queryDto.dateFilter,
      queryDto.startDate,
      queryDto.endDate,
    );

    // Busca dados do funil do imóvel
    const funnelData = await this.prisma.$queryRaw<
      Array<{
        views: bigint;
        favorites: bigint;
        leads: bigint;
      }>
    >`
      SELECT
        COUNT(CASE WHEN name = 'property_page_view' THEN 1 END) as views,
        COUNT(CASE WHEN name = 'favorite_toggle' AND (properties->>'action' = 'add') THEN 1 END) as favorites,
        COUNT(CASE WHEN name IN ('conversion_whatsapp_click', 'thank_you_view') THEN 1 END) as leads
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND properties->>'codigo' = ${propertyCode}
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
    `;

    const data = funnelData[0] || {
      views: BigInt(0),
      favorites: BigInt(0),
      leads: BigInt(0),
    };

    const views = Number(data.views);
    const leads = Number(data.leads);
    // Calcula a taxa de conversão de visualização para lead
    const viewToLeadRate =
      views > 0 ? Math.round((leads / views) * 100 * 100) / 100 : 0;

    return {
      views,
      favorites: Number(data.favorites),
      leads,
      viewToLeadRate,
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    };
  }
}
