'use client'

import Link from 'next/link'
import Image from 'next/image'
import heroIllustration from '@/assets/illustrations/homepage/heroImage.svg'
import mapLocation from '@/assets/illustrations/homepage/maps.svg'
import preferences from '@/assets/illustrations/homepage/preferences.svg'
import powerOfPurchase from '@/assets/illustrations/homepage/powerOfPurchase.svg'
import conversionTracking from '@/assets/illustrations/homepage/conversionTracking.svg'
import dashboardRealTime from '@/assets/illustrations/homepage/dashboardRealTime.svg'
import userJourney from '@/assets/illustrations/homepage/userJourney.svg'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Button } from '@ui/button'
import {
  BarChart3,
  MapPin,
  Building2,
  Target,
  DollarSign,
  TrendingUp,
  Users,
  Zap,
  Shield,
  ArrowRight,
  Activity,
  Check,
  Quote,
  Github,
  Twitter,
  Mail,
  ExternalLink,
} from 'lucide-react'
import { ThemeToggle } from '@/lib/components/ThemeToggle'
import { useEffect, useState } from 'react'

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M+'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K+'
  }
  return num.toString()
}

export default function HomePage() {
  const [eventsCount, setEventsCount] = useState<number | null>(null)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
        if (!baseUrl) return
        const res = await fetch(`${baseUrl}/api/events/stats`)
        if (!res.ok) return
        const data = await res.json()
        setEventsCount(data.totalEvents || 0)
      } catch {
        // Silently fail
      }
    }
    fetchEvents()
  }, [])

  const displayCount = eventsCount !== null ? formatNumber(eventsCount) : '---'

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link
              href="/"
              className="text-lg sm:text-xl font-semibold tracking-tight hover:text-primary transition-colors"
            >
              InsightHouse
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeToggle />
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex hover:scale-105 transition-transform text-xs sm:text-sm"
              >
                <Link href="/login">Entrar</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="rounded-full px-3 sm:px-6 text-xs sm:text-sm hover:scale-105 transition-transform"
              >
                <Link href="/login">Começar</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Redesigned like portfolio */}
      <section className="min-h-screen flex items-center pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left space-y-4 sm:space-y-5 lg:space-y-6 flex flex-col justify-center order-2 lg:order-1">
              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  InsightHouse
                </h1>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground">
                  Analytics para imobiliárias
                </p>
              </div>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Focado em transformar dados imobiliários em insights
                estratégicos. Pare de adivinhar o que seus clientes estão
                procurando e descubra exatamente quais cidades, tipos de imóveis
                e faixas de preço geram mais interesse no seu site.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                <Button
                  asChild
                  variant="primary-rounded"
                  size="lg-rounded"
                  className="hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto"
                >
                  <Link href="/login">
                    Começar Trial Grátis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline-primary"
                  size="lg-rounded"
                  className="hover:scale-105 w-full sm:w-auto"
                >
                  <Link href="#features">Ver Demo</Link>
                </Button>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-muted-foreground pt-2">
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                  <span>14 dias grátis</span>
                </span>
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                  <span>Sem cartão de crédito</span>
                </span>
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                  <span>5 min para instalar</span>
                </span>
              </div>
            </div>
            <div className="relative flex items-center justify-center min-h-[150px] sm:min-h-[200px] md:min-h-[300px] lg:min-h-[400px] h-full order-1 lg:order-2">
              <div className="w-full h-full relative flex items-center justify-center">
                <Image
                  src={heroIllustration}
                  alt="Analytics Dashboard"
                  fill
                  className="object-contain dark:invert"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              O que dizem sobre nós
            </h2>
            <p className="text-muted-foreground text-lg">
              Feedback real de profissionais imobiliários usando o InsightHouse
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card border-0 shadow-sm hover:shadow-lg transition-all duration-300 p-6 hover:scale-105 group">
              <CardHeader className="pb-4 p-0">
                <Quote className="h-6 w-6 text-muted-foreground/50 mb-4 group-hover:text-primary transition-colors" />
                <CardDescription className="text-foreground leading-relaxed">
                  &ldquo;Descobrimos que 70% dos nossos leads estavam
                  pesquisando imóveis em uma cidade específica. Ajustamos nosso
                  estoque e as vendas aumentaram 40%.&rdquo;
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 p-0">
                <div className="flex items-center gap-3 mt-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-sm font-medium text-primary">CE</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Carlos Eduardo</p>
                    <p className="text-xs text-muted-foreground">
                      Diretor Comercial, SP Imóveis
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-0 shadow-sm hover:shadow-lg transition-all duration-300 p-6 hover:scale-105 group">
              <CardHeader className="pb-4 p-0">
                <Quote className="h-6 w-6 text-muted-foreground/50 mb-4 group-hover:text-primary transition-colors" />
                <CardDescription className="text-foreground leading-relaxed">
                  &ldquo;Costumávamos gastar muito com anúncios sem saber o que
                  funcionava. Agora sabemos exatamente onde investir. ROI
                  aumentou 3x.&rdquo;
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 p-0">
                <div className="flex items-center gap-3 mt-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-sm font-medium text-primary">MS</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Mariana Santos</p>
                    <p className="text-xs text-muted-foreground">
                      CEO, Habitat Real Estate
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-0 shadow-sm hover:shadow-lg transition-all duration-300 p-6 hover:scale-105 group">
              <CardHeader className="pb-4 p-0">
                <Quote className="h-6 w-6 text-muted-foreground/50 mb-4 group-hover:text-primary transition-colors" />
                <CardDescription className="text-foreground leading-relaxed">
                  &ldquo;Implementado em 10 minutos. No mesmo dia identificamos
                  padrões que mudaram toda nossa estratégia de vendas.&rdquo;
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 p-0">
                <div className="flex items-center gap-3 mt-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-sm font-medium text-primary">RA</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Roberto Almeida</p>
                    <p className="text-xs text-muted-foreground">
                      Corretor Independente, Rio de Janeiro
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      */}

      {/* Everything you need to sell more */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Tudo que você precisa para vender mais
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
              Dados organizados e prontos para ação
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <Card className="bg-card border-0 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden hover:scale-105">
              <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-t-lg relative overflow-hidden group-hover:scale-105 transition-transform flex items-center justify-center">
                <Image
                  src={mapLocation}
                  alt="Análise geográfica"
                  fill
                  className="object-contain p-3 sm:p-4 dark:invert"
                />
              </div>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">
                  Análise geográfica
                </CardTitle>
                <CardDescription className="text-sm">
                  Veja exatamente quais cidades e bairros seus visitantes mais
                  buscam. Ajuste seu estoque baseado em demanda real.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-0 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden hover:scale-105">
              <div className="aspect-video bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-t-lg relative overflow-hidden group-hover:scale-105 transition-transform flex items-center justify-center">
                <Image
                  src={preferences}
                  alt="Preferências de imóveis"
                  fill
                  className="object-contain p-4 dark:invert"
                />
              </div>
              <CardHeader>
                <CardTitle>Preferências de imóveis</CardTitle>
                <CardDescription>
                  Apartamento, casa, comercial? Quantos quartos? Descubra o
                  perfil exato do que seus clientes procuram.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-0 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden hover:scale-105">
              <div className="aspect-video bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-t-lg relative overflow-hidden group-hover:scale-105 transition-transform flex items-center justify-center">
                <Image
                  src={powerOfPurchase || ''}
                  alt="Poder de compra"
                  fill
                  className="object-contain p-4 dark:invert"
                />
              </div>
              <CardHeader>
                <CardTitle>Poder de compra</CardTitle>
                <CardDescription>
                  Identifique as faixas de preço mais procuradas. Personalize
                  sua oferta para o público certo.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-0 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden hover:scale-105">
              <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-t-lg relative overflow-hidden group-hover:scale-105 transition-transform flex items-center justify-center">
                <Image
                  src={userJourney || ''}
                  alt="Jornada do cliente"
                  fill
                  className="object-contain p-4 dark:invert"
                />
              </div>
              <CardHeader>
                <CardTitle>Jornada do cliente</CardTitle>
                <CardDescription>
                  Acompanhe cada passo: da primeira visita até o contato. Saiba
                  onde estão os gargalos.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-0 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden hover:scale-105">
              <div className="aspect-video bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-t-lg relative overflow-hidden group-hover:scale-105 transition-transform flex items-center justify-center">
                <Image
                  src={conversionTracking || ''}
                  alt="Conversões rastreadas"
                  fill
                  className="object-contain p-4 dark:invert"
                />
              </div>
              <CardHeader>
                <CardTitle>Conversões rastreadas</CardTitle>
                <CardDescription>
                  Formulários, WhatsApp, telefone. Saiba exatamente quantos
                  leads você está gerando.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-0 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden hover:scale-105">
              <div className="aspect-video bg-gradient-to-br from-teal-500/20 to-green-500/20 rounded-t-lg relative overflow-hidden group-hover:scale-105 transition-transform flex items-center justify-center">
                <Image
                  src={dashboardRealTime}
                  alt="Dashboard em tempo real"
                  fill
                  className="object-contain p-4 dark:invert"
                />
              </div>
              <CardHeader>
                <CardTitle>Dashboard em tempo real</CardTitle>
                <CardDescription>
                  Todas as métricas que importam em um só lugar. Sem
                  complicação, sem relatórios confusos.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works - Redesigned */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simples como deve ser
            </h2>
            <p className="text-muted-foreground text-lg">
              Sem necessidade de desenvolvedor. Sem integrações complexas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center space-y-4 group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center mx-auto text-xl font-bold group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-xl">
                1
              </div>
              <h3 className="text-xl font-semibold">Adicione o Código</h3>
              <p className="text-muted-foreground">
                Adicione uma linha no seu site. Funciona com qualquer
                plataforma.
              </p>
            </div>

            <div className="text-center space-y-4 group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center mx-auto text-xl font-bold group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-xl">
                2
              </div>
              <h3 className="text-xl font-semibold">Aguarde</h3>
              <p className="text-muted-foreground">
                Os dados começam a fluir automaticamente. Sem configurações
                adicionais.
              </p>
            </div>

            <div className="text-center space-y-4 group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center mx-auto text-xl font-bold group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-xl">
                3
              </div>
              <h3 className="text-xl font-semibold">Tome Melhores Decisões</h3>
              <p className="text-muted-foreground">
                Veja insights claros e tome decisões que impulsionam suas
                vendas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact - Redesigned like portfolio */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Vamos Construir Algo Incrível
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8">
            Pronto para parar de adivinhar e começar a saber exatamente o que
            seus clientes querem?
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8">
            <Button
              asChild
              variant="primary-rounded"
              size="lg-rounded"
              className="hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              <Link href="/login">
                Começar Trial Grátis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline-primary"
              size="lg-rounded"
              className="hover:scale-105 w-full sm:w-auto"
            >
              <Link href="mailto:contact@insighthouse.com">
                <Mail className="mr-2 h-4 w-4" />
                Fale Conosco
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 sm:gap-2">
              <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
              <span>14 dias grátis</span>
            </span>
            <span className="flex items-center gap-1.5 sm:gap-2">
              <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
              <span>Sem cartão de crédito</span>
            </span>
            <span className="flex items-center gap-1.5 sm:gap-2">
              <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
              <span>Cancele a qualquer momento</span>
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="space-y-3 sm:space-y-4 col-span-2 sm:col-span-1">
              <h3 className="font-semibold text-base sm:text-lg">
                InsightHouse
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Analytics for Real Estate. Stop guessing, start knowing.
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-medium text-sm sm:text-base">Product</h4>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <Link
                  href="#features"
                  className="block hover:text-foreground transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="/login"
                  className="block hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/login"
                  className="block hover:text-foreground transition-colors"
                >
                  Pricing
                </Link>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-medium text-sm sm:text-base">Company</h4>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <Link
                  href="/login"
                  className="block hover:text-foreground transition-colors"
                >
                  About
                </Link>
                <Link
                  href="/login"
                  className="block hover:text-foreground transition-colors"
                >
                  Blog
                </Link>
                <Link
                  href="/login"
                  className="block hover:text-foreground transition-colors"
                >
                  Careers
                </Link>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-medium text-sm sm:text-base">Support</h4>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <Link
                  href="/login"
                  className="block hover:text-foreground transition-colors"
                >
                  Help Center
                </Link>
                <Link
                  href="/login"
                  className="block hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
                <Link
                  href="/login"
                  className="block hover:text-foreground transition-colors"
                >
                  Status
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 pt-6 sm:pt-8 border-t">
            <span className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              © 2025 InsightHouse. All rights reserved.
            </span>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm"
              >
                <Link href="/login">Sign In</Link>
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="h-8 w-8 sm:h-9 sm:w-9"
                >
                  <Link href="https://github.com" target="_blank">
                    <Github className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="h-8 w-8 sm:h-9 sm:w-9"
                >
                  <Link href="https://twitter.com" target="_blank">
                    <Twitter className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
