import { Card, CardContent, CardHeader, CardTitle } from '@ui/card'
import { Skeleton } from '@ui/skeleton'
import { cn } from 'src/utils/utils'
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

interface EnhancedMetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  isLoading?: boolean
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  className?: string
}

export function EnhancedMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  isLoading,
  trend,
  trendValue,
  className,
}: EnhancedMetricCardProps) {
  const trendIcons = {
    up: ArrowUpRight,
    down: ArrowDownRight,
    neutral: Minus,
  }

  const trendColors = {
    up: 'text-green-500 bg-green-500/10',
    down: 'text-red-500 bg-red-500/10',
    neutral: 'text-muted-foreground bg-muted',
  }

  const TrendIcon = trend ? trendIcons[trend] : null

  return (
    <Card
      className={cn(
        'border-2 hover:border-primary/50 transition-all duration-200 hover:shadow-lg',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {isLoading ? (
          <div className="space-y-1.5">
            <Skeleton className="h-8 w-28" />
            {subtitle && <Skeleton className="h-3 w-full" />}
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold tracking-tight">{value}</div>
            {subtitle && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {subtitle}
              </p>
            )}
            {trend && trendValue && TrendIcon && (
              <div
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                  trendColors[trend]
                )}
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
