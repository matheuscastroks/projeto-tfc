import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InsightsQueryDto } from '../dto/insights-query.dto';
import { DateFilter } from '../../events/dto/get-events.dto';
import {
  SearchAnalyticsResponse,
  FiltersUsageResponse,
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
        AND name = 'search_submit'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
    `;

    const totalSearches = Number(totalResult[0]?.total || 0);

    // Buscar as principais finalidades
    const finalidades = await this.prisma.$queryRaw<
      Array<{ finalidade: string; count: bigint }>
    >`
      SELECT
        properties->>'finalidade' as finalidade,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search_submit'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->>'finalidade' IS NOT NULL
      GROUP BY properties->>'finalidade'
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar os principais tipos
    const tipos = await this.prisma.$queryRaw<
      Array<{ tipo: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->'tipos') as tipo,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search_submit'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->'tipos' IS NOT NULL
      GROUP BY tipo
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar as principais cidades
    const cidades = await this.prisma.$queryRaw<
      Array<{ cidade: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->'cidades') as cidade,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search_submit'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->'cidades' IS NOT NULL
      GROUP BY cidade
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar os principais bairros
    const bairros = await this.prisma.$queryRaw<
      Array<{ bairro: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->'bairros') as bairro,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search_submit'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->'bairros' IS NOT NULL
      GROUP BY bairro
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar os principais números de quartos
    const quartos = await this.prisma.$queryRaw<
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
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar os principais números de suítes
    const suites = await this.prisma.$queryRaw<
      Array<{ suites: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->'suites') as suites,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search_submit'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->'suites' IS NOT NULL
      GROUP BY suites
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar os principais números de banheiros
    const banheiros = await this.prisma.$queryRaw<
      Array<{ banheiros: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->'banheiros') as banheiros,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search_submit'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->'banheiros' IS NOT NULL
      GROUP BY banheiros
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar os principais números de vagas
    const vagas = await this.prisma.$queryRaw<
      Array<{ vagas: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->'vagas') as vagas,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search_submit'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->'vagas' IS NOT NULL
      GROUP BY vagas
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar as principais salas (comercial)
    const salas = await this.prisma.$queryRaw<
      Array<{ salas: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->'salas') as salas,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search_submit'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->'salas' IS NOT NULL
      GROUP BY salas
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar os principais galpões (comercial)
    const galpoes = await this.prisma.$queryRaw<
      Array<{ galpoes: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->'galpoes') as galpoes,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search_submit'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->'galpoes' IS NOT NULL
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
            WHEN (properties->'preco_venda'->>'min')::NUMERIC < 100000 THEN '0-100k'
            WHEN (properties->'preco_venda'->>'min')::NUMERIC < 300000 THEN '100k-300k'
            WHEN (properties->'preco_venda'->>'min')::NUMERIC < 500000 THEN '300k-500k'
            WHEN (properties->'preco_venda'->>'min')::NUMERIC < 1000000 THEN '500k-1M'
            ELSE '1M+'
          END as range
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND properties->'preco_venda' IS NOT NULL
          AND properties->'preco_venda'->>'min' IS NOT NULL
          AND properties->'preco_venda'->>'min' != '0'
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
            WHEN (properties->'preco_aluguel'->>'min')::NUMERIC < 1000 THEN '0-1k'
            WHEN (properties->'preco_aluguel'->>'min')::NUMERIC < 2000 THEN '1k-2k'
            WHEN (properties->'preco_aluguel'->>'min')::NUMERIC < 3000 THEN '2k-3k'
            WHEN (properties->'preco_aluguel'->>'min')::NUMERIC < 5000 THEN '3k-5k'
            ELSE '5k+'
          END as range
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND properties->'preco_aluguel' IS NOT NULL
          AND properties->'preco_aluguel'->>'min' IS NOT NULL
          AND properties->'preco_aluguel'->>'min' != '0'
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
          AND name = 'search_submit'
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
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->>'mobiliado')::BOOLEAN = true
        UNION ALL
        SELECT 'Semi Mobiliado'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->>'semi_mobiliado')::BOOLEAN = true
        UNION ALL
        SELECT 'Promoção'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->>'promocao')::BOOLEAN = true
        UNION ALL
        SELECT 'Imóvel Novo'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->>'imovel_novo')::BOOLEAN = true
        UNION ALL
        SELECT 'Na Planta'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->>'na_planta')::BOOLEAN = true
        UNION ALL
        SELECT 'Em Construção'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->>'em_construcao')::BOOLEAN = true
        UNION ALL
        SELECT 'Aceita Permuta'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->>'aceita_permuta')::BOOLEAN = true
        UNION ALL
        SELECT 'Pet Friendly'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->>'pet_friendly')::BOOLEAN = true
        UNION ALL
        SELECT 'Seguro Fiança'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->>'seguro_fianca')::BOOLEAN = true
        UNION ALL
        SELECT 'Reservado'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->>'reservado')::BOOLEAN = true
        UNION ALL
        SELECT 'Valor Total Pacote'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
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
        AND name = 'search_submit'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
    `;

    const totalCount = Number(totalForPercentage[0]?.total || 1);

    // Buscar as principais comodidades
    const comodidades = await this.prisma.$queryRaw<
      Array<{ comodidade: string; count: bigint }>
    >`
      WITH comodidades_events AS (
        SELECT 'Ar Condicionado' as name
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->'comodidades'->>'ar_condicionado')::BOOLEAN = true
        UNION ALL
        SELECT 'Lareira'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->'comodidades'->>'lareira')::BOOLEAN = true
        UNION ALL
        SELECT 'Lavanderia'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->'comodidades'->>'lavanderia')::BOOLEAN = true
        UNION ALL
        SELECT 'Sauna'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->'comodidades'->>'sauna')::BOOLEAN = true
        UNION ALL
        SELECT 'Elevador'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->'comodidades'->>'elevador')::BOOLEAN = true
      )
      SELECT name as comodidade, COUNT(*) as count
      FROM comodidades_events
      GROUP BY name
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar principais itens de lazer
    const lazer = await this.prisma.$queryRaw<
      Array<{ lazer: string; count: bigint }>
    >`
      WITH lazer_events AS (
        SELECT 'Churrasqueira' as name
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->'lazer'->>'churrasqueira')::BOOLEAN = true
        UNION ALL
        SELECT 'Piscina'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->'lazer'->>'piscina')::BOOLEAN = true
        UNION ALL
        SELECT 'Academia'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->'lazer'->>'academia')::BOOLEAN = true
        UNION ALL
        SELECT 'Playground'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->'lazer'->>'playground')::BOOLEAN = true
        UNION ALL
        SELECT 'Salão de Festas'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->'lazer'->>'salao_festas')::BOOLEAN = true
        UNION ALL
        SELECT 'Salão de Jogos'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->'lazer'->>'salao_jogos')::BOOLEAN = true
      )
      SELECT name as lazer, COUNT(*) as count
      FROM lazer_events
      GROUP BY name
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar itens principais de segurança
    const seguranca = await this.prisma.$queryRaw<
      Array<{ seguranca: string; count: bigint }>
    >`
      WITH seguranca_events AS (
        SELECT 'Alarme' as name
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->'seguranca'->>'alarme')::BOOLEAN = true
        UNION ALL
        SELECT 'Circuito de TV'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->'seguranca'->>'circuito_tv')::BOOLEAN = true
        UNION ALL
        SELECT 'Interfone'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->'seguranca'->>'interfone')::BOOLEAN = true
        UNION ALL
        SELECT 'Portaria 24h'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->'seguranca'->>'portaria_24h')::BOOLEAN = true
      )
      SELECT name as seguranca, COUNT(*) as count
      FROM seguranca_events
      GROUP BY name
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Buscar comodos principais (área de serviço e varanda)
    const comodos = await this.prisma.$queryRaw<
      Array<{ comodo: string; count: bigint }>
    >`
      WITH comodos_events AS (
        SELECT 'Área de Serviço' as name
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->'comodos'->>'area_servico')::BOOLEAN = true
        UNION ALL
        SELECT 'Varanda'
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND (properties->'comodos'->>'varanda')::BOOLEAN = true
      )
      SELECT name as comodo, COUNT(*) as count
      FROM comodos_events
      GROUP BY name
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Calcular a média de filtros usados por busca
    const avgFiltersResult = await this.prisma.$queryRaw<
      Array<{ avg_filters: number }>
    >`
      SELECT AVG((properties->>'journey_length')::INTEGER) as avg_filters
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search_submit'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->>'journey_length' IS NOT NULL
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
      avgFiltersUsed: Math.round(avgFiltersResult[0]?.avg_filters || 0),
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    };
  }

  async getFiltersUsage(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<FiltersUsageResponse> {
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

    // Calcular total de alterações de filtro pelos eventos search_submit
    // Cada search_submit representa um uso de filtro
    const totalResult = await this.prisma.$queryRaw<Array<{ total: bigint }>>`
      SELECT COUNT(*) as total
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search_submit'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
    `;

    const totalFilterChanges = Number(totalResult[0]?.total || 0);

    // Buscar uso dos filtros por tipo
    // Extrai os campos de filtro do JSONB e conta cada ocorrência
    const filtersByType = await this.prisma.$queryRaw<
      Array<{ filter_field: string; count: bigint }>
    >`
      WITH expanded_filters AS (
        SELECT
          unnest(ARRAY[
            CASE WHEN properties->>'finalidade' IS NOT NULL THEN 'finalidade' END,
            CASE WHEN jsonb_array_length(COALESCE(properties->'tipos', '[]'::jsonb)) > 0 THEN 'tipos' END,
            CASE WHEN jsonb_array_length(COALESCE(properties->'cidades', '[]'::jsonb)) > 0 THEN 'cidades' END,
            CASE WHEN jsonb_array_length(COALESCE(properties->'bairros', '[]'::jsonb)) > 0 THEN 'bairros' END,
            CASE WHEN jsonb_array_length(COALESCE(properties->'quartos', '[]'::jsonb)) > 0 THEN 'quartos' END,
            CASE WHEN jsonb_array_length(COALESCE(properties->'suites', '[]'::jsonb)) > 0 THEN 'suites' END,
            CASE WHEN jsonb_array_length(COALESCE(properties->'banheiros', '[]'::jsonb)) > 0 THEN 'banheiros' END,
            CASE WHEN jsonb_array_length(COALESCE(properties->'vagas', '[]'::jsonb)) > 0 THEN 'vagas' END,
            CASE WHEN jsonb_array_length(COALESCE(properties->'salas', '[]'::jsonb)) > 0 THEN 'salas' END,
            CASE WHEN jsonb_array_length(COALESCE(properties->'galpoes', '[]'::jsonb)) > 0 THEN 'galpoes' END,
            CASE WHEN properties->'preco_venda' IS NOT NULL AND (properties->'preco_venda'->>'min') IS NOT NULL AND (properties->'preco_venda'->>'min') != '0' THEN 'preco_venda' END,
            CASE WHEN properties->'preco_aluguel' IS NOT NULL AND (properties->'preco_aluguel'->>'min') IS NOT NULL AND (properties->'preco_aluguel'->>'min') != '0' THEN 'preco_aluguel' END,
            CASE WHEN properties->'area' IS NOT NULL AND (properties->'area'->>'min') IS NOT NULL AND (properties->'area'->>'min') != '0' THEN 'area' END,
            CASE WHEN (properties->>'mobiliado')::BOOLEAN = true THEN 'mobiliado' END,
            CASE WHEN (properties->>'promocao')::BOOLEAN = true THEN 'promocao' END,
            CASE WHEN (properties->>'pet_friendly')::BOOLEAN = true THEN 'pet_friendly' END,
            CASE WHEN properties->>'codigo' IS NOT NULL AND properties->>'codigo' != '' THEN '@search/codigo' END,
            CASE WHEN properties->>'@search' IS NOT NULL AND properties->>'@search' != '' THEN '@search' END,
            CASE WHEN properties->>'search' IS NOT NULL AND properties->>'search' != '' THEN 'search' END,
            CASE WHEN properties->>'query' IS NOT NULL AND properties->>'query' != '' THEN 'query' END
          ]) as filter_field
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
      )
      SELECT
        filter_field,
        COUNT(*) as count
      FROM expanded_filters
      WHERE filter_field IS NOT NULL
      GROUP BY filter_field
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Calcular os percentuais dos filtros
    const filtersWithPercentage = filtersByType.map((f) => ({
      filterType: f.filter_field || 'unknown',
      count: Number(f.count),
      percentage:
        totalFilterChanges > 0
          ? Math.round((Number(f.count) / totalFilterChanges) * 100 * 100) / 100
          : 0,
    }));

    // Buscar principais combinações de filtros
    const combinations = await this.prisma.$queryRaw<
      Array<{ combination_key: string; count: bigint; filters: any }>
    >`
      WITH filter_combinations AS (
        SELECT
          id,
          properties,
          ARRAY_REMOVE(ARRAY[
            CASE WHEN properties->>'finalidade' IS NOT NULL THEN 'Finalidade: ' || (properties->>'finalidade') END,
            CASE WHEN jsonb_array_length(COALESCE(properties->'tipos', '[]'::jsonb)) > 0 THEN 'Tipo: ' || COALESCE(properties->'tipos'->>0, '') END,
            CASE WHEN jsonb_array_length(COALESCE(properties->'cidades', '[]'::jsonb)) > 0 THEN 'Cidade: ' || COALESCE(properties->'cidades'->>0, '') END,
            CASE WHEN jsonb_array_length(COALESCE(properties->'quartos', '[]'::jsonb)) > 0 THEN 'Quartos: ' || COALESCE(properties->'quartos'->>0, '') END,
            CASE WHEN properties->'preco_venda' IS NOT NULL AND (properties->'preco_venda'->>'min') IS NOT NULL AND (properties->'preco_venda'->>'min') != '0' THEN 'Preço Venda' END,
            CASE WHEN properties->'preco_aluguel' IS NOT NULL AND (properties->'preco_aluguel'->>'min') IS NOT NULL AND (properties->'preco_aluguel'->>'min') != '0' THEN 'Preço Aluguel' END,
            CASE WHEN (properties->>'mobiliado')::BOOLEAN = true THEN 'Mobiliado' END,
            CASE WHEN (properties->>'promocao')::BOOLEAN = true THEN 'Promoção' END,
            CASE WHEN (properties->>'pet_friendly')::BOOLEAN = true THEN 'Pet Friendly' END,
            CASE WHEN properties->>'codigo' IS NOT NULL AND properties->>'codigo' != '' THEN 'Busca: Código' END
          ], NULL) as filter_array
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
      ),
      unique_combinations AS (
        SELECT
          array_to_string(filter_array, ' + ') as combination_key,
          filter_array as filters
        FROM filter_combinations
        WHERE array_length(filter_array, 1) >= 2
      )
      SELECT
        combination_key,
        filters,
        COUNT(*) as count
      FROM unique_combinations
      WHERE combination_key IS NOT NULL AND combination_key != ''
      GROUP BY combination_key, filters
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    return {
      totalFilterChanges,
      filtersByType: filtersWithPercentage,
      topFilterCombinations: combinations.map((c) => ({
        combination: Array.isArray(c.filters) ? c.filters : [],
        count: Number(c.count),
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
          AND name IN ('conversion_whatsapp_click', 'thank_you_view')
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
      ),
      SearchFilters AS (
        SELECT
          "sessionId",
          jsonb_strip_nulls(
            jsonb_build_object(
              'finalidade', properties->>'finalidade',
              'cidade', properties->'cidades'->>0, -- Considerando apenas uma cidade como exemplo
              'tipo', properties->'tipos'->>0,     -- Considerando apenas um tipo
              'quartos', properties->'quartos'->>0 -- Considerando apenas um número de quartos
            )
          ) as combination
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND name = 'search_submit'
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
}
