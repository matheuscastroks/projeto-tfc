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
import { formatDateToISO } from 'src/utils/utils'

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
        <p className="text-muted-foreground">
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Badge variant="secondary" className="px-3 py-1">
            <Building2 className="w-3.5 h-3.5 mr-1.5" />
            Análise de Imóveis
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">
            Descubra seus imóveis mais populares
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
            Identifique quais imóveis geram mais interesse, visualizações e
            favoritos para priorizar suas estratégias de venda
          </p>
        </div>
        <PeriodSelector onPeriodChange={handlePeriodChange} />
      </div>

      {/* Metrics and Chart Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Left Column: Metrics Cards */}
        <div className="space-y-4 col-span-1">
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

        {/* Right Column: Top Properties Chart */}
        <Card className="border-2 hover:border-primary/50 transition-all duration-200 col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top 5 Imóveis Mais Populares</CardTitle>
              <CardDescription>
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
                      ? `${p.favorites} favoritos • Score: ${p.engagementScore.toFixed(1)}`
                      : `${p.favorites} favoritos • Score: ${p.engagementScore.toFixed(1)} • URL não disponível`,
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
          <CardContent>
            <PopularPropertiesChart
              data={popularData}
              isLoading={popularLoading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Properties Table with Funnel */}
      <div className="space-y-4">
        <SectionHeader
          title="Lista Completa de Imóveis"
          description="Todos os imóveis com métricas de engajamento e leads"
        />
        <Card className="border-2 hover:border-primary/50 transition-all duration-200">
          <CardContent>
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
