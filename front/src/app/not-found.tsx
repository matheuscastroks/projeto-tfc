import Link from 'next/link'
import { Button } from '@ui/button'
import { Card, CardContent } from '@ui/card'
import { ThemeToggle } from '@/lib/components/ThemeToggle'
import { ArrowLeft, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
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
                className="hover:scale-105 transition-transform text-xs sm:text-sm"
              >
                <Link href="/" className="flex items-center gap-1.5 sm:gap-2">
                  <Home className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Início</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16 pt-20 sm:pt-24">
        <div className="w-full max-w-2xl mx-auto text-center">
          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-8 sm:p-12 space-y-6 sm:space-y-8">
              {/* 404 Icon */}
              <div className="space-y-4 sm:space-y-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-foreground">
                    404
                  </h1>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground">
                    Página não encontrada
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                    A página que você está procurando não existe ou foi movida.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-4">
                <Button
                  asChild
                  variant="primary-rounded"
                  size="lg-rounded"
                  className="hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto"
                >
                  <Link
                    href="/"
                    className="flex items-center justify-center gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Voltar ao Início
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline-primary"
                  size="lg-rounded"
                  className="hover:scale-105 w-full sm:w-auto"
                >
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Fazer Login
                  </Link>
                </Button>
              </div>

              {/* Help Text */}
              <div className="pt-4 sm:pt-6 border-t border-border/50">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Precisa de ajuda?{' '}
                  <Link
                    href="/"
                    className="text-foreground hover:text-primary transition-colors font-medium"
                  >
                    Entre em contato
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            © 2025 InsightHouse. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
