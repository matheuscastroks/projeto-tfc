import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InsightsQueryDto } from '../dto/insights-query.dto';
import { DateFilter } from '../../events/dto/get-events.dto';
import {
  SearchAnalyticsResponse,
  TopConvertingFiltersResponse,
  DemandVsSupplyResponse,
} from '../interfaces/categorized-insights.interface';
import { Prisma } from '@prisma/client';
import { XMLParser } from 'fast-xml-parser';
import { EventName } from '../dto/event-schema';
import { PropertyKeys } from '../constants/property-keys.constant';

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
        AND name = ${EventName.SEARCH}
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
    `;

    const totalSearches = Number(totalResult[0]?.total || 0);

    // Buscar as principais finalidades
    const finalidades = await this.prisma.$queryRaw<
      Array<{ finalidade: string; count: bigint }>
    >`
      SELECT
        properties->>${PropertyKeys.STATUS} as finalidade,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = ${EventName.SEARCH}
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->>${PropertyKeys.STATUS} IS NOT NULL
      GROUP BY properties->>${PropertyKeys.STATUS}
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar os principais tipos
    const tipos = await this.prisma.$queryRaw<
      Array<{ tipo: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->${PropertyKeys.TYPE}) as tipo,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = ${EventName.SEARCH}
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->${PropertyKeys.TYPE} IS NOT NULL
      GROUP BY tipo
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar as principais cidades
    const cidades = await this.prisma.$queryRaw<
      Array<{ cidade: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->${PropertyKeys.CITY}) as cidade,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = ${EventName.SEARCH}
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->${PropertyKeys.CITY} IS NOT NULL
      GROUP BY cidade
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar os principais bairros
    const bairros = await this.prisma.$queryRaw<
      Array<{ bairro: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->${PropertyKeys.NEIGHBORHOOD}) as bairro,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = ${EventName.SEARCH}
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->${PropertyKeys.NEIGHBORHOOD} IS NOT NULL
      GROUP BY bairro
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar os principais números de quartos
    const quartos = await this.prisma.$queryRaw<
      Array<{ quartos: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->${PropertyKeys.BEDROOMS}) as quartos,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = ${EventName.SEARCH}
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->${PropertyKeys.BEDROOMS} IS NOT NULL
      GROUP BY quartos
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar os principais números de suítes
    const suites = await this.prisma.$queryRaw<
      Array<{ suites: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->${PropertyKeys.SUITES}) as suites,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = ${EventName.SEARCH}
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->${PropertyKeys.SUITES} IS NOT NULL
      GROUP BY suites
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar os principais números de banheiros
    const banheiros = await this.prisma.$queryRaw<
      Array<{ banheiros: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->${PropertyKeys.BATHROOMS}) as banheiros,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = ${EventName.SEARCH}
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->${PropertyKeys.BATHROOMS} IS NOT NULL
      GROUP BY banheiros
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar os principais números de vagas
    const vagas = await this.prisma.$queryRaw<
      Array<{ vagas: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->${PropertyKeys.GARAGE}) as vagas,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = ${EventName.SEARCH}
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->${PropertyKeys.GARAGE} IS NOT NULL
      GROUP BY vagas
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar as principais salas (comercial)
    const salas = await this.prisma.$queryRaw<
      Array<{ salas: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->${PropertyKeys.LIVING_ROOMS}) as salas,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = ${EventName.SEARCH}
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->${PropertyKeys.LIVING_ROOMS} IS NOT NULL
      GROUP BY salas
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar os principais galpões (comercial)
    const galpoes = await this.prisma.$queryRaw<
      Array<{ galpoes: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->${PropertyKeys.WAREHOUSES}) as galpoes,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = ${EventName.SEARCH}
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->${PropertyKeys.WAREHOUSES} IS NOT NULL
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
            WHEN (properties->'salePrice'->>'min')::NUMERIC < 100000 THEN '0-100k'
            WHEN (properties->'salePrice'->>'min')::NUMERIC < 300000 THEN '100k-300k'
            WHEN (properties->'salePrice'->>'min')::NUMERIC < 500000 THEN '300k-500k'
            WHEN (properties->'salePrice'->>'min')::NUMERIC < 1000000 THEN '500k-1M'
            ELSE '1M+'
          END as range
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND properties->'salePrice' IS NOT NULL
          AND properties->'salePrice'->>'min' IS NOT NULL
          AND properties->'salePrice'->>'min' != '0'
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
            WHEN (properties->'rentPrice'->>'min')::NUMERIC < 1000 THEN '0-1k'
            WHEN (properties->'rentPrice'->>'min')::NUMERIC < 2000 THEN '1k-2k'
            WHEN (properties->'rentPrice'->>'min')::NUMERIC < 3000 THEN '2k-3k'
            WHEN (properties->'rentPrice'->>'min')::NUMERIC < 5000 THEN '3k-5k'
            ELSE '5k+'
          END as range
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND properties->'rentPrice' IS NOT NULL
          AND properties->'rentPrice'->>'min' IS NOT NULL
          AND properties->'rentPrice'->>'min' != '0'
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
            WHEN (properties->'area'->>'min')::NUMERIC < 50 THEN '0-50m²'
            WHEN (properties->'area'->>'min')::NUMERIC < 100 THEN '50-100m²'
            WHEN (properties->'area'->>'min')::NUMERIC < 200 THEN '100-200m²'
            WHEN (properties->'area'->>'min')::NUMERIC < 300 THEN '200-300m²'
            ELSE '300m²+'
          END as range
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND properties->'area' IS NOT NULL
          AND properties->'area'->>'min' IS NOT NULL
          AND properties->'area'->>'min' != '0'
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
          AND (properties->>'furnished')::BOOLEAN = true
        UNION ALL
        SELECT 'Imóvel Novo'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->>'newProperty')::BOOLEAN = true
        UNION ALL
        SELECT 'Imóvel Novo'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name IN ('search_submit', 'search')
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->>'newProperty')::BOOLEAN = true
        UNION ALL
        SELECT 'Na Planta'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->>'na_planta')::BOOLEAN = true
        UNION ALL
        SELECT 'Em Construção'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->>'em_construcao')::BOOLEAN = true
        UNION ALL
        SELECT 'Aceita Permuta'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->>'aceita_permuta')::BOOLEAN = true
        UNION ALL
        SELECT 'Pet Friendly'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->>'pet_friendly')::BOOLEAN = true
        UNION ALL
        SELECT 'Seguro Fiança'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->>'seguro_fianca')::BOOLEAN = true
        UNION ALL
        SELECT 'Reservado'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name IN ('search_submit', 'search')
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->>'reservado')::BOOLEAN = true
        UNION ALL
        SELECT 'Valor Total Pacote'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->>'valor_total_pacote')::BOOLEAN = true
      )
      SELECT switch_name as switch, COUNT(*) as count
      FROM switch_events
      GROUP BY switch_name
      ORDER BY count DESC
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
        jsonb_array_elements_text(properties->${PropertyKeys.AMENITIES}) as comodidade,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = ${EventName.SEARCH}
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->${PropertyKeys.AMENITIES} IS NOT NULL
      GROUP BY comodidade
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar principais itens de lazer
    const lazer = await this.prisma.$queryRaw<
      Array<{ lazer: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->${PropertyKeys.LEISURE}) as lazer,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = ${EventName.SEARCH}
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->${PropertyKeys.LEISURE} IS NOT NULL
      GROUP BY lazer
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar itens principais de segurança
    const seguranca = await this.prisma.$queryRaw<
      Array<{ seguranca: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->${PropertyKeys.SECURITY}) as seguranca,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = ${EventName.SEARCH}
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->${PropertyKeys.SECURITY} IS NOT NULL
      GROUP BY seguranca
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar comodos principais (área de serviço e varanda)
    const comodos = await this.prisma.$queryRaw<
      Array<{ comodo: string; count: bigint }>
    >`

      SELECT
        jsonb_array_elements_text(properties->${PropertyKeys.ROOMS}) as comodo,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = ${EventName.SEARCH}
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->${PropertyKeys.ROOMS} IS NOT NULL
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

    // Essa consulta faz um join entre eventos de search_submit e conversões
    // no mesmo sessionId
    const results = await this.prisma.$queryRaw<
      Array<{ combination: Prisma.JsonValue; conversions: bigint }>
    >`
      WITH SessionConversions AS (
        SELECT DISTINCT "sessionId"
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name IN (${EventName.CLICK_CONTACT}, ${EventName.SUBMIT_LEAD_FORM}, 'thank_you_view')
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
      ),
      SearchFilters AS (
        SELECT
          "sessionId",
          jsonb_strip_nulls(
            jsonb_build_object(
              'finalidade', properties->>${PropertyKeys.STATUS},
              'cidade', properties->${PropertyKeys.CITY}->>0,
              'tipo', properties->${PropertyKeys.TYPE}->>0,
              'quartos', properties->${PropertyKeys.BEDROOMS}->>0
            )
          ) as combination
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = ${EventName.SEARCH}
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
  private async fetchStockFromSitemap(siteKey: string): Promise<string[]> {
    try {
      // 1. Get Site Domain
      const site = await this.prisma.site.findUnique({
        where: { siteKey },
        include: { domains: { where: { isPrimary: true } } },
      });

      if (!site || !site.domains || site.domains.length === 0) {
        this.logger.warn(`No primary domain found for site ${siteKey}`);
        return [];
      }

      const domain = site.domains[0].host;
      // Extract domain name (between . and .com.br or just the host)
      // Example: www.aepatrimonio.com.br -> aepatrimonio
      // Example: aepatrimonio.com.br -> aepatrimonio
      const domainParts = domain.split('.');
      let domainName = domainParts[0];
      if (domainName === 'www' && domainParts.length > 1) {
        domainName = domainParts[1];
      }

      const sitemapUrl = `https://${domain}/xml/${domainName}/sitemap-imoveis.xml`;
      this.logger.log(`Fetching sitemap from: ${sitemapUrl}`);

      // 2. Fetch XML
      const response = await fetch(sitemapUrl);
      if (!response.ok) {
        this.logger.warn(
          `Failed to fetch sitemap: ${response.status} ${response.statusText}`,
        );
        return [];
      }
      const xmlData = await response.text();

      // 3. Parse XML
      const parser = new XMLParser();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const jObj = parser.parse(xmlData);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!jObj.urlset || !jObj.urlset.url) {
        this.logger.warn('Invalid sitemap format');
        return [];
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const urls: any[] = Array.isArray(jObj.urlset.url)
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          jObj.urlset.url
        : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          [jObj.urlset.url];

      // 4. Extract Property Codes
      // URL format: https://domain.com.br/imovel/CODE/slug
      const propertyCodes: string[] = [];
      const regex = /\/imovel\/(\d+)\//;

      for (const urlObj of urls) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const loc: string = urlObj.loc;
        if (loc) {
          const match = loc.match(regex);
          if (match && match[1]) {
            propertyCodes.push(match[1]);
          }
        }
      }

      return propertyCodes;
    } catch (error) {
      this.logger.error(
        `Error fetching stock for ${siteKey}:`,
        error instanceof Error ? error.stack : error,
      );
      return [];
    }
  }

  async getDemandVsSupply(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<DemandVsSupplyResponse> {
    const dateRange = this.getDateRange(
      queryDto.dateFilter,
      queryDto.startDate,
      queryDto.endDate,
    );

    // 1. Get Demand (Search Events)
    // We'll focus on "Quartos" as a key category for comparison for now,
    // as it's a common filter and easy to map if we had property details.
    // However, since we ONLY have property CODES from the sitemap, we can't know the features of the stock
    // unless we fetch each property page or have that data indexed.
    //
    // WAIT: The user said "Use o código para comparar".
    // But comparing codes doesn't give me "Demand vs Supply" by category (e.g. "3 bedrooms").
    // It only tells me if specific properties are being searched? No, search is by criteria.
    //
    // If I only have the list of active property codes, I can't know if I have "3 bedroom houses" in stock
    // unless I have that metadata stored.
    //
    // Assumption: The `Event` table might have `property_page_view` events that contain property details (quartos, etc.)
    // stored in `properties` JSON. I can use the *latest* view event for each property code to infer its attributes.
    // This is a heuristic.
    //
    // Let's try to build a "Virtual Stock" based on the attributes seen in `property_page_view` events
    // for the codes present in the sitemap.

    // Step A: Get Active Codes from Sitemap
    const activeCodes = await this.fetchStockFromSitemap(siteKey);
    const activeCodesSet = new Set(activeCodes);

    // Step B: Get Attributes of these codes from historical events
    // We look for the most recent `property_page_view` for each code to get its current state (quartos, type, etc)
    const stockAttributes = await this.prisma.$queryRaw<
      Array<{
        codigo: string;
        quartos: string;
        tipo: string;
      }>
    >`
      SELECT DISTINCT ON (properties->>'codigo')
        properties->>'codigo' as codigo,
        properties->>'quartos' as quartos,
        properties->>'tipo' as tipo
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'property_page_view'
        AND properties->>'codigo' IS NOT NULL
      ORDER BY properties->>'codigo', ts DESC
    `;

    // Filter stock by active codes
    const activeStock = stockAttributes.filter((p) =>
      activeCodesSet.has(p.codigo),
    );

    // Step C: Aggregate Supply by Category (e.g., Quartos)
    const supplyMap = new Map<string, number>();
    let totalSupply = 0;

    for (const item of activeStock) {
      // Normalize Quartos
      const q = item.quartos || 'N/A';
      const key = `${q} Quartos`;
      supplyMap.set(key, (supplyMap.get(key) || 0) + 1);
      totalSupply++;
    }

    // Step D: Aggregate Demand by Category (Quartos from Search)
    const demandResult = await this.prisma.$queryRaw<
      Array<{ quartos: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->'quartos') as quartos,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search_submit'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->'quartos' IS NOT NULL
      GROUP BY quartos
    `;

    const demandMap = new Map<string, number>();
    let totalDemand = 0;

    for (const item of demandResult) {
      const key = `${item.quartos} Quartos`;
      const count = Number(item.count);
      demandMap.set(key, count);
      totalDemand += count;
    }

    // Step E: Build Response
    // We'll use the keys from both maps
    const allCategories = new Set([...supplyMap.keys(), ...demandMap.keys()]);

    const demandList: {
      category: string;
      count: number;
      percentage: number;
    }[] = [];
    const supplyList: {
      category: string;
      count: number;
      percentage: number;
    }[] = [];
    const gapList: { category: string; gapScore: number }[] = [];

    for (const cat of allCategories) {
      if (cat === 'N/A Quartos') continue; // Skip undefined

      const dCount = demandMap.get(cat) || 0;
      const sCount = supplyMap.get(cat) || 0;

      const dPct = totalDemand > 0 ? (dCount / totalDemand) * 100 : 0;
      const sPct = totalSupply > 0 ? (sCount / totalSupply) * 100 : 0;

      demandList.push({
        category: cat,
        count: dCount,
        percentage: Math.round(dPct * 10) / 10,
      });

      supplyList.push({
        category: cat,
        count: sCount,
        percentage: Math.round(sPct * 10) / 10,
      });

      // Gap Score: Difference in percentage points
      // Positive = Demand > Supply (Opportunity)
      // Negative = Supply > Demand (Oversupply)
      gapList.push({
        category: cat,
        gapScore: Math.round((dPct - sPct) * 10) / 10,
      });
    }

    // Sort by Gap Score descending
    gapList.sort((a, b) => b.gapScore - a.gapScore);
    demandList.sort((a, b) => b.count - a.count);
    supplyList.sort((a, b) => b.count - a.count);

    return {
      demand: demandList,
      supply: supplyList,
      gap: gapList,
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    };
  }
}
