import Link from 'next/link'
import { Button } from '@ui/button'
import { Card, CardContent } from '@ui/card'
import { ThemeToggle } from '@/lib/components/ThemeToggle'
import { ArrowLeft, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold">Insight House</span>
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button asChild variant="ghost" size="default">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Início
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl mx-auto text-center">
          <Card className="border-2 shadow-xl">
            <CardContent className="p-12 space-y-8">
              {/* 404 Icon */}
              <div className="space-y-4">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-12 w-12 text-primary" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-6xl font-bold text-foreground">404</h1>
                  <h2 className="text-2xl font-semibold text-foreground">
                    Página não encontrada
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    A página que você está procurando não existe ou foi movida.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button
                  asChild
                  size="lg"
                  className="px-8 py-6 h-auto font-semibold"
                >
                  <Link href="/">
                    <Home className="mr-2 h-5 w-5" />
                    Voltar ao Início
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 h-auto font-semibold"
                >
                  <Link href="/login">
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Fazer Login
                  </Link>
                </Button>
              </div>

              {/* Help Text */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
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
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Insight House. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
