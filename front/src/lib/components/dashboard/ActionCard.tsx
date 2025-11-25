import Link from 'next/link'
import { Card } from '@ui/card'
import { ArrowRight, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActionCardProps {
  href: string
  icon: LucideIcon
  title: string
  description: string
  badge?: string
  metric?: {
    label: string
    value: string | number
  }
  className?: string
}

export function ActionCard({
  href,
  icon: Icon,
  title,
  description,
  badge,
  metric,
  className,
}: ActionCardProps) {
  return (
    <Link href={href} className="block group">
      <Card
        className={cn(
          'border-2 hover:border-primary/50 transition-all duration-200 hover:shadow-lg p-6',
          className
        )}
      >
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{title}</h3>
              {badge && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {description}
            </p>
            {metric && (
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-lg font-bold text-foreground">
                  {metric.value}
                </span>
                <span className="text-xs text-muted-foreground">
                  {metric.label}
                </span>
              </div>
            )}
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0">
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Card>
    </Link>
  )
}
