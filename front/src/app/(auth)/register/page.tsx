'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import salesIllustration from '@/assets/illustrations/auth/sales.svg'
import { Button } from '@ui/button'
import { Input } from '@ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card'
import { Badge } from '@ui/badge'
import { ThemeToggle } from '@/lib/components/ThemeToggle'
import { Spinner } from '@ui/spinner'
import { ArrowLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { useRegister } from '@/lib/hooks'

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
      {/* Mobile Header */}
      <header className="lg:hidden border-b border-border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-semibold tracking-tight hover:text-primary transition-colors"
            >
              InsightHouse
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button
                asChild
                variant="ghost"
                size="default"
                className="hover:scale-105 transition-transform"
              >
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
      <main className="flex-1 flex items-center justify-center px-0 py-0">
        <div className="w-full h-screen lg:h-screen grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side - Register Form */}
          <div className="flex items-center justify-center p-6 lg:p-12 bg-sidebar-accent order-2 lg:order-1 border-r border-border/30 dark:border-border/20">
            <div className="w-full max-w-md">
              <Card className="border-0 bg-transparent">
                <CardHeader className="space-y-2 text-center pb-6">
                  <CardTitle className="text-2xl font-bold">
                    Comece grátis agora
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Crie sua conta em menos de 1 minuto
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <form
                    onSubmit={onSubmit}
                    className="space-y-4 xs:space-y-5 md:space-y-6"
                  >
                    {/* Name & Email row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-5">
                      <div className="space-y-2">
                        <label
                          htmlFor="name"
                          className="text-xs xs:text-sm font-medium text-muted-foreground"
                        >
                          Nome completo
                        </label>
                        <Input
                          id="name"
                          placeholder="Como devo te chamar?"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="email"
                          className="text-xs xs:text-sm font-medium text-muted-foreground"
                        >
                          Email profissional
                        </label>
                        <Input
                          id="email"
                          placeholder="Seu melhor email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <label
                        htmlFor="password"
                        className="text-xs xs:text-sm font-medium text-muted-foreground"
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
                          className="pr-12"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-auto w-auto p-0 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </Button>
                      </div>

                      {/* Password Strength Indicator */}
                      {password && (
                        <div className="space-y-2 p-4 bg-muted/30 rounded-lg border border-border/40">
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

                    {registerMutation.isError && (
                      <div className="text-xs text-center text-destructive bg-destructive/10 border border-destructive/20 rounded-lg py-2 px-4">
                        {registerMutation.error instanceof Error
                          ? registerMutation.error.message
                          : 'Não foi possível criar a conta. Tente novamente.'}
                      </div>
                    )}

                    {/* Footer row - privacy + button */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                      <p className="text-[10px] xs:text-xs text-muted-foreground/70 max-w-xs">
                        Suas informações são seguras e nunca serão
                        compartilhadas com terceiros.
                      </p>

                      <Button
                        type="submit"
                        variant="primary-rounded"
                        size="lg-rounded"
                        disabled={registerMutation.isPending}
                        className="sm:w-auto w-full"
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Spinner className="w-4 h-4 animate-spin" />
                            <span>Criando conta...</span>
                          </>
                        ) : (
                          <span>Criar conta grátis</span>
                        )}
                      </Button>
                    </div>

                    <p className="text-[10px] xs:text-xs text-center text-muted-foreground/70">
                      Ao criar uma conta, você concorda com nossos Termos de Uso
                      e Política de Privacidade
                    </p>
                  </form>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-muted px-3 text-muted-foreground font-medium">
                        Já tem uma conta?
                      </span>
                    </div>
                  </div>

                  {/* Sign In Link */}
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="outline-rounded"
                      size="lg-rounded"
                      onClick={() => router.push('/login')}
                      className="w-full"
                    >
                      <span>Fazer login</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Side - Information Section */}
          <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-secondary via-card/80 to-accent/60 dark:from-secondary dark:via-secondary/95 dark:to-secondary/90 order-1 lg:order-2 border-l border-border/50 dark:border-border/30">
            <div className="relative z-10 flex flex-col justify-between p-12 text-foreground w-full">
              <div className="flex-1 flex flex-col">
                {/* Header in information section */}
                <div className="mb-8 flex items-center justify-between">
                  <Link
                    href="/"
                    className="text-2xl font-bold tracking-tight text-foreground hover:text-primary/80 transition-colors"
                  >
                    InsightHouse
                  </Link>
                  <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <Button
                      asChild
                      variant="ghost"
                      size="default"
                      className="hover:scale-105 transition-transform hover:bg-foreground/10 dark:hover:bg-foreground/10"
                    >
                      <Link href="/" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Voltar
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Main Content - Título e Imagem lado a lado */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="grid grid-cols-2 gap-6 items-center">
                    {/* Texto */}
                    <div className="space-y-4">
                      <h1 className="text-3xl md:text-4xl font-bold leading-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                        Transforme visitantes
                        <br />
                        em <span className="text-primary">vendas</span>
                      </h1>
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-light">
                        Junte-se a centenas de imobiliárias que já descobriram o
                        que seus clientes realmente procuram.
                      </p>
                    </div>

                    {/* Illustration - Destaque ao lado */}
                    <div className="relative w-full aspect-square">
                      <Image
                        src={salesIllustration}
                        alt="Transforme visitantes em vendas"
                        fill
                        className="object-contain dark:invert"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
