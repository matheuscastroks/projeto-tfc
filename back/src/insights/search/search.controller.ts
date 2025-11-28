import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UnifiedGuard } from '../../common/guards/unified.guard';
import { RequireTenant } from '../../common/decorators/require-tenant.decorator';
import { SiteKey } from '../../common/decorators/site-key.decorator';
import { InsightsQueryDto } from '../dto/insights-query.dto';
import {
  SearchAnalyticsResponse,
  TopConvertingFiltersResponse,
  DemandVsSupplyResponse,
} from '../interfaces/categorized-insights.interface';
import { SearchService } from './search.service';

@ApiTags('Insights - Search')
@Controller('insights/search')
@UseGuards(UnifiedGuard)
@RequireTenant()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Obter resumo de analytics de buscas',
    description:
      'Retorna resumo completo de analytics de buscas e filtros utilizados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumo de analytics de buscas retornado com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async getSearchAnalytics(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<SearchAnalyticsResponse> {
    return this.searchService.getSearchAnalytics(siteKey, queryDto);
  }

  @Get('top-converting-filters')
  @ApiOperation({
    summary: 'Obter filtros que mais convertem',
    description:
      'Retorna as combinações de filtros de busca com maior taxa de conversão.',
  })
  @ApiResponse({
    status: 200,
    description: 'Filtros que mais convertem retornados com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async getTopConvertingFilters(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<TopConvertingFiltersResponse> {
    return this.searchService.getTopConvertingFilters(siteKey, queryDto);
  }

  @Get('demand-vs-supply')
  @ApiOperation({
    summary: 'Obter demanda vs oferta',
    description: 'Compara o que os usuários buscam com o estoque disponível.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados de demanda vs oferta retornados com sucesso.',
  })
  async getDemandVsSupply(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<DemandVsSupplyResponse> {
    return this.searchService.getDemandVsSupply(siteKey, queryDto);
  }
}
