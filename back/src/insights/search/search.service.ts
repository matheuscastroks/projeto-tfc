import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InsightsQueryDto } from '../dto/insights-query.dto';
import { DateFilter } from '../../events/dto/get-events.dto';
import {
  SearchAnalyticsResponse,
  TopConvertingFiltersResponse,
} from '../interfaces/categorized-insights.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly prisma: PrismaService) {}

  //Formata um valor de filtro capitalizando e tratando hífens
  private formatFilterValue(value: string): string {
    if (!value) return value;

    const normalized = value.toLowerCase().replace(/[-_]/g, ' ').trim();

    // Divide por espaços e capitaliza cada palavra
    return normalized
      .split(/\s+/)
      .map((word) => {
        if (!word) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }

  /**
   * Formata os valores de uma combinação de filtros
   */
  private formatFilterCombination(
    combination: Record<string, string | string[]>,
  ): Record<string, string | string[]> {
    const formatted: Record<string, string | string[]> = {};

    for (const [key, value] of Object.entries(combination)) {
      if (Array.isArray(value)) {
        formatted[key] = value.map((v) => this.formatFilterValue(v));
      } else {
        formatted[key] = this.formatFilterValue(value);
      }
    }

    return formatted;
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

  async getSearchAnalytics(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<SearchAnalyticsResponse> {
    // Verificar se o site existe
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

    // Buscar o total de buscas
    const totalResult = await this.prisma.$queryRaw<Array<{ total: bigint }>>`
      SELECT COUNT(*) as total
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
    `;

    const totalSearches = Number(totalResult[0]?.total || 0);

    // Buscar as principais finalidades
    const finalidades = await this.prisma.$queryRaw<
      Array<{ finalidade: string; count: bigint }>
    >`
      SELECT
        properties->'filters'->>'status' as finalidade,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->'filters'->>'status' IS NOT NULL
      GROUP BY finalidade
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar os principais tipos
    const tipos = await this.prisma.$queryRaw<
      Array<{ tipo: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->'filters'->'type') as tipo,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->'filters'->'type' IS NOT NULL
      GROUP BY tipo
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar as principais cidades
    const cidades = await this.prisma.$queryRaw<
      Array<{ cidade: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->'filters'->'city') as cidade,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->'filters'->'city' IS NOT NULL
      GROUP BY cidade
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar os principais bairros
    const bairros = await this.prisma.$queryRaw<
      Array<{ bairro: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->'filters'->'neighborhood') as bairro,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->'filters'->'neighborhood' IS NOT NULL
      GROUP BY bairro
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar os principais números de quartos
    const quartos = await this.prisma.$queryRaw<
      Array<{ quartos: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->'filters'->'bedrooms') as quartos,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->'filters'->'bedrooms' IS NOT NULL
      GROUP BY quartos
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar os principais números de suítes
    const suites = await this.prisma.$queryRaw<
      Array<{ suites: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->'filters'->'suites') as suites,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->'filters'->'suites' IS NOT NULL
      GROUP BY suites
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar os principais números de banheiros
    const banheiros = await this.prisma.$queryRaw<
      Array<{ banheiros: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->'filters'->'bathrooms') as banheiros,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->'filters'->'bathrooms' IS NOT NULL
      GROUP BY banheiros
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar os principais números de vagas
    const vagas = await this.prisma.$queryRaw<
      Array<{ vagas: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->'filters'->'garage') as vagas,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->'filters'->'garage' IS NOT NULL
      GROUP BY vagas
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar as principais salas (comercial)
    const salas = await this.prisma.$queryRaw<
      Array<{ salas: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->'filters'->'living_rooms') as salas,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->'filters'->'living_rooms' IS NOT NULL
      GROUP BY salas
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar os principais galpões (comercial)
    const galpoes = await this.prisma.$queryRaw<
      Array<{ galpoes: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->'filters'->'warehouses') as galpoes,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->'filters'->'warehouses' IS NOT NULL
      GROUP BY galpoes
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar as faixas de preço para venda
    const priceRangesVenda = await this.prisma.$queryRaw<
      Array<{ range: string; count: bigint }>
    >`
      WITH price_buckets AS (
        SELECT
          CASE
            WHEN (properties->'filters'->'salePrice'->>'min')::NUMERIC < 1000000 THEN 'Até 1M'
            WHEN (properties->'filters'->'salePrice'->>'min')::NUMERIC < 3000000 THEN '1M-3M'
            WHEN (properties->'filters'->'salePrice'->>'min')::NUMERIC < 7000000 THEN '3M-7M'
            ELSE '7M+'
          END as range
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND properties->'filters'->'salePrice' IS NOT NULL
          AND properties->'filters'->'salePrice'->>'min' IS NOT NULL
          AND properties->'filters'->'salePrice'->>'min' != '0'
      )
      SELECT range, COUNT(*) as count
      FROM price_buckets
      GROUP BY range
      ORDER BY count DESC
    `;

    // Buscar as faixas de preço para aluguel
    const priceRangesAluguel = await this.prisma.$queryRaw<
      Array<{ range: string; count: bigint }>
    >`
      WITH price_buckets AS (
        SELECT
          CASE
            WHEN (properties->'filters'->'rentPrice'->>'min')::NUMERIC < 1000 THEN '0-1k'
            WHEN (properties->'filters'->'rentPrice'->>'min')::NUMERIC < 2000 THEN '1k-2k'
            WHEN (properties->'filters'->'rentPrice'->>'min')::NUMERIC < 3000 THEN '2k-3k'
            WHEN (properties->'filters'->'rentPrice'->>'min')::NUMERIC < 5000 THEN '3k-5k'
            ELSE '5k+'
          END as range
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND properties->'filters'->'rentPrice' IS NOT NULL
          AND properties->'filters'->'rentPrice'->>'min' IS NOT NULL
          AND properties->'filters'->'rentPrice'->>'min' != '0'
      )
      SELECT range, COUNT(*) as count
      FROM price_buckets
      GROUP BY range
      ORDER BY count DESC
    `;

    // Buscar as faixas de área
    const areaRanges = await this.prisma.$queryRaw<
      Array<{ range: string; count: bigint }>
    >`
      WITH area_buckets AS (
        SELECT
          CASE
            WHEN (properties->'filters'->'area'->>'min')::NUMERIC < 50 THEN '0-50m²'
            WHEN (properties->'filters'->'area'->>'min')::NUMERIC < 100 THEN '50-100m²'
            WHEN (properties->'filters'->'area'->>'min')::NUMERIC < 200 THEN '100-200m²'
            WHEN (properties->'filters'->'area'->>'min')::NUMERIC < 300 THEN '200-300m²'
            ELSE '300m²+'
          END as range
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND properties->'filters'->'area' IS NOT NULL
          AND properties->'filters'->'area'->>'min' IS NOT NULL
          AND properties->'filters'->'area'->>'min' != '0'
      )
      SELECT range, COUNT(*) as count
      FROM area_buckets
      GROUP BY range
      ORDER BY count DESC
    `;

    // Buscar os switches mais usados (filtros booleanos)
    const switches = await this.prisma.$queryRaw<
      Array<{ switch: string; count: bigint }>
    >`
      WITH switch_events AS (
        SELECT
          'Mobiliado' as switch_name
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->'filters'->>'furnished')::BOOLEAN = true
        UNION ALL
        SELECT 'Imóvel Novo'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->'filters'->>'newProperty')::BOOLEAN = true
        UNION ALL
        SELECT 'Imóvel Novo'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name IN ('search_submit', 'search')
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->'filters'->>'newProperty')::BOOLEAN = true
        UNION ALL
        SELECT 'Na Planta'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->'filters'->>'na_planta')::BOOLEAN = true
        UNION ALL
        SELECT 'Em Construção'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->'filters'->>'em_construcao')::BOOLEAN = true
        UNION ALL
        SELECT 'Aceita Permuta'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->'filters'->>'aceita_permuta')::BOOLEAN = true
        UNION ALL
        SELECT 'Pet Friendly'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->'filters'->>'pet_friendly')::BOOLEAN = true
        UNION ALL
        SELECT 'Seguro Fiança'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->'filters'->>'seguro_fianca')::BOOLEAN = true
        UNION ALL
        SELECT 'Reservado'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name IN ('search_submit', 'search')
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->'filters'->>'reservado')::BOOLEAN = true
        UNION ALL
        SELECT 'Valor Total Pacote'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->'filters'->>'valor_total_pacote')::BOOLEAN = true
      )
      SELECT switch_name as switch, COUNT(*) as count
      FROM switch_events
      GROUP BY switch_name
      ORDER BY switch_name DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar total de buscas para cálculo do percentual
    const totalForPercentage = await this.prisma.$queryRaw<
      Array<{ total: bigint }>
    >`
      SELECT COUNT(*) as total
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
    `;

    const totalCount = Number(totalForPercentage[0]?.total || 1);

    // Buscar as principais comodidades
    const comodidades = await this.prisma.$queryRaw<
      Array<{ comodidade: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->'filters'->'amenities') as comodidade,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->'filters'->'amenities' IS NOT NULL
      GROUP BY comodidade
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar principais itens de lazer
    const lazer = await this.prisma.$queryRaw<
      Array<{ lazer: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->'filters'->'leisure') as lazer,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->'filters'->'leisure' IS NOT NULL
      GROUP BY lazer
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar itens principais de segurança
    const seguranca = await this.prisma.$queryRaw<
      Array<{ seguranca: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->'filters'->'security') as seguranca,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->'filters'->'security' IS NOT NULL
      GROUP BY seguranca
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar comodos principais (área de serviço e varanda)
    const comodos = await this.prisma.$queryRaw<
      Array<{ comodo: string; count: bigint }>
    >`

      SELECT
        jsonb_array_elements_text(properties->'filters'->'rooms') as comodo,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->'filters'->'rooms' IS NOT NULL
      GROUP BY comodo
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    return {
      totalSearches,
      topFinalidades: finalidades.map((f) => ({
        finalidade: this.formatFilterValue(f.finalidade || 'unknown'),
        count: Number(f.count),
      })),
      topTipos: tipos.map((t) => ({
        tipo: this.formatFilterValue(t.tipo),
        count: Number(t.count),
      })),
      topCidades: cidades.map((c) => ({
        cidade: this.formatFilterValue(c.cidade),
        count: Number(c.count),
      })),
      topBairros: bairros.map((b) => ({
        bairro: this.formatFilterValue(b.bairro),
        count: Number(b.count),
      })),
      topQuartos: quartos.map((q) => ({
        quartos: q.quartos,
        count: Number(q.count),
      })),
      topSuites: suites.map((s) => ({
        suites: s.suites,
        count: Number(s.count),
      })),
      topBanheiros: banheiros.map((b) => ({
        banheiros: b.banheiros,
        count: Number(b.count),
      })),
      topVagas: vagas.map((v) => ({
        vagas: v.vagas,
        count: Number(v.count),
      })),
      topSalas: salas.map((s) => ({
        salas: s.salas,
        count: Number(s.count),
      })),
      topGalpoes: galpoes.map((g) => ({
        galpoes: g.galpoes,
        count: Number(g.count),
      })),
      topComodos: comodos.map((c) => ({
        comodo: c.comodo,
        count: Number(c.count),
      })),
      priceRanges: {
        venda: priceRangesVenda.map((p) => ({
          range: p.range,
          count: Number(p.count),
        })),
        aluguel: priceRangesAluguel.map((p) => ({
          range: p.range,
          count: Number(p.count),
        })),
      },
      areaRanges: areaRanges.map((a) => ({
        range: a.range,
        count: Number(a.count),
      })),
      topSwitches: switches.map((s) => ({
        switch: s.switch,
        count: Number(s.count),
        percentage:
          totalCount > 0
            ? Math.round((Number(s.count) / totalCount) * 100 * 100) / 100
            : 0,
      })),
      topComodidades: comodidades.map((c) => ({
        comodidade: this.formatFilterValue(c.comodidade),
        count: Number(c.count),
      })),
      topLazer: lazer.map((l) => ({
        lazer: this.formatFilterValue(l.lazer),
        count: Number(l.count),
      })),
      topSeguranca: seguranca.map((s) => ({
        seguranca: this.formatFilterValue(s.seguranca),
        count: Number(s.count),
      })),
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    };
  }

  async getTopConvertingFilters(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<TopConvertingFiltersResponse> {
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

    // Essa consulta faz um join entre eventos de search e conversões
    // no mesmo sessionId
    const results = await this.prisma.$queryRaw<
      Array<{ combination: Prisma.JsonValue; conversions: bigint }>
    >`
      WITH SessionConversions AS (
        SELECT DISTINCT "sessionId"
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name IN ('click_contact', 'submit_lead_form', 'thank_you_view')
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
      ),
      SearchFilters AS (
        SELECT
          "sessionId",
          jsonb_strip_nulls(
            jsonb_build_object(
              'finalidade', properties->'filters'->>'status',
              'cidade', properties->'filters'->'city'->>0,
              'tipo', properties->'filters'->'type'->>0,
              'quartos', properties->'filters'->'bedrooms'->>0
            )
          ) as combination
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND "sessionId" IN (SELECT "sessionId" FROM SessionConversions)
      )
      SELECT
        combination,
        COUNT(*) as conversions
      FROM SearchFilters
      WHERE jsonb_build_object() != combination -- Ignorar combinações vazias
      GROUP BY combination
      ORDER BY conversions DESC
      LIMIT ${queryDto.limit || 10}
    `;

    return {
      filters: results.map((r) => ({
        combination: this.formatFilterCombination(
          r.combination as Record<string, string | string[]>,
        ),
        conversions: Number(r.conversions),
      })),
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    };
  }

  /**
   * Fetches and parses the XML sitemap to get current stock.
   */
}
