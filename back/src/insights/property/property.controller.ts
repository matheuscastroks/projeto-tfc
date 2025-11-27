import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UnifiedGuard } from '../../common/guards/unified.guard';
import { RequireTenant } from '../../common/decorators/require-tenant.decorator';
import { SiteKey } from '../../common/decorators/site-key.decorator';
import { InsightsQueryDto } from '../dto/insights-query.dto';
import {
  PopularPropertiesResponse,
  PropertyEngagementResponse,
  PropertyFunnelResponse,
  UnderperformingPropertiesResponse,
  StagnantPropertiesResponse,
} from '../interfaces/categorized-insights.interface';
import { PropertyService } from './property.service';

@ApiTags('Insights - Property')
@Controller('insights/properties')
@UseGuards(UnifiedGuard)
@RequireTenant()
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get('popular')
  @ApiOperation({
    summary: 'Obter imóveis populares',
    description:
      'Retorna os imóveis mais populares com base em visualizações e favoritos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Imóveis populares retornados com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async getPopularProperties(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<PopularPropertiesResponse> {
    return this.propertyService.getPopularProperties(siteKey, queryDto);
  }

  @Get('engagement')
  @ApiOperation({
    summary: 'Obter analytics de engajamento de imóveis',
    description:
      'Retorna métricas gerais de engajamento (visualizações e favoritos) de imóveis.',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics de engajamento retornados com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async getPropertyEngagement(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<PropertyEngagementResponse> {
    return this.propertyService.getPropertyEngagement(siteKey, queryDto);
  }

  @Get(':propertyCode/funnel')
  @ApiOperation({
    summary: 'Obter funil de conversão de imóvel',
    description:
      'Retorna o funil de conversão (visualizações → favoritos → leads) para um imóvel específico.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do funil de conversão retornados com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async getPropertyFunnel(
    @SiteKey() siteKey: string,
    @Param('propertyCode') propertyCode: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<PropertyFunnelResponse> {
    return this.propertyService.getPropertyFunnel(
      siteKey,
      propertyCode,
      queryDto,
    );
  }

  @Get('underperforming')
  @ApiOperation({
    summary: 'Obter imóveis com baixo desempenho',
    description: 'Retorna imóveis com muitas visualizações mas poucos leads.',
  })
  @ApiResponse({
    status: 200,
    description: 'Imóveis retornados com sucesso.',
  })
  async getUnderperformingProperties(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<UnderperformingPropertiesResponse> {
    return this.propertyService.getUnderperformingProperties(siteKey, queryDto);
  }

  @Get('stagnant')
  @ApiOperation({
    summary: 'Obter imóveis estagnados',
    description:
      'Retorna imóveis com poucas visualizações e muito tempo no ar.',
  })
  @ApiResponse({
    status: 200,
    description: 'Imóveis retornados com sucesso.',
  })
  async getStagnantProperties(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<StagnantPropertiesResponse> {
    return this.propertyService.getStagnantProperties(siteKey, queryDto);
  }
}
