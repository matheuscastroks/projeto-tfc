import Link from 'next/link'
import Image from 'next/image'
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
  CheckCircle2,

  Star,
} from 'lucide-react'
import { ThemeToggle } from '@/lib/components/ThemeToggle'
import logo from '@/assets/logo-insighthouse-fundo-preto.png'

async function getEventsCount() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    if (!baseUrl) {
      console.warn('NEXT_PUBLIC_API_BASE_URL is not defined')
      return null
    }

    const res = await fetch(`${baseUrl}/api/events/stats`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.totalEvents || 0
  } catch (error) {
    console.error('Failed to fetch events count:', error)
    return null
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M+'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K+'
  }
  return num.toString()
}

export default async function HomePage() {
  const eventsCount = await getEventsCount()
  const displayCount =
    eventsCount !== null ? formatNumber(eventsCount) : '---'

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Image
                src={logo}
                alt="Insighthouse"
                width={180}
                height={45}
                className="h-10 w-auto dark:invert-0 invert"
              />
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button asChild variant="ghost" size="default">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button
                asChild
                size="default"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Link href="/login">Começar Grátis</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Focused on pain/benefit */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="space-y-8">
            {/* Social Proof Badge */}
            <div className="flex justify-center">
              <Badge
                variant="secondary"
                className="px-4 py-2 text-sm font-normal"
              >
                <Star className="w-4 h-4 mr-2 fill-primary text-primary" />
                Feito especialmente para o mercado imobiliário brasileiro
              </Badge>
            </div>

            {/* Main Headline - Pain focused */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-tight">
                Pare de adivinhar o que
                <br />
                <span className="text-primary">seus clientes procuram</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Descubra exatamente quais cidades, tipos de imóveis e faixas de
                preço geram mais interesse e converta mais leads em vendas.
              </p>
            </div>

            {/* Strong CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                asChild
                size="lg"
                className="px-8 py-6 text-lg font-semibold h-auto"
              >
                <Link href="/login">
                  Começar Grátis Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

            </div>

            {/* Risk Reducers */}
            <div className="flex flex-wrap justify-center gap-6 pt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Teste grátis por 14 dias</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Instalação em 5 minutos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Numbers */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                {displayCount}
              </div>
              <div className="text-muted-foreground">Eventos rastreados</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                97%
              </div>
              <div className="text-muted-foreground">Taxa de precisão</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                5min
              </div>
              <div className="text-muted-foreground">Para implementar</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                24/7
              </div>
              <div className="text-muted-foreground">Coleta automática</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Benefits - What they get */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Transforme dados em decisões
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Você investe em marketing, mas não sabe o que funciona de verdade.
              Nós resolvemos isso.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Saiba onde investir</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Descubra quais cidades, bairros e tipos de imóveis seus
                  clientes realmente procuram. Pare de gastar em marketing
                  genérico.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Venda mais rápido</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Identifique leads quentes antes da concorrência. Veja quem
                  está pesquisando ativamente e personalize sua abordagem.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Aumente seu ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Deixe de perder oportunidades. Entenda o comportamento dos
                  seus visitantes e ajuste suas estratégias em tempo real.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>



      {/* Testimonials - Social Proof */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Quem já usa, aprova
            </h2>
            <p className="text-xl text-muted-foreground">
              Veja o que corretores e imobiliárias estão dizendo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-background">
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-primary text-primary"
                    />
                  ))}
                </div>
                <CardDescription className="text-base italic leading-relaxed text-foreground">
                  &ldquo;Descobrimos que 70% dos nossos leads buscavam imóveis
                  em uma cidade específica. Ajustamos o estoque e as vendas
                  subiram 40%.&rdquo;
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">
                    Carlos Eduardo
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Diretor Comercial, SP Imóveis
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background">
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-primary text-primary"
                    />
                  ))}
                </div>
                <CardDescription className="text-base italic leading-relaxed text-foreground">
                  &ldquo;Antes gastávamos muito em anúncios sem saber o que
                  funcionava. Agora sabemos exatamente onde investir. ROI
                  aumentou 3x.&rdquo;
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">
                    Mariana Santos
                  </p>
                  <p className="text-sm text-muted-foreground">
                    CEO, Habitat Negócios Imobiliários
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background">
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-primary text-primary"
                    />
                  ))}
                </div>
                <CardDescription className="text-base italic leading-relaxed text-foreground">
                  &ldquo;Implementamos em 10 minutos. No mesmo dia já
                  identificamos padrões que mudaram nossa estratégia de
                  vendas.&rdquo;
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">
                    Roberto Almeida
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Corretor Autônomo, Rio de Janeiro
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works - Simplified */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Simples como deve ser
            </h2>
            <p className="text-xl text-muted-foreground">
              Não precisa de desenvolvedor. Não precisa de integração complexa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-semibold text-foreground">
                Cole o código
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Adicione uma linha no seu site e pronto. Funciona com qualquer
                plataforma.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-semibold text-foreground">
                Aguarde
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Os dados começam a chegar automaticamente. Nenhuma configuração
                adicional.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-semibold text-foreground">
                Decida melhor
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Veja insights claros e tome decisões que aumentam suas vendas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Features - Complexity increases */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Tudo que você precisa para vender mais
            </h2>
            <p className="text-xl text-muted-foreground">
              Dados organizados e prontos para ação
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  Análise geográfica
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Veja exatamente quais cidades e bairros seus visitantes mais
                  buscam. Ajuste seu estoque baseado em demanda real.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  Preferências de imóveis
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Apartamento, casa, comercial? Quantos quartos? Descubra o
                  perfil exato do que seus clientes procuram.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  Poder de compra
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Identifique as faixas de preço mais procuradas. Personalize
                  sua oferta para o público certo.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  Jornada do cliente
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Acompanhe cada passo: da primeira visita até o contato. Saiba
                  onde estão os gargalos.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  Conversões rastreadas
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Formulários, WhatsApp, telefone. Saiba exatamente quantos
                  leads você está gerando.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  Dashboard em tempo real
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Todas as métricas que importam em um só lugar. Sem
                  complicação, sem relatórios confusos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Reducers & Guarantees */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Experimente sem risco
            </h2>
            <p className="text-xl text-muted-foreground">
              Não acredite só na nossa palavra. Teste por 14 dias grátis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 p-8 bg-background rounded-2xl border-2 border-border">
              <Shield className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">
                14 dias grátis
              </h3>
              <p className="text-muted-foreground">
                Teste todas as funcionalidades. Sem limitações. Sem cartão de
                crédito.
              </p>
            </div>

            <div className="text-center space-y-4 p-8 bg-background rounded-2xl border-2 border-border">
              <Zap className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">
                Implementação garantida
              </h3>
              <p className="text-muted-foreground">
                Se não conseguir instalar em 5 minutos, nossa equipe faz pra
                você. De graça.
              </p>
            </div>

            <div className="text-center space-y-4 p-8 bg-background rounded-2xl border-2 border-border">
              <Users className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">
                Suporte brasileiro
              </h3>
              <p className="text-muted-foreground">
                Time 100% brasileiro que entende o mercado imobiliário. Resposta
                rápida.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Strong */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-12 text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                  Pare de perder vendas
                  <br />
                  por falta de informação
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Enquanto você lê isso, seus concorrentes já estão usando dados
                  para fechar mais negócios. Não fique para trás.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button
                  asChild
                  size="lg"
                  className="px-10 py-6 text-lg font-semibold h-auto shadow-lg"
                >
                  <Link href="/login">
                    Começar Grátis Agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-6 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>14 dias grátis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>Sem cartão</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>Cancele quando quiser</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer - Simple */}
      <footer className="bg-muted/30 border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center">
              <Image
                src={logo}
                alt="Insighthouse"
                width={180}
                height={45}
                className="h-10 w-auto dark:invert-0 invert"
              />
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link
                href="/login"
                className="hover:text-foreground transition-colors"
              >
                Entrar
              </Link>

              <p>&copy; 2025 Insight House</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
