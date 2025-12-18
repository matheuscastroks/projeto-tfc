'use client'

import Link from 'next/link'
import { DeleteSiteButton } from './DeleteSiteButton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Button } from '@ui/button'
import { Badge } from '@ui/badge'
import { Alert, AlertDescription } from '@ui/alert'
import { EmptyState } from '@/lib/components/dashboard'
import {
  Pencil,
  Globe,
  Key,
  Plus,
  ExternalLink,
  BarChart3,
  CheckCircle2,
} from 'lucide-react'
import { Skeleton } from '@ui/skeleton'
import { useSites } from '@/lib/hooks'

export function SitesClient() {
  const { data: sites, isLoading, error } = useSites()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-4 w-[150px] mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-[100px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 sm:space-y-8 pb-6 sm:pb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Gerenciar Sites
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Configure e monitore seus sites imobiliários
          </p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Erro ao carregar sites. Verifique sua conexão e tente novamente.
          </AlertDescription>
        </Alert>
        <Button asChild>
          <Link href="/admin/sites/new">
            <Plus className="h-4 w-4 mr-2" />
            Novo Site
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-6 sm:pb-10">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
        <div className="space-y-2 sm:space-y-3">
          <Badge variant="secondary" className="px-3 py-1 text-xs sm:text-sm">
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
            Gerenciamento de Sites
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Gerenciar Sites
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
            Cadastre seus domínios e comece a rastrear visitantes para gerar
            insights poderosos sobre suas campanhas
          </p>
        </div>
        <Button asChild size="default" className="font-semibold w-full sm:w-auto">
          <Link href="/admin/sites/new">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Novo Site
          </Link>
        </Button>
      </div>

      {sites?.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="Nenhum site configurado"
          description="Comece adicionando seu primeiro site para começar a rastrear visitantes e gerar insights sobre suas campanhas imobiliárias"
          action={{
            label: 'Adicionar Primeiro Site',
            href: '/admin/sites/new',
          }}
        />
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {sites?.map((s) => (
            <Card
              key={s.id}
              className="bg-card border border-border/40 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ease-out"
            >
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
                  <div className="flex-1 space-y-3 sm:space-y-4 w-full">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-1">
                          <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold">
                            {s.name}
                          </CardTitle>
                          <Badge
                            variant={
                              s.status === 'active' ? 'default' : 'secondary'
                            }
                            className="flex items-center gap-1 text-xs sm:text-sm"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            {s.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <CardDescription className="flex flex-wrap items-center gap-2 text-xs sm:text-sm mt-2">
                          <Key className="h-3.5 w-3.5" />
                          <code className="bg-muted px-2 py-1 rounded font-mono text-xs break-all">
                            {s.siteKey}
                          </code>
                        </CardDescription>
                      </div>
                    </div>
                    {s.domains && s.domains.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground pl-0 sm:pl-[60px]">
                        <ExternalLink className="h-4 w-4" />
                        <a
                          href={`https://${s.domains.find((d) => d.isPrimary)?.host || s.domains[0]?.host}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors break-all"
                        >
                          {s.domains.find((d) => d.isPrimary)?.host ||
                            s.domains[0]?.host}
                        </a>
                        {s.domains.length > 1 && (
                          <Badge variant="outline" className="text-xs">
                            +{s.domains.length - 1} domínios
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                      aria-label="Editar site"
                      title="Editar site"
                      className="h-8 w-8 sm:h-9 sm:w-9"
                    >
                      <Link href={`/admin/sites/${s.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteSiteButton siteId={s.id} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                    <Link
                      href="/admin/install"
                      className="flex items-center justify-center gap-2"
                    >
                      <Key className="h-4 w-4" />
                      Ver Código de Instalação
                    </Link>
                  </Button>
                  <Button asChild variant="default" size="sm" className="w-full sm:w-auto">
                    <Link
                      href="/admin/insights"
                      className="flex items-center justify-center gap-2"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Ver Análises
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
