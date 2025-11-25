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
  useConversionSummary,
  useConversionSources,
  useLeadProfile,
} from '@/lib/hooks/useInsights'
import { Alert, AlertDescription } from '@ui/alert'
import { ConversionDistributionChart } from './_components/ConversionDistributionChart'
import { ConversionSourcesChart } from './_components/ConversionSourcesChart'
import { LeadProfileSection } from './_components/LeadProfileSection'
import {
  DetailsModal,
  type DetailsDataItem,
} from '@/lib/components/insights/DetailsModal'
import { PeriodSelector } from '@/lib/components/insights/PeriodSelector'
import { EnhancedMetricCard, SectionHeader } from '@/lib/components/dashboard'
import { Badge } from '@ui/badge'
import { TrendingUp, Target, Users, MoreHorizontal } from 'lucide-react'
import type { InsightsQuery } from '@/lib/types/insights'
import { formatDateToISO } from '@/lib/utils'

export default function ConversionAnalyticsPage() {
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

  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useConversionSummary(selectedSiteKey || '', dateQuery)
  const {
    data: sourcesData,
    isLoading: sourcesLoading,
    error: sourcesError,
  } = useConversionSources(selectedSiteKey || '', dateQuery)
  const {
    data: leadProfileData,
    isLoading: leadProfileLoading,
    error: leadProfileError,
  } = useLeadProfile(selectedSiteKey || '', dateQuery)

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
        <p className="text-muted-foreground">
          Por favor, selecione um site para visualizar as análises
        </p>
      </div>
    )
  }

  // Check for errors
  const hasError = summaryError || sourcesError || leadProfileError

  // Calculate metrics
  const conversionRate = summaryData?.conversionRate || 0
  const totalConversions = summaryData?.totalConversions || 0
  const totalSessions = summaryData?.totalSessions || 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Badge variant="secondary" className="px-3 py-1">
            <Target className="w-3.5 h-3.5 mr-1.5" />
            Análise de Conversões
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">
            Acompanhe suas conversões e leads
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
            Entenda de onde vêm seus leads, quais ações geram mais conversões e
            o perfil dos seus visitantes que se tornam clientes
          </p>
        </div>
        <PeriodSelector onPeriodChange={handlePeriodChange} />
      </div>

      {/* Error Alert */}
      {hasError && (
        <Alert variant="destructive">
          <AlertDescription>
            Erro ao carregar alguns dados. Verifique sua conexão e tente
            novamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <EnhancedMetricCard
          title="Taxa de Conversão"
          value={`${conversionRate.toFixed(2)}%`}
          subtitle={`${totalConversions} / ${totalSessions} sessões`}
          icon={TrendingUp}
          isLoading={summaryLoading}
          trend={
            conversionRate > 3
              ? 'up'
              : conversionRate < 1.5
                ? 'down'
                : 'neutral'
          }
          trendValue={
            conversionRate > 3
              ? 'Excelente'
              : conversionRate < 1.5
                ? 'Precisa melhorar'
                : 'Na média'
          }
        />
        <EnhancedMetricCard
          title="Total de Conversões"
          value={totalConversions.toLocaleString()}
          subtitle="Conversões registradas"
          icon={Target}
          isLoading={summaryLoading}
        />
        <EnhancedMetricCard
          title="Total de Sessões"
          value={totalSessions.toLocaleString()}
          subtitle="Sessões rastreadas"
          icon={Users}
          isLoading={summaryLoading}
        />
        <EnhancedMetricCard
          title="Tipos de Conversão"
          value={summaryData?.conversionsByType?.length || 0}
          subtitle="Tipos identificados"
          icon={Target}
          isLoading={summaryLoading}
        />
      </div>

      {/* Conversion Charts */}
      <div className="space-y-4">
        <SectionHeader
          title="Análise de Conversões"
          description="Entenda quais tipos de conversão e fontes de tráfego geram mais resultados"
        />
        <div className="grid gap-4 md:grid-cols-2">
          {/* Conversion Distribution */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Conversões por Tipo</CardTitle>
                <CardDescription>
                  Distribuição dos eventos de conversão
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const types = summaryData?.conversionsByType || []
                  openDetailsModal(
                    'Conversões Detalhadas por Tipo',
                    types.map((t) => ({
                      label: t.type,
                      value: t.count,
                      percentage:
                        (t.count / (summaryData?.totalConversions || 1)) * 100,
                    })),
                    'Análise completa de todos os tipos de conversão',
                    [
                      `O tipo mais comum é ${types[0]?.type || 'N/A'}`,
                      'Otimize os CTAs dos tipos com menor volume',
                      'Considere A/B tests para melhorar conversões',
                    ]
                  )
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ConversionDistributionChart
                data={summaryData}
                isLoading={summaryLoading}
              />
            </CardContent>
          </Card>

          {/* Conversion Sources */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Fontes de Conversão</CardTitle>
                <CardDescription>
                  De onde vêm as suas conversões
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const sources = sourcesData?.sources || []
                  openDetailsModal(
                    'Fontes de Conversão Detalhadas',
                    sources.map((s) => ({
                      label: s.source,
                      value: s.conversions,
                      subValue: `Percentual: ${s.percentage.toFixed(2)}%`,
                      percentage: s.percentage,
                    })),
                    'Análise completa de todas as fontes de tráfego',
                    [
                      'Invista mais nas fontes com maior taxa de conversão',
                      'Analise fontes com alto tráfego mas baixa conversão',
                      'Crie campanhas específicas para cada fonte',
                    ],
                    'list'
                  )
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ConversionSourcesChart
                data={sourcesData}
                isLoading={sourcesLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lead Profile Section */}
      <div className="space-y-6">
        <SectionHeader
          icon={Users}
          title="Perfil dos Leads"
          description="Características demográficas e comportamentais dos seus leads"
        />
        <Card className="border-2 hover:border-primary/50 transition-all duration-200">
          <CardContent>
            <LeadProfileSection
              data={leadProfileData}
              isLoading={leadProfileLoading}
            />
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
