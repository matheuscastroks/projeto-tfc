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
import { Skeleton } from '@ui/skeleton'
import { Spinner } from '@ui/spinner'
import { useSiteContext } from '@/lib/providers/SiteProvider'
import {
  usePopularProperties,
  usePropertyEngagement,
} from '@/lib/hooks/useInsights'
import { PopularPropertiesTable } from './_components/PopularPropertiesTable'
import { PopularPropertiesChart } from './_components/PopularPropertiesChart'
import {
  DetailsModal,
  type DetailsDataItem,
} from '@/lib/components/insights/DetailsModal'
import { PeriodSelector } from '@/lib/components/insights/PeriodSelector'
import { EnhancedMetricCard, SectionHeader } from '@/lib/components/dashboard'
import { Badge } from '@ui/badge'
import { Eye, Heart, TrendingUp, MoreHorizontal, Building2 } from 'lucide-react'
import type { InsightsQuery } from '@/lib/types/insights'
import { formatDateToISO } from '@/lib/utils'

export default function PropertiesAnalyticsPage() {
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

  const { data: popularData, isLoading: popularLoading } = usePopularProperties(
    selectedSiteKey || '',
    dateQuery
  )
  const { data: engagementData, isLoading: engagementLoading } =
    usePropertyEngagement(selectedSiteKey || '', dateQuery)

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
    visualization: 'table' | 'list' | 'chart-bars' = 'list'
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

  // Calculate engagement metrics
  const totalViews = engagementData?.totalViews || 0
  const totalFavorites = engagementData?.totalFavorites || 0
  const favoriteRate =
    totalViews > 0 ? ((totalFavorites / totalViews) * 100).toFixed(2) : '0'

  return (
    <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <Badge variant="secondary" className="px-2.5 py-0.5 text-xs">
            <Building2 className="w-3 h-3 mr-1.5" />
            Análise de Imóveis
          </Badge>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            Descubra seus imóveis mais populares
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Identifique quais imóveis geram mais interesse, visualizações e
            favoritos para priorizar suas estratégias de venda
          </p>
        </div>
        <PeriodSelector onPeriodChange={handlePeriodChange} />
      </div>

      {/* Metrics and Chart Grid */}
      <div className="space-y-3 sm:space-y-4">
        {/* Top Row: Metrics Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
          <EnhancedMetricCard
            title="Total de Visualizações"
            value={totalViews.toLocaleString()}
            subtitle="Visualizações realizadas"
            icon={Eye}
            isLoading={engagementLoading}
          />
          <EnhancedMetricCard
            title="Total de Favoritos"
            value={totalFavorites.toLocaleString()}
            subtitle="Favoritos salvos"
            icon={Heart}
            isLoading={engagementLoading}
          />
          <EnhancedMetricCard
            title="Taxa de Favoritos"
            value={`${favoriteRate}%`}
            subtitle="Favoritos por visualização"
            icon={TrendingUp}
            isLoading={engagementLoading}
            trend={
              parseFloat(favoriteRate) > 5
                ? 'up'
                : parseFloat(favoriteRate) < 2
                  ? 'down'
                  : 'neutral'
            }
            trendValue={
              parseFloat(favoriteRate) > 5
                ? 'Alto engajamento'
                : parseFloat(favoriteRate) < 2
                  ? 'Baixo engajamento'
                  : 'Engajamento médio'
            }
          />
        </div>

        {/* Bottom Row: Top Properties Chart */}
        <Card className="bg-card border border-border/40 shadow-sm hover:shadow-md transition-all duration-200 ease-out group">
          <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4">
            <div>
              <CardTitle className="text-sm sm:text-base">Top 5 Imóveis Mais Populares</CardTitle>
              <CardDescription className="text-xs">
                Imóveis com maior pontuação de engajamento
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const properties = popularData?.properties || []
                openDetailsModal(
                  'Todos os Imóveis Populares',
                  properties.map((p) => ({
                    label: `Imóvel #${p.codigo}`,
                    value: p.views,
                    subValue: p.url
                      ? `${p.favorites} favoritos`
                      : `${p.favorites} favoritos • URL não disponível`,
                    link: p.url || undefined,
                  })),
                  'Ranking completo de imóveis por engajamento',
                  [
                    'Priorize os imóveis do topo em suas campanhas',
                    'Analise imóveis com alta visualização mas baixos favoritos',
                    'Use o funil de conversão para entender o comportamento',
                  ],
                  'list'
                )
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="min-h-[250px] sm:min-h-[280px] p-3 sm:p-4">
            <PopularPropertiesChart
              data={popularData}
              isLoading={popularLoading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Properties Table with Funnel */}
      <div className="pt-6 border-t border-border/30">
        <div className="space-y-3 sm:space-y-4">
          <SectionHeader
            title="Lista Completa de Imóveis"
            description="Todos os imóveis com métricas de engajamento e leads"
          />
          <Card className="bg-card border border-border/40 shadow-sm hover:shadow-md transition-all duration-200 ease-out">
            <CardContent className="p-3 sm:p-4">
              {popularLoading ? (
                <div className="space-y-2">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : popularData?.properties && popularData.properties.length > 0 ? (
                <PopularPropertiesTable data={popularData.properties} />
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum dado disponível
                </p>
              )}
            </CardContent>
          </Card>
        </div>
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
