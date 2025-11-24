import { LucideIcon } from 'lucide-react'
import { Button } from '@ui/button'
import { cn } from 'src/utils/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-6',
        className
      )}
    >
      <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md leading-relaxed mb-6">
        {description}
      </p>
      {action && (
        <Button
          onClick={action.onClick}
          asChild={!!action.href}
          size="lg"
          className="font-semibold"
        >
          {action.href ? (
            <a href={action.href}>{action.label}</a>
          ) : (
            <span>{action.label}</span>
          )}
        </Button>
      )}
    </div>
  )
}
