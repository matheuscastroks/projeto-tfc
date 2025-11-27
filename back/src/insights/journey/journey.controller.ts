import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UnifiedGuard } from '../../common/guards/unified.guard';
import { RequireTenant } from '../../common/decorators/require-tenant.decorator';
import { SiteKey } from '../../common/decorators/site-key.decorator';
import { InsightsQueryDto } from '../dto/insights-query.dto';
import { JourneyResponse } from '../interfaces/categorized-insights.interface';
import { JourneyService } from './journey.service';

@ApiTags('Insights - Journey')
@Controller('insights/journey')
@UseGuards(UnifiedGuard)
@RequireTenant()
export class JourneyController {
  constructor(private readonly journeyService: JourneyService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Obter estatísticas de jornada',
    description:
      'Retorna métricas de comportamento do usuário (tempo no site, profundidade, recorrência).',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas de jornada retornadas com sucesso.',
  })
  async getJourneyStats(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<JourneyResponse> {
    return this.journeyService.getJourneyStats(siteKey, queryDto);
  }
}
