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
import {
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  Zap,
  Shield,
  TrendingUp,
} from 'lucide-react'
import { useRegister } from '@/lib/hooks'
import logo from '@/assets/logo-insighthouse-fundo-preto.png'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const registerMutation = useRegister()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await registerMutation.mutateAsync({ email, password, name })
      router.push('/login')
    } catch (err) {
      // Error is handled by React Query and displayed via mutation state
    }
  }

  // Password strength indicators
  const passwordChecks = [
    { label: 'Pelo menos 8 caracteres', met: password.length >= 8 },
    { label: 'Contém uma letra maiúscula', met: /[A-Z]/.test(password) },
    { label: 'Contém um número', met: /\d/.test(password) },
  ]

  const allPasswordChecksMet = passwordChecks.every((check) => check.met)

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
                <Zap className="w-4 h-4 mr-2" />
                Comece grátis
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Transforme visitantes
                <br />
                em <span className="text-primary">vendas</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Junte-se a centenas de imobiliárias que já descobriram o que
                seus clientes realmente procuram.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Teste grátis por 14 dias
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Sem cartão de crédito. Cancele quando quiser.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <TrendingUp className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Instalação em 5 minutos
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Cole um código no seu site e pronto. Dados em tempo real.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Dados 100% seguros
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    First-party data sem dependência de cookies terceiros.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Register Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <Card className="border-2 shadow-xl">
              <CardHeader className="space-y-2 text-center pb-6">
                <CardTitle className="text-2xl font-bold">
                  Comece grátis agora
                </CardTitle>
                <p className="text-muted-foreground">
                  Crie sua conta em menos de 1 minuto
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="text-sm font-medium text-foreground"
                      >
                        Nome completo
                      </label>
                      <Input
                        id="name"
                        placeholder="João Silva"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="h-12 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium text-foreground"
                      >
                        Email profissional
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

                      {/* Password Strength Indicator */}
                      {password && (
                        <div className="space-y-2 p-4 bg-muted/30 rounded-xl border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-muted-foreground font-medium">
                              Requisitos da senha:
                            </p>
                            {allPasswordChecksMet && (
                              <Badge
                                variant="default"
                                className="bg-green-500/10 text-green-600 border-green-500/20"
                              >
                                Forte
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-2">
                            {passwordChecks.map((check, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <CheckCircle2
                                  className={`h-4 w-4 ${
                                    check.met
                                      ? 'text-green-500'
                                      : 'text-muted-foreground/30'
                                  }`}
                                />
                                <span
                                  className={`text-xs ${
                                    check.met
                                      ? 'text-foreground font-medium'
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  {check.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {registerMutation.isError && (
                    <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                      {registerMutation.error instanceof Error
                        ? registerMutation.error.message
                        : 'Não foi possível criar a conta. Tente novamente.'}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold"
                    size="lg"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending && (
                      <Spinner className="mr-2 h-4 w-4" />
                    )}
                    {registerMutation.isPending
                      ? 'Criando conta...'
                      : 'Criar conta grátis'}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Ao criar uma conta, você concorda com nossos Termos de Uso e
                    Política de Privacidade
                  </p>
                </form>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-3 text-muted-foreground font-medium">
                      Já tem uma conta?
                    </span>
                  </div>
                </div>

                {/* Sign In Link */}
                <div className="text-center">
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full h-12 font-semibold"
                  >
                    <Link href="/login">Fazer login</Link>
                  </Button>
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
