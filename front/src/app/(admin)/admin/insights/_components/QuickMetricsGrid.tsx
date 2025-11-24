import { EnhancedMetricCard } from '@/lib/components/dashboard'
import { Search, TrendingUp, Building2, Smartphone } from 'lucide-react'

interface QuickMetricsGridProps {
  totalSearches?: number
  conversionRate?: number
  topPropertyViews?: number
  mobilePercent?: number
  isLoadingSearch?: boolean
  isLoadingConversion?: boolean
  isLoadingProperty?: boolean
  isLoadingDevices?: boolean
}

export function QuickMetricsGrid({
  totalSearches,
  conversionRate,
  topPropertyViews,
  mobilePercent,
  isLoadingSearch,
  isLoadingConversion,
  isLoadingProperty,
  isLoadingDevices,
}: QuickMetricsGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <EnhancedMetricCard
        title="Total de Buscas"
        value={totalSearches?.toLocaleString() || '0'}
        subtitle="Buscas realizadas no período"
        icon={Search}
        isLoading={isLoadingSearch}
      />
      <EnhancedMetricCard
        title="Taxa de Conversão"
        value={conversionRate ? `${conversionRate.toFixed(2)}%` : '0%'}
        subtitle="Visitantes que se tornaram leads"
        icon={TrendingUp}
        isLoading={isLoadingConversion}
        trend={
          conversionRate && conversionRate > 2
            ? 'up'
            : conversionRate && conversionRate < 1
              ? 'down'
              : 'neutral'
        }
        trendValue={
          conversionRate && conversionRate > 2
            ? 'Acima da média'
            : conversionRate && conversionRate < 1
              ? 'Abaixo da média'
              : 'Na média'
        }
      />
      <EnhancedMetricCard
        title="Imóvel Mais Visto"
        value={topPropertyViews?.toLocaleString() || '0'}
        subtitle="Visualizações do imóvel top"
        icon={Building2}
        isLoading={isLoadingProperty}
      />
      <EnhancedMetricCard
        title="Acessos Mobile"
        value={mobilePercent ? `${mobilePercent.toFixed(1)}%` : '0%'}
        subtitle="Visitantes via dispositivos móveis"
        icon={Smartphone}
        isLoading={isLoadingDevices}
      />
    </div>
  )
}
