import { Card, CardContent, CardHeader, CardTitle } from '@ui/card'
import { Skeleton } from '@ui/skeleton'
import { cn } from '@/lib/utils'
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
        'bg-card border border-border/40 shadow-sm hover:shadow-md transition-all duration-200',
        className
      )}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-xs font-medium text-muted-foreground truncate">
                {title}
              </CardTitle>
            </div>
            {isLoading ? (
              <div className="space-y-1.5">
                <Skeleton className="h-6 w-24" />
                {subtitle && <Skeleton className="h-3 w-full" />}
              </div>
            ) : (
              <>
                <div className="text-lg sm:text-xl font-bold tracking-tight mb-1">
                  {value}
                </div>
                {subtitle && (
                  <p className="text-xs text-muted-foreground leading-tight mb-1.5">
                    {subtitle}
                  </p>
                )}
                {trend && trendValue && TrendIcon && (
                  <div
                    className={cn(
                      'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium',
                      trendColors[trend]
                    )}
                  >
                    <TrendIcon className="h-3 w-3" />
                    <span>{trendValue}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
