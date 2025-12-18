'use client'

import { useState } from 'react'
import { useSiteContext } from '@/lib/providers/SiteProvider'
import { useJourneyStats } from '@/lib/hooks/useInsights'
import { PeriodSelector } from '@/lib/components/insights/PeriodSelector'
import { Badge } from '@ui/badge'
import { Globe, Clock, Layers, Users } from 'lucide-react'
import type { InsightsQuery } from '@/lib/types/insights'
import { formatDateToISO } from '@/lib/utils'
import { EnhancedMetricCard } from '@/lib/components/dashboard'

export default function JourneyAnalyticsPage() {
  const { selectedSiteKey } = useSiteContext()
  const [dateQuery, setDateQuery] = useState<InsightsQuery>(() => {
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

  const { data: journeyData, isLoading: journeyLoading } = useJourneyStats(
    selectedSiteKey || '',
    dateQuery
  )

  if (!selectedSiteKey) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-sm sm:text-base text-muted-foreground px-4 text-center">
          Por favor, selecione um site para visualizar as análises
        </p>
      </div>
    )
  }

  // Format time on site
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}m ${secs}s`
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <Badge variant="secondary" className="px-2.5 py-0.5 text-xs">
            <Globe className="w-3 h-3 mr-1.5" />
            Jornada do Usuário
          </Badge>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            Comportamento e Navegação
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Entenda como os visitantes navegam pelo seu site e quanto tempo
            passam explorando imóveis.
          </p>
        </div>
        <PeriodSelector onPeriodChange={handlePeriodChange} />
      </div>

      {/* Detailed Metrics */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <EnhancedMetricCard
          title="Tempo Médio no Site"
          value={journeyData ? formatTime(journeyData.avgTimeOnSite) : '0m 0s'}
          subtitle="Duração média da sessão"
          icon={Clock}
          isLoading={journeyLoading}
          trend={
            journeyData && journeyData.avgTimeOnSite > 180
              ? 'up'
              : journeyData && journeyData.avgTimeOnSite < 60
                ? 'down'
                : 'neutral'
          }
          trendValue={
            journeyData && journeyData.avgTimeOnSite > 180
              ? 'Excelente engajamento'
              : journeyData && journeyData.avgTimeOnSite < 60
                ? 'Baixo engajamento'
                : 'Engajamento médio'
          }
        />
        <EnhancedMetricCard
          title="Profundidade Média"
          value={journeyData?.avgPageDepth.toFixed(1) || '0'}
          subtitle="Páginas visitadas por sessão"
          icon={Layers}
          isLoading={journeyLoading}
          trend={
            journeyData && journeyData.avgPageDepth > 3
              ? 'up'
              : journeyData && journeyData.avgPageDepth < 1.5
                ? 'down'
                : 'neutral'
          }
        />
        <EnhancedMetricCard
          title="Visitantes Recorrentes"
          value={
            journeyData
              ? `${journeyData.recurrentVisitorsPercentage.toFixed(1)}%`
              : '0%'
          }
          subtitle="Usuários que retornaram"
          icon={Users}
          isLoading={journeyLoading}
          trend={
            journeyData && journeyData.recurrentVisitorsPercentage > 30
              ? 'up'
              : journeyData && journeyData.recurrentVisitorsPercentage < 10
                ? 'down'
                : 'neutral'
          }
          trendValue={
            journeyData && journeyData.recurrentVisitorsPercentage > 30
              ? 'Alta retenção'
              : journeyData && journeyData.recurrentVisitorsPercentage < 10
                ? 'Baixa retenção'
                : 'Retenção média'
          }
        />
      </div>
    </div>
  )
}
