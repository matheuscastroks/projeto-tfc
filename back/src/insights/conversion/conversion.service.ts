import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InsightsQueryDto } from '../dto/insights-query.dto';
import { DateFilter } from '../../events/dto/get-events.dto';
import {
  ConversionRateResponse,
  ConversionSourcesResponse,
  LeadProfileResponse,
} from '../interfaces/categorized-insights.interface';

@Injectable()
export class ConversionService {
  private readonly logger = new Logger(ConversionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Formats conversion type to a human-readable label
   */
  private formatConversionType(type: string): string {
    const conversionTypeMap: Record<string, string> = {
      thank_you_view: 'Formulário da página do imóvel',
      conversion_whatsapp_click: 'Botão de WhatsApp',
    };

    return conversionTypeMap[type] || type;
  }

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
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    if (dateFilter === DateFilter.WEEK) {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
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

  async getConversionRate(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<ConversionRateResponse> {
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

    // Busca total de conversões
    const conversionsResult = await this.prisma.$queryRaw<
      Array<{ total: bigint }>
    >`
      SELECT COUNT(*) as total
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name IN ('conversion_whatsapp_click', 'thank_you_view', 'conversion_generate_lead')
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
    `;

    const totalConversions = Number(conversionsResult[0]?.total || 0);

    // Busca total de sessões
    const sessionsResult = await this.prisma.$queryRaw<
      Array<{ total: bigint }>
    >`
      SELECT COUNT(DISTINCT "sessionId") as total
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
    `;

    const totalSessions = Number(sessionsResult[0]?.total || 0);

    // Busca conversões por tipo
    const conversionsByTypeResult = await this.prisma.$queryRaw<
      Array<{ conversion_type: string | null; count: bigint }>
    >`
      SELECT
        name as conversion_type,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name IN ('conversion_whatsapp_click', 'thank_you_view', 'conversion_generate_lead')
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
      GROUP BY name
      ORDER BY count DESC
    `;

    const conversionsByType = (conversionsByTypeResult || []).filter(
      (c) => c.conversion_type !== null,
    );

    const conversionRate =
      totalSessions > 0
        ? Math.round((totalConversions / totalSessions) * 100 * 100) / 100
        : 0;

    return {
      totalConversions,
      totalSessions,
      conversionRate,
      conversionsByType: conversionsByType.map((c) => ({
        type: this.formatConversionType(c.conversion_type || 'unknown'),
        count: Number(c.count || 0),
        percentage:
          totalConversions > 0
            ? Math.round(
                (Number(c.count || 0) / totalConversions) * 100 * 100,
              ) / 100
            : 0,
      })),
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    };
  }

  async getConversionSources(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<ConversionSourcesResponse> {
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

    // Busca fontes das conversões
    const sourcesResult = await this.prisma.$queryRaw<
      Array<{ source: string; count: bigint }>
    >`
      SELECT
        COALESCE(properties->>'source', 'Site') as source,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name IN ('conversion_whatsapp_click', 'thank_you_view', 'conversion_generate_lead')
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
      GROUP BY COALESCE(properties->>'source', 'Site')
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    const sources = sourcesResult || [];
    const totalConversions = sources.reduce(
      (sum, s) => sum + Number(s.count || 0),
      0,
    );

    return {
      sources: sources.map((s) => ({
        source: s.source || 'Site',
        conversions: Number(s.count || 0),
        percentage:
          totalConversions > 0
            ? Math.round(
                (Number(s.count || 0) / totalConversions) * 100 * 100,
              ) / 100
            : 0,
      })),
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    };
  }

  async getLeadProfile(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<LeadProfileResponse> {
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

    // Busca interesses principais dos leads
    const interests = this.prisma.$queryRaw<
      Array<{ interest: string; count: bigint }>
    >`
      SELECT properties->>'interesse' as interest, COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey} AND name = 'thank_you_view' AND ts >= ${dateRange.start} AND ts <= ${dateRange.end} AND properties->>'interesse' IS NOT NULL
      GROUP BY interest ORDER BY count DESC LIMIT 5
    `;

    // Busca as principais categorias
    const categories = this.prisma.$queryRaw<
      Array<{ category: string; count: bigint }>
    >`
      SELECT properties->>'categoria' as category, COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey} AND name = 'thank_you_view' AND ts >= ${dateRange.start} AND ts <= ${dateRange.end} AND properties->>'categoria' IS NOT NULL
      GROUP BY category ORDER BY count DESC LIMIT 5
    `;

    // Busca os principais tipos de imóvel
    const propertyTypes = this.prisma.$queryRaw<
      Array<{ type: string; count: bigint }>
    >`
      SELECT properties->>'tipo' as type, COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey} AND name = 'thank_you_view' AND ts >= ${dateRange.start} AND ts <= ${dateRange.end} AND properties->>'tipo' IS NOT NULL
      GROUP BY type ORDER BY count DESC LIMIT 5
    `;

    // Busca as principais cidades
    const cities = this.prisma.$queryRaw<
      Array<{ city: string; count: bigint }>
    >`
      SELECT properties->>'cidade' as city, COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey} AND name = 'thank_you_view' AND ts >= ${dateRange.start} AND ts <= ${dateRange.end} AND properties->>'cidade' IS NOT NULL
      GROUP BY city ORDER BY count DESC LIMIT 5
    `;

    // Busca valor médio de venda
    const avgSale = this.prisma.$queryRaw<Array<{ avg_sale: number }>>`
      SELECT AVG((properties->>'valor_venda')::numeric) as avg_sale
      FROM "Event"
      WHERE "siteKey" = ${siteKey} AND name = 'thank_you_view' AND ts >= ${dateRange.start} AND ts <= ${dateRange.end} AND (properties->>'valor_venda')::numeric > 0
    `;

    // Busca valor médio de aluguel
    const avgRental = this.prisma.$queryRaw<Array<{ avg_rental: number }>>`
      SELECT AVG((properties->>'valor_aluguel')::numeric) as avg_rental
      FROM "Event"
      WHERE "siteKey" = ${siteKey} AND name = 'thank_you_view' AND ts >= ${dateRange.start} AND ts <= ${dateRange.end} AND (properties->>'valor_aluguel')::numeric > 0
    `;

    const [
      topInterests,
      topCategories,
      topPropertyTypes,
      topCities,
      avgSaleValue,
      avgRentalValue,
    ] = await Promise.all([
      interests,
      categories,
      propertyTypes,
      cities,
      avgSale,
      avgRental,
    ]);

    return {
      topInterests: topInterests.map((i) => ({ ...i, count: Number(i.count) })),
      topCategories: topCategories.map((c) => ({
        ...c,
        count: Number(c.count),
      })),
      topPropertyTypes: topPropertyTypes.map((t) => ({
        ...t,
        count: Number(t.count),
      })),
      topCities: topCities.map((c) => ({ ...c, count: Number(c.count) })),
      averageSaleValue: Math.round(avgSaleValue[0]?.avg_sale || 0),
      averageRentalValue: Math.round(avgRentalValue[0]?.avg_rental || 0),
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    };
  }
}
