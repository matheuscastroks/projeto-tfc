import { Card, CardContent, CardHeader, CardTitle } from '@ui/card'
import { Badge } from '@ui/badge'
import { Button } from '@ui/button'
import { LucideIcon, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InsightCardProps {
  category: string
  categoryColor?: 'primary' | 'green' | 'blue' | 'orange' | 'purple'
  title: string
  description: string
  metrics?: Array<{
    label: string
    value: string | number
  }>
  icon?: LucideIcon
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const categoryColors = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  green: 'bg-green-500/10 text-green-600 border-green-500/20',
  blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  orange: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  purple: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
}

export function InsightCard({
  category,
  categoryColor = 'primary',
  title,
  description,
  metrics,
  icon: Icon = Lightbulb,
  action,
  className,
}: InsightCardProps) {
  return (
    <Card
      className={cn(
        'border-2 hover:border-primary/50 transition-all duration-200 hover:shadow-lg',
        className
      )}
    >
      <CardHeader className="space-y-2 p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <Badge
              variant="outline"
              className={cn('font-medium text-xs', categoryColors[categoryColor])}
            >
              {category}
            </Badge>
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base sm:text-lg leading-tight">{title}</CardTitle>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-3 sm:p-4 pt-0">
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

        {metrics && metrics.length > 0 && (
          <div className="flex flex-wrap gap-3 pt-1">
            {metrics.map((metric, index) => (
              <div key={index} className="flex flex-col">
                <span className="text-xl font-bold text-foreground">
                  {metric.value}
                </span>
                <span className="text-xs text-muted-foreground">
                  {metric.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {action && (
          <Button
            onClick={action.onClick}
            variant="outline"
            size="sm"
            className="w-full font-semibold text-sm"
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
