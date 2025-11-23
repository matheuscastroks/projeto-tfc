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
import { Eye, Heart, TrendingUp, ArrowLeft, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
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
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/admin/insights">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Visão Geral
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Análise de Imóveis
          </h1>
          <p className="text-muted-foreground text-lg">
            Descubra quais imóveis geram mais engajamento e oportunidades
          </p>
        </div>
        <PeriodSelector onPeriodChange={handlePeriodChange} />
      </div>

      {/* Metrics and Chart Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Left Column: Metrics Cards */}
        <div className="space-y-4 col-span-1">
          <Card className="shadow-layer-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Visualizações
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {engagementLoading ? (
                <div className="flex items-center justify-center h-20">
                  <Spinner className="h-6 w-6" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {totalViews.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Visualizações realizadas
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-layer-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Favoritos
              </CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {engagementLoading ? (
                <div className="flex items-center justify-center h-20">
                  <Spinner className="h-6 w-6" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {totalFavorites.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Favoritos salvos
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-layer-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Favoritos
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {engagementLoading ? (
                <div className="flex items-center justify-center h-20">
                  <Spinner className="h-6 w-6" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{favoriteRate}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Favoritos por visualização
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Top Properties Chart */}
        <Card className="shadow-inner-5 col-span-2">
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
      <Card className="shadow-inner-5">
        <CardHeader>
          <CardTitle>Lista Completa de Imóveis</CardTitle>
          <CardDescription>
            Lista completa de imóveis com métricas de engajamento e leads
          </CardDescription>
        </CardHeader>
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
