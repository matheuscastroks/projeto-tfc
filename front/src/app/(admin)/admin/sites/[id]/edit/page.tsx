'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { EditSiteForm } from './_components/EditSiteForm'
import { useSite } from '@/lib/hooks'
import { Skeleton } from '@ui/skeleton'
import { Globe, ArrowLeft } from 'lucide-react'

export default function EditSitePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [siteId, setSiteId] = React.useState<string | null>(null)

  React.useEffect(() => {
    params.then(({ id }) => setSiteId(id))
  }, [params])

  const { data: site, isLoading, error } = useSite(siteId || '')

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-5 w-96 mt-2" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !site) {
    return (
      <div className="space-y-6 sm:space-y-8 pb-6 sm:pb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Editar Site
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Site não encontrado
          </p>
        </div>
        <Card className="bg-card border border-border/40 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-sm text-destructive mb-4">
              Não foi possível carregar as informações do site.
            </div>
            <Button asChild variant="outline">
              <Link href="/admin/sites">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Sites
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-6 sm:pb-10">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Editar Site
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Atualize as configurações e informações do site
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/sites">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
      </div>

      <Card className="bg-card border border-border/40 shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl font-semibold">
            <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
            Informações do Site
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm md:text-base mt-1">
            Atualize o nome e o status do site conforme necessário
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <EditSiteForm
            site={{
              id: site.id,
              name: site.name,
              status: site.status as 'active' | 'inactive',
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
