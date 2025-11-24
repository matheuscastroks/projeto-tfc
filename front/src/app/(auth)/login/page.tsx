'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@ui/button'
import { Input } from '@ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card'
import { Badge } from '@ui/badge'
import { ThemeToggle } from '@/lib/components/ThemeToggle'
import { Spinner } from '@ui/spinner'
import { ArrowLeft, Eye, EyeOff, CheckCircle2, Shield } from 'lucide-react'
import { useLogin } from '@/lib/hooks'
import logo from '@/assets/logo-insighthouse-fundo-preto.png'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const loginMutation = useLogin()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await loginMutation.mutateAsync({ email, password })
      router.push('/admin')
    } catch (err) {
      // Error is handled by React Query and displayed via mutation state
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
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
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Value Proposition */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                Acesso seguro
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Bem-vindo de volta
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Continue transformando dados em decisões que aumentam suas
                vendas.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Analytics em tempo real
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Acompanhe o comportamento dos seus visitantes enquanto
                    acontece
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Insights acionáveis
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Descubra padrões e tome decisões baseadas em dados reais
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Dashboard completo
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Todas as métricas importantes em um só lugar
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <Card className="border-2 shadow-xl">
              <CardHeader className="space-y-2 text-center pb-6">
                <CardTitle className="text-2xl font-bold">
                  Entre na sua conta
                </CardTitle>
                <p className="text-muted-foreground">
                  Acesse seu dashboard de analytics
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium text-foreground"
                      >
                        Email
                      </label>
                      <Input
                        id="email"
                        placeholder="seu@email.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="password"
                        className="text-sm font-medium text-foreground"
                      >
                        Senha
                      </label>
                      <div className="relative">
                        <Input
                          id="password"
                          placeholder="••••••••"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="h-12 text-base pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {loginMutation.isError && (
                    <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                      {loginMutation.error instanceof Error
                        ? loginMutation.error.message
                        : 'Email ou senha incorretos. Tente novamente.'}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold"
                    size="lg"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending && (
                      <Spinner className="mr-2 h-4 w-4" />
                    )}
                    {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-3 text-muted-foreground font-medium">
                      Novo por aqui?
                    </span>
                  </div>
                </div>

                {/* Sign Up Link */}
                <div className="text-center space-y-4">
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full h-12 font-semibold"
                  >
                    <Link href="/register">Criar conta grátis</Link>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    14 dias grátis • Sem cartão de crédito
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
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
