'use client'

import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card'
import { Spinner } from '@ui/spinner'

interface ChartCardProps {
  title: string
  description?: string
  children: ReactNode
  isLoading?: boolean
  action?: ReactNode
  className?: string
}

export function ChartCard({
  title,
  description,
  children,
  isLoading = false,
  action,
  className = '',
}: ChartCardProps) {
  return (
    <Card
      className={`bg-card border border-border/40 shadow-sm hover:shadow-lg transition-all duration-200 ease-out ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <CardDescription className="text-xs">{description}</CardDescription>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-6 w-6" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
