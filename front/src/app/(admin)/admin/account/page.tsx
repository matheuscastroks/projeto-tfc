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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minha Conta</h1>
          <p className="text-muted-foreground text-lg">
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
    <div className="space-y-5">
      <div className="space-y-2">
        <Badge variant="secondary" className="px-3 py-1">
          <User className="w-3.5 h-3.5 mr-1.5" />
          Configurações de Conta
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">Minha Conta</h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
          Gerencie suas informações pessoais, segurança e preferências da conta
        </p>
      </div>

      {/* Profile Card */}
      <Card className="border-2 hover:border-primary/50 transition-all duration-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Perfil</CardTitle>
              <CardDescription className="text-base mt-1">
                Informações básicas da sua conta
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-6 pb-6 border-b">
            <Avatar className="h-24 w-24 border-2 border-primary/20">
              <AvatarImage src="" />
              <AvatarFallback className="text-3xl font-semibold bg-primary/10">
                {userData.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <h3 className="text-2xl font-bold">{userData.name}</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <p className="text-sm">{userData.email}</p>
              </div>
              <div className="flex items-center gap-4 mt-3">
                <Badge variant="default" className="gap-1.5">
                  <Shield className="h-3 w-3" />
                  Conta Ativa
                </Badge>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
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
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">
              Informações Pessoais
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      <Card className="border-2 hover:border-primary/50 transition-all duration-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">Segurança</CardTitle>
              <CardDescription className="text-base mt-1">
                Proteja sua conta e dados
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border-2 rounded-xl">
              <div className="space-y-1">
                <p className="font-medium">Senha</p>
                <p className="text-sm text-muted-foreground">
                  Última alteração há mais de 90 dias
                </p>
              </div>
              <Badge variant="secondary">Em breve</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border-2 rounded-xl">
              <div className="space-y-1">
                <p className="font-medium">Autenticação de dois fatores</p>
                <p className="text-sm text-muted-foreground">
                  Adicione uma camada extra de segurança
                </p>
              </div>
              <Badge variant="secondary">Em breve</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Card */}
      <Card className="border-2 hover:border-primary/50 transition-all duration-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">Plano e Pagamento</CardTitle>
              <CardDescription className="text-base mt-1">
                Gerencie seu plano e forma de pagamento
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border-2 rounded-xl bg-muted/30">
              <div className="space-y-1">
                <p className="font-medium">Plano Gratuito</p>
                <p className="text-sm text-muted-foreground">
                  Acesso completo a todas as funcionalidades
                </p>
              </div>
              <Badge className="bg-green-500">Ativo</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
