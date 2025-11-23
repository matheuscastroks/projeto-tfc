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
} from 'lucide-react'
import { ThemeToggle } from '@/lib/components/ThemeToggle'
import logo from '@/assets/logo-insighthouse-fundo-preto.png'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center">
                <Image
                  src={logo}
                  alt="Insighthouse"
                  width={200}
                  height={50}
                  className="h-12 w-auto dark:invert-0 invert"
                />
              </Link>
              <div className="hidden md:flex items-center space-x-8">
                <Link
                  href="#features"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Funcionalidades
                </Link>
                <Link
                  href="#how-it-works"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Como Funciona
                </Link>
                <Link
                  href="#pricing"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Preços
                </Link>
                <Link
                  href="#contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contato
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button asChild variant="outline" size="default">
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

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl font-light tracking-tight text-foreground">
                Analytics
                <br />
                <span className="font-medium">Inteligente</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Para o mercado imobiliário brasileiro. Descubra o que seus
                clientes realmente procuram.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="px-8 py-3 text-lg font-medium"
              >
                <Link href="/login">Começar Grátis</Link>
              </Button>
              <Button
                asChild
                variant="link"
                size="lg"
                className="text-muted-foreground hover:text-foreground px-8 py-3 text-lg font-medium"
              >
                <Link href="#demo">
                  Ver Demonstração
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-foreground mb-6">
              Entenda seus clientes
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Dados organizados e insights acionáveis em tempo real
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="text-center space-y-4 p-6 bg-background rounded-2xl shadow-layer-1">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium text-foreground">
                Top Cidades
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Descubra quais cidades geram mais interesse e onde focar seus
                esforços de marketing
              </p>
            </div>

            <div className="text-center space-y-4 p-6 bg-background rounded-2xl shadow-layer-2">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium text-foreground">
                Tipos de Imóveis
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Entenda a preferência dos seus clientes: apartamentos, casas,
                comerciais
              </p>
            </div>

            <div className="text-center space-y-4 p-6 bg-background rounded-2xl shadow-layer-3">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium text-foreground">
                Finalidades
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Venda, locação ou temporada? Saiba exatamente o que seus
                clientes buscam
              </p>
            </div>

            <div className="text-center space-y-4 p-6 bg-background rounded-2xl shadow-layer-1">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium text-foreground">
                Faixas de Preço
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Identifique o poder aquisitivo dos seus visitantes e ajuste seu
                portfólio
              </p>
            </div>

            <div className="text-center space-y-4 p-6 bg-background rounded-2xl shadow-layer-2">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium text-foreground">
                Funil de Conversão
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Acompanhe a jornada do visitante até se tornar um lead
                qualificado
              </p>
            </div>

            <div className="text-center space-y-4 p-6 bg-background rounded-2xl shadow-layer-3">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium text-foreground">
                Métricas Principais
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Dashboard completo com KPIs essenciais para seu negócio
                imobiliário
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-foreground mb-6">
              Por que escolher o Insight House?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Feito especificamente para o mercado imobiliário brasileiro
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4 p-6 bg-background rounded-2xl">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                <Zap className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground">5 minutos</h3>
              <p className="text-muted-foreground text-sm">
                Implementação rápida com apenas um snippet de código
              </p>
            </div>

            <div className="text-center space-y-4 p-6 bg-background rounded-2xl">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground">
                Dados Seguros
              </h3>
              <p className="text-muted-foreground text-sm">
                First-party data sem dependência de cookies de terceiros
              </p>
            </div>

            <div className="text-center space-y-4 p-6 bg-background rounded-2xl">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground">
                Insights Reais
              </h3>
              <p className="text-muted-foreground text-sm">
                Recomendações claras para melhorar seus resultados
              </p>
            </div>

            <div className="text-center space-y-4 p-6 bg-background rounded-2xl">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground">
                Especializado
              </h3>
              <p className="text-muted-foreground text-sm">
                Feito especificamente para o mercado imobiliário brasileiro
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-foreground mb-6">
              Como funciona
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Três passos simples para começar a entender seus clientes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-light text-primary-foreground">
                  1
                </span>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-medium text-foreground">
                  Configure seu Site
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Adicione seu domínio e configure as permissões de coleta de
                  dados
                </p>
              </div>
            </div>

            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-light text-primary-foreground">
                  2
                </span>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-medium text-foreground">
                  Colete Dados
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  O sistema captura automaticamente todas as interações dos
                  visitantes
                </p>
              </div>
            </div>

            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-light text-primary-foreground">
                  3
                </span>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-medium text-foreground">
                  Analise Insights
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Visualize relatórios completos e tome decisões baseadas em
                  dados
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-light text-foreground">
                Pronto para começar?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Descubra o que seus clientes realmente procuram
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-medium"
              >
                <Link href="/login">Começar Grátis</Link>
              </Button>
              <Button
                asChild
                variant="link"
                size="lg"
                className="text-muted-foreground hover:text-foreground px-8 py-3 text-lg font-medium"
              >
                <Link href="#demo">
                  Ver Demonstração
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <h3 className="text-xl font-medium text-foreground mb-2">
                Insight House
              </h3>
              <p className="text-muted-foreground">
                Analytics inteligente para o mercado imobiliário brasileiro.
              </p>
            </div>
            <div className="flex space-x-8">
              <Link
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Funcionalidades
              </Link>
              <Link
                href="#how-it-works"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Como Funciona
              </Link>
              <Link
                href="#pricing"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Preços
              </Link>
              <Link
                href="#contact"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Contato
              </Link>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 Insight House. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
