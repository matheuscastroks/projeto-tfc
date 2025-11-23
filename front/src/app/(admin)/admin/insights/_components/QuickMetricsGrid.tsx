import { Card, CardContent, CardHeader, CardTitle } from '@ui/card'
import { Spinner } from '@ui/spinner'
import {
  Search,
  TrendingUp,
  Building2,
  Smartphone,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  isLoading?: boolean
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  isLoading,
  trend,
  trendValue,
}: MetricCardProps) {
  const trendIcons = {
    up: ArrowUpRight,
    down: ArrowDownRight,
    neutral: Minus,
  }

  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-muted-foreground',
  }

  const TrendIcon = trend ? trendIcons[trend] : null

  return (
    <Card className="shadow-layer-5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-12">
            <Spinner className="w-4 h-4" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {trend && trendValue && TrendIcon && (
              <div
                className={`flex items-center gap-1 mt-2 text-xs ${trendColors[trend]}`}
              >
                <TrendIcon className="h-3 w-3" />
                <span>{trendValue}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total de Buscas"
        value={totalSearches?.toLocaleString() || '0'}
        subtitle="Buscas realizadas no período"
        icon={Search}
        isLoading={isLoadingSearch}
      />
      <MetricCard
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
      <MetricCard
        title="Imóvel Mais Visto"
        value={topPropertyViews?.toLocaleString() || '0'}
        subtitle="Visualizações do imóvel top"
        icon={Building2}
        isLoading={isLoadingProperty}
      />
      <MetricCard
        title="Acessos Mobile"
        value={mobilePercent ? `${mobilePercent.toFixed(1)}%` : '0%'}
        subtitle="Visitantes via dispositivos móveis"
        icon={Smartphone}
        isLoading={isLoadingDevices}
      />
    </div>
  )
}
