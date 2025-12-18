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
import { AcquisitionPanel } from './_components/AcquisitionPanel'
import { LeadDNACard } from './_components/LeadDNACard'
import {
  DetailsModal,
  type DetailsDataItem,
} from '@/lib/components/insights/DetailsModal'
import { PeriodSelector } from '@/lib/components/insights/PeriodSelector'
import { EnhancedMetricCard } from '@/lib/components/dashboard'
import { Badge } from '@ui/badge'
import { TrendingUp, Target, Users } from 'lucide-react'
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
        <p className="text-sm sm:text-base text-muted-foreground px-4 text-center">
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
    <div className="space-y-6 sm:space-y-8 pb-6 sm:pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
        <div className="space-y-2 sm:space-y-3">
          <Badge variant="secondary" className="px-3 py-1 text-xs sm:text-sm">
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
            Análise de Conversões
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Acompanhe suas conversões e leads
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
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
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
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

      {/* Acquisition & Conversion Panel */}
      <div className="h-[450px]">
        <AcquisitionPanel
          summaryData={summaryData}
          sourcesData={sourcesData}
          isLoading={summaryLoading || sourcesLoading}
        />
      </div>

      {/* Lead DNA Panel */}
      <div className="min-h-[500px]">
        <LeadDNACard data={leadProfileData} isLoading={leadProfileLoading} />
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
