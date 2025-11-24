'use client'

import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Button } from '@ui/button'
import { Badge } from '@ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@ui/tooltip'
import { Skeleton } from '@ui/skeleton'
import { CopySnippetButton } from './_components/CopySnippetButton'
import { EmptyState } from '@/lib/components/dashboard'
import { useSites } from '@/lib/hooks'
import {
  Code,
  CheckCircle2,
  AlertCircle,
  Globe,
  Plus,
  Lightbulb,
  Settings,
  Timer,
  Zap,
} from 'lucide-react'

export default function InstallPage() {
  const { data: sites, isLoading, error } = useSites()
  const firstSite = sites?.[0]
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || ''
  const loaderUrl = firstSite
    ? `${base}/api/sdk/loader?site=${encodeURIComponent(firstSite.siteKey)}`
    : ''

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Código de Instalação
          </h1>
          <p className="text-muted-foreground text-lg">
            Integre o rastreamento de analytics ao seu site
          </p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar sites</AlertTitle>
          <AlertDescription>
            Não foi possível carregar suas configurações. Verifique sua conexão
            e tente novamente.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!firstSite) {
    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <Badge variant="secondary" className="px-3 py-1">
            <Code className="w-3.5 h-3.5 mr-1.5" />
            Código de Instalação
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">
            Instale o InsightHouse em 5 minutos
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
            Integre o rastreamento de analytics ao seu site e comece a coletar
            dados dos seus visitantes
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Nenhum site configurado</AlertTitle>
          <AlertDescription>
            Você precisa criar um site antes de obter o código de instalação.
          </AlertDescription>
        </Alert>

        <EmptyState
          icon={Globe}
          title="Configure seu primeiro site"
          description="Adicione seu site para receber o código de rastreamento e começar a coletar dados de analytics em tempo real"
          action={{
            label: 'Criar Primeiro Site',
            href: '/admin/sites/new',
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Badge variant="secondary" className="px-3 py-1">
          <Settings className="w-3.5 h-3.5 mr-1.5" />
          Configuração
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">
          Instale o InsightHouse em 5 minutos
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
          Cole uma linha de código no seu site e comece a coletar dados dos
          visitantes automaticamente
        </p>
      </div>

      {/* Installation snippet */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Code className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl">
                  Script de Rastreamento
                </CardTitle>
              </div>
              <CardDescription className="text-base">
                Copie e cole este código no{' '}
                <code className="bg-muted px-1.5 py-0.5 rounded font-mono">
                  {'<head>'}
                </code>{' '}
                do seu site
              </CardDescription>
            </div>
            <Badge className="font-semibold px-3 py-1">{firstSite.name}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative group">
                  <pre className="p-6 bg-muted border-2 rounded-xl text-sm overflow-auto font-mono hover:border-primary/50 transition-colors">
                    {`<script async src="${loaderUrl}"></script>`}
                  </pre>
                  <div className="absolute top-4 right-4">
                    <CopySnippetButton
                      snippet={`<script async src="${loaderUrl}"></script>`}
                    />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clique para copiar o código</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Installation instructions - Steps like landing page */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-3">Simples como deve ser</h2>
          <p className="text-muted-foreground text-lg">
            Não precisa de desenvolvedor. Não precisa de integração complexa.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Step 1 */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-200 text-center">
            <CardContent className="pt-6 space-y-4">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Cole o código</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Adicione o script no{' '}
                  <code className="bg-muted px-1.5 py-0.5 rounded font-mono">
                    {'<head>'}
                  </code>{' '}
                  do seu site. Funciona com qualquer plataforma.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-200 text-center">
            <CardContent className="pt-6 space-y-4">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Aguarde</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Os dados começam a chegar automaticamente. Nenhuma
                  configuração adicional necessária.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-200 text-center">
            <CardContent className="pt-6 space-y-4">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Analise</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Veja insights claros e tome decisões que aumentam suas vendas.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed methods */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Métodos de Instalação</CardTitle>
              <CardDescription className="text-base mt-1">
                Escolha o método que melhor se adequa ao seu site
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Method 1: Direct HTML */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
                  1
                </div>
                <h3 className="text-lg font-semibold">
                  Instalação Direta no HTML
                </h3>
              </div>
              <p className="text-muted-foreground pl-11">
                Cole o código acima dentro da tag{' '}
                <code className="bg-muted px-1.5 py-0.5 rounded font-mono">
                  {'<head>'}
                </code>{' '}
                do seu site, preferencialmente logo após a abertura da tag.
              </p>
              <pre className="ml-11 p-4 bg-muted border-2 rounded-xl text-xs overflow-auto font-mono">
                {`<!DOCTYPE html>
<html>
  <head>
    <script async src="${loaderUrl}"></script>
    <!-- Resto do seu código -->
  </head>
  <body>
    ...
  </body>
</html>`}
              </pre>
            </div>

            {/* Method 2: Google Tag Manager */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
                  2
                </div>
                <h3 className="text-lg font-semibold">
                  Via Google Tag Manager
                </h3>
              </div>
              <div className="pl-11 space-y-3">
                <p className="text-muted-foreground">
                  Se você usa GTM, siga estes passos:
                </p>
                <ol className="text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Acesse seu container no Google Tag Manager</li>
                  <li>
                    Crie uma nova tag do tipo &quot;HTML Personalizado&quot;
                  </li>
                  <li>Cole o código do script no campo HTML</li>
                  <li>Configure o acionador para &quot;All Pages&quot;</li>
                  <li>Salve e publique o container</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-2 text-center">
          <CardContent className="pt-6 space-y-3">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold">Sem impacto na performance</h3>
            <p className="text-sm text-muted-foreground">
              Script assíncrono não afeta a velocidade do seu site
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 text-center">
          <CardContent className="pt-6 space-y-3">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto">
              <Timer className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold">Dados em tempo real</h3>
            <p className="text-sm text-muted-foreground">
              Comece a ver dados nas análises em poucas horas
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 text-center">
          <CardContent className="pt-6 space-y-3">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold">Automático</h3>
            <p className="text-sm text-muted-foreground">
              Funciona automaticamente em todas as páginas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <Button asChild variant="outline" size="lg">
          <Link href="/admin/sites">
            <Globe className="h-4 w-4 mr-2" />
            Gerenciar Sites
          </Link>
        </Button>
        <Button asChild size="lg">
          <Link href="/admin/insights">
            Ver Análises
            <CheckCircle2 className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
