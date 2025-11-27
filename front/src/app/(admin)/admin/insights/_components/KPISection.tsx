import { EnhancedMetricCard } from '@/lib/components/dashboard'
import { Users, MousePointerClick, TrendingUp, Building2, Heart } from 'lucide-react'
import { GlobalKPIsResponse } from '@/lib/types/insights'

interface KPISectionProps {
  data?: GlobalKPIsResponse
  isLoading: boolean
}

export function KPISection({ data, isLoading }: KPISectionProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
      <EnhancedMetricCard
        title="Visitantes Únicos"
        value={data?.uniqueVisitors?.toLocaleString() || '0'}
        subtitle="Usuários únicos no período"
        icon={Users}
        isLoading={isLoading}
      />
      <EnhancedMetricCard
        title="Leads Gerados"
        value={data?.leadsGenerated?.toLocaleString() || '0'}
        subtitle="Total de conversões (WhatsApp + Form)"
        icon={MousePointerClick}
        isLoading={isLoading}
      />
      <EnhancedMetricCard
        title="Taxa de Conversão"
        value={data?.conversionRate ? `${data.conversionRate.toFixed(2)}%` : '0%'}
        subtitle="Visitantes que viraram leads"
        icon={TrendingUp}
        isLoading={isLoading}
        trend={data?.conversionRate && data.conversionRate > 1.5 ? 'up' : 'neutral'}
      />
      <EnhancedMetricCard
        title="Média de Visualizações"
        value={data?.avgPropertiesViewed?.toFixed(1) || '0'}
        subtitle="Imóveis vistos por sessão"
        icon={Building2}
        isLoading={isLoading}
      />
      <EnhancedMetricCard
        title="Favoritos"
        value={data?.totalFavorites?.toLocaleString() || '0'}
        subtitle="Total de imóveis favoritados"
        icon={Heart}
        isLoading={isLoading}
      />
    </div>
  )
}
