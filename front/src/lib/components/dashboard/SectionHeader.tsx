import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function SectionHeader({
  icon: Icon,
  title,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-2 sm:gap-3', className)}>
      <div className="space-y-0.5 sm:space-y-1">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            </div>
          )}
          <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight">
            {title}
          </h2>
        </div>
        {description && (
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
