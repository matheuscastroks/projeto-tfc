'use client'

import { useState } from 'react'
import { useSites } from '@/lib/hooks'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/select'
import { Skeleton } from '@ui/skeleton'

interface SiteSelectorProps {
  value?: string
  onValueChange?: (siteKey: string) => void
  placeholder?: string
  className?: string
}

export function SiteSelector({
  value,
  onValueChange,
  placeholder = 'Selecione um site',
  className,
}: SiteSelectorProps) {
  const { data: sites, isLoading, error } = useSites()

  if (isLoading) {
    return <Skeleton className={`h-10 w-full ${className}`} />
  }

  if (error) {
    return (
      <div
        className={`h-10 w-full flex items-center justify-center text-sm text-muted-foreground ${className}`}
      >
        Erro ao carregar sites
      </div>
    )
  }

  if (!sites || sites.length === 0) {
    return (
      <div
        className={`h-10 w-full flex items-center justify-center text-sm text-muted-foreground ${className}`}
      >
        Nenhum site encontrado
      </div>
    )
  }

  const getSiteDisplayDomain = (site: (typeof sites)[0]): string => {
    const primaryDomain = site.domains?.find((d) => d.isPrimary)
    if (primaryDomain) {
      return primaryDomain.host
    }
    if (site.domains && site.domains.length > 0) {
      return site.domains[0].host
    }
    return site.name
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {sites.map((site) => (
          <SelectItem key={site.id} value={site.siteKey}>
            {getSiteDisplayDomain(site)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
