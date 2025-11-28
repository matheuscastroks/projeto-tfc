'use client'

import { useState } from 'react'
import { useSiteContext } from '@/lib/providers/SiteProvider'
import { useGlobalFunnel } from '@/lib/hooks/useInsights'
import { FunnelSection } from '../_components/FunnelSection'
import { PeriodSelector } from '@/lib/components/insights/PeriodSelector'
import { Badge } from '@ui/badge'
import { Target, AlertCircle } from 'lucide-react'
import type { InsightsQuery } from '@/lib/types/insights'
import { formatDateToISO } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@ui/alert'

export default function FunnelAnalyticsPage() {
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

  const { data: funnelData, isLoading: funnelLoading } = useGlobalFunnel(
    selectedSiteKey || '',
    dateQuery
  )

  if (!selectedSiteKey) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">
          Por favor, selecione um site para visualizar as análises
        </p>
      </div>
    )
  }

  // Insights automáticos baseados nos dados
  const getInsights = () => {
    if (!funnelData) return []
    const insights = []
    const { dropoffRates } = funnelData

    if (dropoffRates.searchToClick > 80) {
      insights.push({
        title: 'Gargalo em Resultados',
        description:
          'Muitas buscas mas poucos cliques. Verifique a qualidade das fotos principais e preços na listagem.',
        severity: 'high',
      })
    }

    if (dropoffRates.clickToView > 60) {
      insights.push({
        title: 'Perda de Interesse',
        description:
          'Usuários clicam mas não visualizam o imóvel completo. O tempo de carregamento pode estar alto.',
        severity: 'medium',
      })
    }

    if (dropoffRates.viewToFavorite > 90) {
      insights.push({
        title: 'Baixo Engajamento',
        description:
          'Poucos usuários favoritam imóveis. Considere melhorar as descrições e fotos internas.',
        severity: 'medium',
      })
    }

    if (dropoffRates.favoriteToLead > 95) {
      insights.push({
        title: 'Dificuldade na Conversão',
        description:
          'Usuários favoritam mas não entram em contato. O preço pode estar desalinhado ou o botão de contato pouco visível.',
        severity: 'high',
      })
    }

    return insights
  }

  const insights = getInsights()

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Badge variant="secondary" className="px-3 py-1">
            <Target className="w-3.5 h-3.5 mr-1.5" />
            Funil de Conversão
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">
            Jornada do Cliente
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
            Visualize onde você está perdendo oportunidades, desde a busca até o
            contato final.
          </p>
        </div>
        <PeriodSelector onPeriodChange={handlePeriodChange} />
      </div>

      {/* Insights Automáticos */}
      {insights.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {insights.map((insight, index) => (
            <Alert
              key={index}
              variant={insight.severity === 'high' ? 'destructive' : 'default'}
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{insight.title}</AlertTitle>
              <AlertDescription>{insight.description}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Funnel Chart */}
      <FunnelSection data={funnelData} isLoading={funnelLoading} />
    </div>
  )
}
