'use client'

import { useState } from 'react'
import { useSiteContext } from '@/lib/providers/SiteProvider'
import {
  useSearchSummary,
  useConversionSummary,
  usePopularProperties,
  useTopConvertingFilters,
  useDevicesTimeSeries,
  useGlobalKPIs,
  useGlobalFunnel,
  useUnderperformingProperties,
  useStagnantProperties,
  useJourneyStats,
} from '@/lib/hooks/useInsights'
import { useCampaignRecommendations } from '@/lib/hooks/useCampaignRecommendations'
import { KPISection } from './_components/KPISection'
import { FunnelSection } from './_components/FunnelSection'
import { PropertySection } from './_components/PropertySection'
import { JourneySection } from './_components/JourneySection'
import { RecommendationCard } from '@/lib/components/insights/RecommendationCard'
import { PeriodSelector } from '@/lib/components/insights/PeriodSelector'
import { SectionHeader } from '@/lib/components/dashboard'
import { Badge } from '@ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Spinner } from '@ui/spinner'

import {
  Lightbulb,
  BarChart3,
  Target,
  Building2,
  Search,
  Globe,
} from 'lucide-react'
import type { InsightsQuery } from '@/lib/types/insights'
import { DevicesChart } from './demand/_components/DevicesChart'
import { formatDateToISO } from '@/lib/utils'

