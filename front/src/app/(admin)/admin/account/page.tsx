'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Input } from '@ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar'
import { Badge } from '@ui/badge'
import {
  User,
  Mail,
  Calendar,
  Shield,
  Settings,
  Lock,
  CreditCard,
} from 'lucide-react'
import { useUser } from '@/lib/hooks'
import { Skeleton } from '@ui/skeleton'

export default function AccountPage() {
  const { data: user, isLoading, error } = useUser()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="space-y-6 sm:space-y-8 pb-6 sm:pb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Minha Conta
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Erro ao carregar dados da conta
          </p>
        </div>
      </div>
    )
  }

  // User data from backend
  const userData = {
    name: user.name || 'User',
    email: user.email,
    createdAt: new Date(user.createdAt).toISOString().split('T')[0],
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-6 sm:pb-10">
      <div className="space-y-2 sm:space-y-3">
        <Badge variant="secondary" className="px-3 py-1 text-xs sm:text-sm">
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
          Configurações de Conta
        </Badge>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
          Minha Conta
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
          Gerencie suas informações pessoais, segurança e preferências da conta
        </p>
      </div>

      {/* Profile Card */}
      <Card className="bg-card border border-border/40 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ease-out">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold">
                Perfil
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm md:text-base mt-1">
                Informações básicas da sua conta
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-border/50 dark:border-border/30">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-primary/20">
              <AvatarImage src="" />
              <AvatarFallback className="text-2xl sm:text-3xl font-semibold bg-primary/10">
                {userData.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2 sm:space-y-3">
              <h3 className="text-xl sm:text-2xl font-bold">{userData.name}</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <p className="text-xs sm:text-sm">{userData.email}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mt-3">
                <Badge variant="default" className="gap-1.5 text-xs sm:text-sm">
                  <Shield className="h-3 w-3" />
                  Conta Ativa
                </Badge>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Membro desde{' '}
                    {new Date(userData.createdAt).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-base sm:text-lg font-semibold text-foreground">
              Informações Pessoais
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nome completo
                </label>
                <Input
                  defaultValue={userData.name}
                  readOnly
                  className="bg-muted/50 h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Endereço de email
                </label>
                <Input
                  defaultValue={userData.email}
                  type="email"
                  readOnly
                  className="bg-muted/50 h-11"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card className="bg-card border border-border/40 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ease-out">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold">
                Segurança
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm md:text-base mt-1">
                Proteja sua conta e dados
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 border border-border/40 rounded-xl">
              <div className="space-y-1">
                <p className="text-sm sm:text-base font-medium">Senha</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Última alteração há mais de 90 dias
                </p>
              </div>
              <Badge variant="secondary" className="text-xs sm:text-sm">
                Em breve
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 border border-border/40 rounded-xl">
              <div className="space-y-1">
                <p className="text-sm sm:text-base font-medium">
                  Autenticação de dois fatores
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Adicione uma camada extra de segurança
                </p>
              </div>
              <Badge variant="secondary" className="text-xs sm:text-sm">
                Em breve
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Card */}
      <Card className="bg-card border border-border/40 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ease-out">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold">
                Plano e Pagamento
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm md:text-base mt-1">
                Gerencie seu plano e forma de pagamento
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 border border-border/40 rounded-xl bg-muted/30">
              <div className="space-y-1">
                <p className="text-sm sm:text-base font-medium">
                  Plano Gratuito
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Acesso completo a todas as funcionalidades
                </p>
              </div>
              <Badge className="bg-green-500 text-xs sm:text-sm">Ativo</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
