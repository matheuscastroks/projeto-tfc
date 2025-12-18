'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Button } from '@ui/button'
import { Spinner } from '@ui/spinner'
import { useSiteContext } from '@/lib/providers/SiteProvider'
import {
  useSearchSummary,
  useTopConvertingFilters,
  useDevicesTimeSeries,
} from '@/lib/hooks/useInsights'
import {
  TrendingUp,
  MapPin,
  Target,
  MoreHorizontal,
  Search,
} from 'lucide-react'
import { TopFinalidadesChart } from './_components/TopFinalidadesChart'
import { TopCidadesChart } from './_components/TopCidadesChart'
import { TopBairrosChart } from './_components/TopBairrosChart'
import { DevicesChart } from './_components/DevicesChart'
import { TopConvertingFiltersTable } from './_components/TopConvertingFiltersTable'
import { PropertyFeaturesPanel } from './_components/PropertyFeaturesPanel'
import { PriceAreaPanel } from './_components/PriceAreaPanel'
import {
  DetailsModal,
  type DetailsDataItem,
} from '@/lib/components/insights/DetailsModal'
import { PeriodSelector } from '@/lib/components/insights/PeriodSelector'
import { EnhancedMetricCard, SectionHeader } from '@/lib/components/dashboard'
import { Badge } from '@ui/badge'
import type { InsightsQuery } from '@/lib/types/insights'
import { formatDateToISO } from '@/lib/utils'

export default function SearchAnalyticsPage() {
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

  const { data: searchData, isLoading: searchLoading } = useSearchSummary(
    selectedSiteKey || '',
    dateQuery
  )

  const {
    data: topConvertingFiltersData,
    isLoading: topConvertingFiltersLoading,
  } = useTopConvertingFilters(selectedSiteKey || '', dateQuery)
  const { data: devicesData, isLoading: devicesLoading } = useDevicesTimeSeries(
    selectedSiteKey || '',
    dateQuery
  )

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalData, setModalData] = useState<{
    title: string
    description?: string
    data: DetailsDataItem[]
    visualization?: 'table' | 'list' | 'chart-bars'
    recommendations?: string[]
  }>({
    title: '',
    data: [],
  })

  const openDetailsModal = (
    title: string,
    data: DetailsDataItem[],
    description?: string,
    recommendations?: string[],
    visualization: 'table' | 'list' | 'chart-bars' = 'chart-bars'
  ) => {
    setModalData({ title, description, data, visualization, recommendations })
    setModalOpen(true)
  }

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
    <div className="space-y-6 sm:space-y-8 pb-6 sm:pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
        <div className="space-y-2 sm:space-y-3">
          <Badge variant="secondary" className="px-3 py-1 text-xs sm:text-sm">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
            Análise de Buscas
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Descubra o que seus clientes procuram
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
            Use estes insights para ajustar seu inventário e criar campanhas
            segmentadas para as localidades e características mais procuradas
          </p>
        </div>
        <PeriodSelector onPeriodChange={handlePeriodChange} />
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <EnhancedMetricCard
          title="Total de Buscas"
          value={searchData?.totalSearches.toLocaleString() || '0'}
          subtitle="Pesquisas realizadas no período"
          icon={Target}
          isLoading={searchLoading}
        />

        <EnhancedMetricCard
          title="Filtros que Convertem"
          value={topConvertingFiltersData?.filters?.length || '0'}
          subtitle="Combinações identificadas"
          icon={TrendingUp}
          isLoading={topConvertingFiltersLoading}
        />

        <div className="md:col-span-2">
          <DevicesChart data={devicesData} isLoading={devicesLoading} />
        </div>
      </div>

      {/* Section: Location Analysis */}
      <div className="space-y-4 sm:space-y-6">
        <SectionHeader
          icon={MapPin}
          title="Análise Geográfica"
          description="Entenda quais cidades e bairros seus visitantes mais procuram"
        />
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          <Card className="bg-card border border-border/40 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ease-out group">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Cidades Mais Buscadas</CardTitle>
                <CardDescription>
                  Top 5 cidades com mais pesquisas
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const cities = searchData?.topCidades || []
                  openDetailsModal(
                    'Todas as Cidades',
                    cities.map((c) => ({
                      label: c.cidade,
                      value: c.count,
                      percentage:
                        (c.count / (searchData?.totalSearches || 1)) * 100,
                    })),
                    'Ranking completo de todas as cidades buscadas',
                    [
                      `${cities[0]?.cidade || 'A cidade mais buscada'} representa ${(((cities[0]?.count || 0) / (searchData?.totalSearches || 1)) * 100).toFixed(1)}% de todas as buscas`,
                      'Considere aumentar o inventário nesta região',
                      'Crie campanhas segmentadas para as top 3 cidades',
                    ]
                  )
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {searchLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : (
                <TopCidadesChart data={searchData} />
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border border-border/40 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ease-out group">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Bairros Mais Buscados</CardTitle>
                <CardDescription>
                  Top 5 bairros com mais interesse
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const bairros = searchData?.topBairros || []
                  openDetailsModal(
                    'Todos os Bairros',
                    bairros.map((b) => ({
                      label: b.bairro,
                      value: b.count,
                      percentage:
                        (b.count / (searchData?.totalSearches || 1)) * 100,
                    })),
                    'Ranking completo de todos os bairros buscados',
                    [
                      'Bairros específicos indicam público mais segmentado',
                      'Use estes dados para destacar imóveis nestas regiões',
                    ]
                  )
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <TopBairrosChart data={searchData} isLoading={searchLoading} />
            </CardContent>
          </Card>

          <Card className="bg-card border border-border/40 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ease-out group">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Finalidades Mais Buscadas</CardTitle>
                  <CardDescription>
                    Distribuição entre venda e aluguel
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const finalidades = searchData?.topFinalidades || []
                  openDetailsModal(
                    'Finalidades Detalhadas',
                    finalidades.map((f) => ({
                      label: f.finalidade,
                      value: f.count,
                      percentage:
                        (f.count / (searchData?.totalSearches || 1)) * 100,
                    })),
                    'Análise completa de todas as finalidades de busca',
                    [
                      `A finalidade predominante é ${finalidades[0]?.finalidade || 'N/A'}`,
                      'Ajuste seu inventário para atender esta demanda',
                      'Considere criar landing pages específicas por finalidade',
                    ]
                  )
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {searchLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : (
                <TopFinalidadesChart data={searchData} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section: Property Features & Price/Area */}
      <div className="space-y-4 sm:space-y-6">
        <PropertyFeaturesPanel
          data={searchData}
          isLoading={searchLoading}
          openDetailsModal={openDetailsModal}
        />
        <PriceAreaPanel
          data={searchData}
          isLoading={searchLoading}
          openDetailsModal={openDetailsModal}
        />
      </div>

      {/* Section: Top Converting Filters */}
      <div className="space-y-4 sm:space-y-6">
        <SectionHeader
          icon={TrendingUp}
          title="Filtros que Mais Convertem"
          description="Combinações de filtros com maior taxa de conversão"
        />
        <Card className="bg-card border border-border/40 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ease-out">
          <CardContent>
            {topConvertingFiltersLoading ? (
              <div className="flex items-center justify-center h-48">
                <Spinner className="h-8 w-8" />
              </div>
            ) : (
              <TopConvertingFiltersTable
                data={topConvertingFiltersData}
                isLoading={topConvertingFiltersLoading}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details Modal */}
      <DetailsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={modalData.title}
        description={modalData.description}
        data={modalData.data}
        visualization={modalData.visualization}
        recommendations={modalData.recommendations}
      />
    </div>
  )
}