export default function InsightsOverviewPage() {
  const { selectedSiteKey } = useSiteContext()
  const [dateQuery, setDateQuery] = useState<InsightsQuery>(() => {
    // Initialize with default 30 days period
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    const start = new Date()
    start.setDate(start.getDate() - 30)
    start.setHours(0, 0, 0, 0)
    return {
      dateFilter: 'CUSTOM',
      startDate: formatDateToISO(start),
      endDate: formatDateToISO(end),
    }
  })

  const handlePeriodChange = (start: Date, end: Date) => {
    setDateQuery({
      dateFilter: 'CUSTOM',
      startDate: formatDateToISO(start),
      endDate: formatDateToISO(end),
    })
  }

  // --- NEW HOOKS ---
  const { data: kpiData, isLoading: isLoadingKPI } = useGlobalKPIs(
    selectedSiteKey || '',
    dateQuery
  )

  const { data: funnelData, isLoading: funnelLoading } = useGlobalFunnel(
    selectedSiteKey || '',
    dateQuery
  )

  const { data: underperformingData, isLoading: isLoadingUnderperforming } =
    useUnderperformingProperties(selectedSiteKey || '', dateQuery)

  const { data: stagnantData, isLoading: isLoadingStagnant } =
    useStagnantProperties(selectedSiteKey || '', dateQuery)

  const { data: journeyData, isLoading: isLoadingJourney } = useJourneyStats(
    selectedSiteKey || '',
    dateQuery
  )


  // --- EXISTING HOOKS (Keep for recommendations and other charts) ---
  const { data: searchData, isLoading: searchLoading } = useSearchSummary(
    selectedSiteKey || '',
    { limit: 10, ...dateQuery }
  )

  const { data: conversionData, isLoading: conversionLoading } =
    useConversionSummary(selectedSiteKey || '', dateQuery)

  const { data: propertiesData, isLoading: isLoadingProperty } =
    usePopularProperties(selectedSiteKey || '', { limit: 10, ...dateQuery })

  const { data: topFiltersData } = useTopConvertingFilters(
    selectedSiteKey || '',
    { limit: 10, ...dateQuery }
  )

  const { data: devicesData, isLoading: isLoadingDevices } =
    useDevicesTimeSeries(selectedSiteKey || '', dateQuery)

  // Generate campaign recommendations
  const recommendations = useCampaignRecommendations({
    searchData,
    conversionData,
    propertiesData,
    topFiltersData,
  })

  if (!selectedSiteKey) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-sm sm:text-base text-muted-foreground px-4 text-center">
          Por favor, selecione um site para visualizar as análises
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <Badge variant="secondary" className="px-2.5 py-0.5 text-xs">
            <BarChart3 className="w-3 h-3 mr-1.5" />
            Dashboard Analytics
          </Badge>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            Visão Geral do Negócio
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Acompanhe os principais indicadores de performance, funil de vendas
            e oportunidades de mercado.
          </p>
        </div>
        <PeriodSelector onPeriodChange={handlePeriodChange} />
      </div>

      {/* 1. Global KPIs */}
      <KPISection data={kpiData} isLoading={isLoadingKPI} />

      {/* 2. Quick Links to Detailed Sections */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
        <Card
          className="bg-card border border-border/40 shadow-sm hover:shadow-md transition-all duration-200 ease-out cursor-pointer group"
          onClick={() => (window.location.href = '/admin/insights/funnel')}
        >
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-200" />
              <CardTitle className="text-sm sm:text-base font-semibold">
                Funil de Vendas
              </CardTitle>
            </div>
            <CardDescription className="text-xs mb-3">
              Visualize a jornada completa do cliente
            </CardDescription>
            {funnelLoading ? (
              <Spinner className="h-4 w-4" />
            ) : funnelData ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Buscas</span>
                  <span className="font-medium">
                    {funnelData.searches.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Leads</span>
                  <span className="font-medium">
                    {funnelData.leads.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Sem dados</p>
            )}
          </CardContent>
        </Card>

        <Card
          className="bg-card border border-border/40 shadow-sm hover:shadow-md transition-all duration-200 ease-out cursor-pointer group"
          onClick={() => (window.location.href = '/admin/insights/properties')}
        >
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-200" />
              <CardTitle className="text-sm sm:text-base font-semibold">
                Imóveis
              </CardTitle>
            </div>
            <CardDescription className="text-xs mb-3">
              Performance dos seus anúncios
            </CardDescription>
            {isLoadingProperty ? (
              <Spinner className="h-4 w-4" />
            ) : propertiesData ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Imóveis rastreados
                  </span>
                  <span className="font-medium">
                    {propertiesData.properties.length}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Mais popular</span>
                  <span className="font-medium">
                    #{propertiesData.properties[0]?.codigo || 'N/A'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Sem dados</p>
            )}
          </CardContent>
        </Card>

        <Card
          className="bg-card border border-border/40 shadow-sm hover:shadow-md transition-all duration-200 ease-out cursor-pointer group"
          onClick={() => (window.location.href = '/admin/insights/demand')}
        >
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-200" />
              <CardTitle className="text-sm sm:text-base font-semibold">
                Demanda
              </CardTitle>
            </div>
            <CardDescription className="text-xs mb-3">
              O que seus clientes procuram
            </CardDescription>
            {searchLoading ? (
              <Spinner className="h-4 w-4" />
            ) : searchData ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total de buscas</span>
                  <span className="font-medium">
                    {searchData.totalSearches.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Cidade mais buscada
                  </span>
                  <span className="font-medium">
                    {searchData.topCidades[0]?.cidade || 'N/A'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Sem dados</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        <Card
          className="bg-card border border-border/40 shadow-sm hover:shadow-md transition-all duration-200 ease-out cursor-pointer group"
          onClick={() => (window.location.href = '/admin/insights/journey')}
        >
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-200" />
              <CardTitle className="text-sm sm:text-base font-semibold">
                Jornada
              </CardTitle>
            </div>
            <CardDescription className="text-xs mb-3">
              Comportamento dos visitantes
            </CardDescription>
            {isLoadingJourney ? (
              <Spinner className="h-4 w-4" />
            ) : journeyData ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Tempo médio no site
                  </span>
                  <span className="font-medium">
                    {Math.floor(journeyData.avgTimeOnSite / 60)}m{' '}
                    {Math.floor(journeyData.avgTimeOnSite % 60)}s
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Páginas por sessão
                  </span>
                  <span className="font-medium">
                    {journeyData.avgPageDepth.toFixed(1)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Sem dados</p>
            )}
          </CardContent>
        </Card>

        <Card
          className="bg-card border border-border/40 shadow-sm hover:shadow-md transition-all duration-200 ease-out cursor-pointer group"
          onClick={() => (window.location.href = '/admin/insights/conversion')}
        >
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-200" />
              <CardTitle className="text-sm sm:text-base font-semibold">
                Conversões
              </CardTitle>
            </div>
            <CardDescription className="text-xs mb-3">
              Leads e taxa de conversão
            </CardDescription>
            {conversionLoading ? (
              <Spinner className="h-4 w-4" />
            ) : conversionData ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Total de conversões
                  </span>
                  <span className="font-medium">
                    {conversionData.totalConversions.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Taxa de conversão
                  </span>
                  <span className="font-medium">
                    {conversionData.conversionRate.toFixed(2)}%
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Sem dados</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3. Devices Chart */}
      <DevicesChart data={devicesData} isLoading={isLoadingDevices} />

      {/* 4. Campaign Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <SectionHeader
            icon={Lightbulb}
            title="Recomendações de Campanhas"
            description="Insights acionáveis baseados no comportamento dos visitantes do seu site"
          />
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            {recommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
