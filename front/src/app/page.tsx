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

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

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

  const featureCards = [
    {
      id: 1,
      title: 'Análise geográfica',
      description:
        'Veja exatamente quais cidades e bairros seus visitantes mais buscam. Ajuste seu estoque baseado em demanda real.',
      image: mapLocation,
      alt: 'Análise geográfica',
    },
    {
      id: 2,
      title: 'Preferências de imóveis',
      description:
        'Apartamento, casa, comercial? Quantos quartos? Descubra o perfil exato do que seus clientes procuram.',
      image: preferences,
      alt: 'Preferências de imóveis',
    },
    {
      id: 3,
      title: 'Poder de compra',
      description:
        'Identifique as faixas de preço mais procuradas. Personalize sua oferta para o público certo.',
      image: powerOfPurchase,
      alt: 'Poder de compra',
    },
    {
      id: 4,
      title: 'Jornada do cliente',
      description:
        'Acompanhe cada passo: da primeira visita até o contato. Saiba onde estão os gargalos.',
      image: userJourney,
      alt: 'Jornada do cliente',
    },
    {
      id: 5,
      title: 'Conversões rastreadas',
      description:
        'Formulários, WhatsApp, telefone. Saiba exatamente quantos leads você está gerando.',
      image: conversionTracking,
      alt: 'Conversões rastreadas',
    },
    {
      id: 6,
      title: 'Dashboard em tempo real',
      description:
        'Todas as métricas que importam em um só lugar. Sem complicação, sem relatórios confusos.',
      image: dashboardRealTime,
      alt: 'Dashboard em tempo real',
    },
  ]

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-background text-foreground">
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
      <section className="h-screen snap-start snap-always flex items-center pt-16 sm:pt-20 pb-8 sm:pb-12 px-4 sm:px-6 bg-gradient-to-br from-background via-secondary/30 to-card/40 dark:from-background dark:via-secondary/20 dark:to-card/30">
        <div className="max-w-6xl mx-auto w-full h-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center w-full">
            <div className="text-center lg:text-left space-y-3 sm:space-y-4 lg:space-y-5 flex flex-col justify-center order-2 lg:order-1">
              <div className="space-y-1.5 sm:space-y-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  InsightHouse
                </h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground">
                  Analytics para imobiliárias
                </p>
              </div>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Focado em transformar dados imobiliários em insights
                estratégicos. Pare de adivinhar o que seus clientes estão
                procurando e descubra exatamente quais cidades, tipos de imóveis
                e faixas de preço geram mais interesse no seu site.
              </p>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center lg:justify-start pt-1">
                <Button
                  asChild
                  variant="primary-rounded"
                  size="lg-rounded"
                  className="hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto text-xs sm:text-sm"
                >
                  <Link href="/login">
                    Começar Trial Grátis
                    <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline-primary"
                  size="lg-rounded"
                  className="hover:scale-105 w-full sm:w-auto text-xs sm:text-sm"
                >
                  <Link href="#features">Ver Demo</Link>
                </Button>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3 md:gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1 sm:gap-1.5">
                  <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                  <span>14 dias grátis</span>
                </span>
                <span className="flex items-center gap-1 sm:gap-1.5">
                  <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                  <span>Sem cartão de crédito</span>
                </span>
                <span className="flex items-center gap-1 sm:gap-1.5">
                  <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                  <span>5 min para instalar</span>
                </span>
              </div>
            </div>
            <div className="relative flex items-center justify-center h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] order-1 lg:order-2">
              <div className="w-full h-full relative flex items-center justify-center">
                <Image
                  src={heroIllustration}
                  alt="Analytics Dashboard"
                  fill
                  className="object-cover dark:invert"
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
      <section
        id="features"
        className="h-screen snap-start snap-always flex items-center px-4 sm:px-6 bg-gradient-to-br from-secondary via-card/80 to-accent/60 dark:from-secondary dark:via-card/95 dark:to-secondary/90"
      >
        <div className="max-w-6xl mx-auto w-full h-full flex flex-col justify-center">
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">
              Tudo que você precisa para vender mais
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              Dados organizados e prontos para ação
            </p>
          </div>

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={12}
            slidesPerView={1}
            navigation={false}
            pagination={{ clickable: true }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={true}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 16,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
            }}
            className="w-full !pb-10"
          >
            {featureCards.map((card) => (
              <SwiperSlide key={card.id}>
                <Card className="bg-card border-0 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden h-full flex flex-col">
                  <div className="h-40 bg-muted/30 dark:bg-muted/20 rounded-t-lg relative overflow-hidden">
                    <Image
                      src={card.image}
                      alt={card.alt}
                      fill
                      className="object-contain object-top dark:invert"
                    />
                  </div>
                  <CardHeader className="p-4 sm:p-6 h-auto flex flex-col justify-center">
                    <CardTitle className="text-base sm:text-lg md:text-xl font-semibold">
                      {card.title}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm md:text-base leading-relaxed">
                      {card.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* How It Works - Redesigned */}
      <section className="h-screen snap-start snap-always flex items-center px-4 sm:px-6 bg-gradient-to-br from-accent/40 via-secondary/50 to-card/70 dark:from-accent/20 dark:via-secondary/30 dark:to-card/50">
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">
              Simples como deve ser
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              Sem necessidade de desenvolvedor. Sem integrações complexas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            <div className="text-center space-y-2 sm:space-y-3 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center mx-auto text-base sm:text-lg md:text-xl font-bold group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-xl">
                1
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold">
                Adicione o Código
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                Adicione uma linha no seu site. Funciona com qualquer
                plataforma.
              </p>
            </div>

            <div className="text-center space-y-2 sm:space-y-3 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center mx-auto text-base sm:text-lg md:text-xl font-bold group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-xl">
                2
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold">
                Aguarde
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                Os dados começam a fluir automaticamente. Sem configurações
                adicionais.
              </p>
            </div>

            <div className="text-center space-y-2 sm:space-y-3 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center mx-auto text-base sm:text-lg md:text-xl font-bold group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-xl">
                3
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold">
                Tome Melhores Decisões
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                Veja insights claros e tome decisões que impulsionam suas
                vendas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact - Redesigned like portfolio */}
      <section className="h-screen snap-start snap-always flex items-center px-4 sm:px-6 bg-gradient-to-br from-card/60 via-accent/50 to-secondary/80 dark:from-card/40 dark:via-accent/30 dark:to-secondary/60">
        <div className="max-w-4xl mx-auto w-full text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">
            Vamos Construir Algo Incrível
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-4 sm:mb-6">
            Pronto para parar de adivinhar e começar a saber exatamente o que
            seus clientes querem?
          </p>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center mb-4 sm:mb-6">
            <Button
              asChild
              variant="primary-rounded"
              size="lg-rounded"
              className="hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto text-xs sm:text-sm"
            >
              <Link href="/login">
                Começar Trial Grátis
                <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline-primary"
              size="lg-rounded"
              className="hover:scale-105 w-full sm:w-auto text-xs sm:text-sm"
            >
              <Link href="mailto:contact@insighthouse.com">
                <Mail className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Fale Conosco
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-1 sm:gap-1.5">
              <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
              <span>14 dias grátis</span>
            </span>
            <span className="flex items-center gap-1 sm:gap-1.5">
              <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
              <span>Sem cartão de crédito</span>
            </span>
            <span className="flex items-center gap-1 sm:gap-1.5">
              <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
              <span>Cancele a qualquer momento</span>
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="snap-start snap-always border-t py-8 sm:py-12 px-4 sm:px-6 min-h-screen flex items-center">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-base sm:text-lg">
                InsightHouse
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
                Analytics para imobiliárias. Pare de adivinhar, comece a saber.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <Link
                href="#features"
                className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Funcionalidades
              </Link>
              <Link
                href="/login"
                className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Entrar
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 pt-6 sm:pt-8 border-t w-full">
              <span className="text-xs sm:text-sm text-muted-foreground">
                © 2025 InsightHouse. Todos os direitos reservados.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
