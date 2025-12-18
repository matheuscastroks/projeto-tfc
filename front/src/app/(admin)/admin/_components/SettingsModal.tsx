'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@ui/dialog'
import { Input } from '@ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar'
import { Badge } from '@ui/badge'
import { Button } from '@ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Alert, AlertDescription, AlertTitle } from '@ui/alert'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@ui/tooltip'
import {
  User,
  Mail,
  Calendar,
  Shield,
  Lock,
  CreditCard,
  Settings,
  X,
  Globe,
  Code,
  Pencil,
  Key,
  Plus,
  ExternalLink,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Timer,
  Zap,
} from 'lucide-react'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@ui/select'
import {
  useUser,
  useSites,
  useCreateSite,
  useUpdateSite,
  useSite,
} from '@/lib/hooks'
import { Skeleton } from '@ui/skeleton'
import { Spinner } from '@ui/spinner'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/lib/components/dashboard'
import { DeleteSiteButton } from '../sites/_components/DeleteSiteButton'
import { CopySnippetButton } from '../install/_components/CopySnippetButton'
import { useQueryClient } from '@tanstack/react-query'
import { Building2, Activity } from 'lucide-react'
import { useSettingsModal } from '@/lib/providers/SettingsModalProvider'


type SettingsSection = 'profile' | 'security' | 'billing' | 'sites' | 'install'

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultSection?: SettingsSection
}

const settingsSections: {
  id: SettingsSection
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'security', label: 'Segurança', icon: Lock },
  { id: 'billing', label: 'Plano e Pagamento', icon: CreditCard },
  { id: 'sites', label: 'Gerenciar Sites', icon: Globe },
  { id: 'install', label: 'Instalação', icon: Code },
]

export function SettingsModal({
  open,
  onOpenChange,
  defaultSection = 'profile',
}: SettingsModalProps) {
  const {
    section: contextSection,
    editingSiteId: contextEditingSiteId,
    setEditingSiteId: setContextEditingSiteId,
  } = useSettingsModal()
  const [activeSection, setActiveSection] =
    useState<SettingsSection>(defaultSection)
  const [isCreatingSite, setIsCreatingSite] = useState(false)
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null)
  const [editingSiteStatus, setEditingSiteStatus] = useState<
    'active' | 'inactive'
  >('active')
  const [newSiteName, setNewSiteName] = useState('')
  const [newSiteDomain, setNewSiteDomain] = useState('')
  const { data: user, isLoading, error } = useUser()
  const { data: sites, isLoading: sitesLoading, error: sitesError } = useSites()
  const currentEditingSiteId = editingSiteId || contextEditingSiteId
  const { data: editingSite } = useSite(currentEditingSiteId || '')
  const createSiteMutation = useCreateSite()
  const updateSiteMutation = useUpdateSite()
  const queryClient = useQueryClient()

  // Sync active section when modal opens
  useEffect(() => {
    if (!open) return

    if (contextEditingSiteId) {
      setEditingSiteId(contextEditingSiteId)
      setActiveSection('sites')
    } else if (defaultSection) {
      setActiveSection(defaultSection)
    } else if (contextSection) {
      setActiveSection(contextSection)
    }
  }, [open, defaultSection, contextSection, contextEditingSiteId])

  // Sync editing site status when site data loads
  useEffect(() => {
    if (!editingSite) return
    setEditingSiteStatus(editingSite.status as 'active' | 'inactive')
  }, [editingSite])

  // Reset form state when modal closes
  useEffect(() => {
    if (open) return

    setIsCreatingSite(false)
    setEditingSiteId(null)
    setContextEditingSiteId(null)
    setNewSiteName('')
    setNewSiteDomain('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createSiteMutation.mutateAsync({
        name: newSiteName,
        domain: newSiteDomain,
      })
      setIsCreatingSite(false)
      setNewSiteName('')
      setNewSiteDomain('')
      queryClient.invalidateQueries({ queryKey: ['sites'] })
    } catch (error) {
      console.error('Failed to create site:', error)
    }
  }

  const handleUpdateSite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentEditingSiteId || !editingSite) return
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const name = formData.get('name') as string

    try {
      await updateSiteMutation.mutateAsync({
        siteId: currentEditingSiteId,
        data: { name, status: editingSiteStatus },
      })
      setEditingSiteId(null)
      setContextEditingSiteId(null)
      queryClient.invalidateQueries({ queryKey: ['sites'] })
    } catch (error) {
      console.error('Failed to update site:', error)
    }
  }

  const firstSite = sites?.[0]
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || ''
  const loaderUrl = firstSite
    ? `${base}/api/sdk/loader?site=${encodeURIComponent(firstSite.siteKey)}`
    : ''

  if (error || (!isLoading && !user)) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl h-[85vh] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 dark:border-border/30">
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              Configurações
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex items-center justify-center p-6">
            <p className="text-sm sm:text-base text-muted-foreground">
              Erro ao carregar dados da conta
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const userData = user
    ? {
        name: user.name || 'User',
        email: user.email,
        createdAt: new Date(user.createdAt).toISOString().split('T')[0],
      }
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 flex flex-col overflow-hidden [&>button]:!hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 dark:border-border/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-bold">
                  Configurações
                </DialogTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Gerencie suas informações pessoais e preferências
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 sm:h-9 sm:w-9 hover:scale-105 transition-transform"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Navigation */}
          <div className="w-64 border-r border-border/50 dark:border-border/30 bg-sidebar flex-shrink-0 overflow-y-auto">
            <div className="p-4 space-y-1">
              {settingsSections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-out',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{section.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Panel - Content */}
          <div className="flex-1 overflow-y-auto bg-background">
            {isLoading ? (
              <div className="p-6 space-y-6">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : userData ? (
              <div className="p-6">
                {activeSection === 'profile' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold mb-1">
                        Perfil
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Informações básicas da sua conta
                      </p>
                    </div>

                    {/* Profile Header */}
                    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 pb-6 border-b border-border/50 dark:border-border/30">
                      <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-primary/20">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-2xl sm:text-3xl font-semibold bg-primary/10">
                          {userData.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2 sm:space-y-3">
                        <h3 className="text-xl sm:text-2xl font-bold">
                          {userData.name}
                        </h3>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <p className="text-xs sm:text-sm">{userData.email}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mt-3">
                          <Badge
                            variant="default"
                            className="gap-1.5 text-xs sm:text-sm"
                          >
                            <Shield className="h-3 w-3" />
                            Conta Ativa
                          </Badge>
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Membro desde{' '}
                              {new Date(userData.createdAt).toLocaleDateString(
                                'pt-BR',
                                {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h4 className="text-base sm:text-lg font-semibold text-foreground">
                        Informações Pessoais
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                          <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
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
                          <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
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
                  </div>
                )}

                {activeSection === 'security' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold mb-1">
                        Segurança
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Proteja sua conta e dados
                      </p>
                    </div>

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
                  </div>
                )}

                {activeSection === 'billing' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold mb-1">
                        Plano e Pagamento
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Gerencie seu plano e forma de pagamento
                      </p>
                    </div>

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
                        <Badge className="bg-green-500 text-xs sm:text-sm">
                          Ativo
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'sites' && (
                  <div className="space-y-6">
                    {isCreatingSite ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-lg sm:text-xl font-semibold mb-1">
                              Novo Site
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Preencha os dados abaixo para criar um novo site
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setIsCreatingSite(false)
                              setNewSiteName('')
                              setNewSiteDomain('')
                            }}
                            className="h-8 w-8 sm:h-9 sm:w-9"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <form
                          onSubmit={handleCreateSite}
                          className="space-y-4 sm:space-y-5 md:space-y-6"
                        >
                          <div className="space-y-4 sm:space-y-5">
                            <div className="space-y-1.5 sm:space-y-2">
                              <label
                                htmlFor="new-site-name"
                                className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2"
                              >
                                <Building2 className="h-3.5 w-3.5" />
                                Nome do Site
                              </label>
                              <Input
                                id="new-site-name"
                                value={newSiteName}
                                onChange={(e) => setNewSiteName(e.target.value)}
                                placeholder="Minha Imobiliária"
                                required
                              />
                            </div>

                            <div className="space-y-1.5 sm:space-y-2">
                              <label
                                htmlFor="new-site-domain"
                                className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2"
                              >
                                <Globe className="h-3.5 w-3.5" />
                                Domínio Principal (FQDN)
                              </label>
                              <Input
                                id="new-site-domain"
                                value={newSiteDomain}
                                onChange={(e) =>
                                  setNewSiteDomain(e.target.value)
                                }
                                placeholder="www.exemplo.com"
                                required
                              />
                            </div>
                          </div>

                          {createSiteMutation.isError && (
                            <div className="text-xs text-center text-destructive bg-destructive/10 border border-destructive/20 rounded-lg py-2 px-3 sm:px-4">
                              {createSiteMutation.error instanceof Error
                                ? createSiteMutation.error.message
                                : 'Falha ao criar site'}
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                            <p className="text-[10px] sm:text-xs text-muted-foreground/70 max-w-xs">
                              Seu site será configurado e estará pronto para
                              rastrear visitantes em poucos minutos.
                            </p>

                            <div className="flex items-center gap-3">
                              <Button
                                type="submit"
                                variant="primary-rounded"
                                size="lg-rounded"
                                disabled={createSiteMutation.isPending}
                                className="sm:w-auto w-full"
                              >
                                {createSiteMutation.isPending ? (
                                  <>
                                    <Spinner className="w-4 h-4 animate-spin" />
                                    <span>Criando...</span>
                                  </>
                                ) : (
                                  <span>Criar Site</span>
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="outline-rounded"
                                size="lg-rounded"
                                onClick={() => {
                                  setIsCreatingSite(false)
                                  setNewSiteName('')
                                  setNewSiteDomain('')
                                }}
                                className="sm:w-auto w-full"
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        </form>
                      </div>
                    ) : editingSiteId && editingSite ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-lg sm:text-xl font-semibold mb-1">
                              Editar Site
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Atualize o nome e o status do site conforme
                              necessário
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingSiteId(null)
                              setContextEditingSiteId(null)
                            }}
                            className="h-8 w-8 sm:h-9 sm:w-9"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <form
                          onSubmit={handleUpdateSite}
                          className="space-y-4 sm:space-y-5 md:space-y-6"
                        >
                          <div className="space-y-4 sm:space-y-5">
                            <div className="space-y-1.5 sm:space-y-2">
                              <label
                                htmlFor="edit-site-name"
                                className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2"
                              >
                                <Building2 className="h-3.5 w-3.5" />
                                Nome do Site
                              </label>
                              <Input
                                id="edit-site-name"
                                name="name"
                                defaultValue={editingSite.name}
                                placeholder="Nome do site"
                                required
                              />
                            </div>
                            <div className="space-y-1.5 sm:space-y-2">
                              <label
                                htmlFor="edit-site-status"
                                className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2"
                              >
                                <Activity className="h-3.5 w-3.5" />
                                Status
                              </label>
                              <Select
                                value={editingSiteStatus}
                                onValueChange={(v) =>
                                  setEditingSiteStatus(v as 'active' | 'inactive')
                                }
                              >
                                <SelectTrigger id="edit-site-status">
                                  <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Ativo</SelectItem>
                                  <SelectItem value="inactive">
                                    Inativo
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {updateSiteMutation.isError && (
                            <div className="text-xs text-center text-destructive bg-destructive/10 border border-destructive/20 rounded-lg py-2 px-3 sm:px-4">
                              {updateSiteMutation.error instanceof Error
                                ? updateSiteMutation.error.message
                                : 'Falha ao atualizar site'}
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                            <p className="text-[10px] sm:text-xs text-muted-foreground/70 max-w-xs">
                              As alterações serão aplicadas imediatamente após
                              salvar.
                            </p>

                            <div className="flex items-center gap-3">
                              <Button
                                type="submit"
                                variant="primary-rounded"
                                size="lg-rounded"
                                disabled={updateSiteMutation.isPending}
                                className="sm:w-auto w-full"
                              >
                                {updateSiteMutation.isPending ? (
                                  <>
                                    <Spinner className="w-4 h-4 animate-spin" />
                                    <span>Salvando...</span>
                                  </>
                                ) : (
                                  <span>Salvar Alterações</span>
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="outline-rounded"
                                size="lg-rounded"
                                onClick={() => setEditingSiteId(null)}
                                className="sm:w-auto w-full"
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
                          <div>
                            <h2 className="text-lg sm:text-xl font-semibold mb-1">
                              Gerenciar Sites
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Cadastre seus domínios e comece a rastrear
                              visitantes
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => setIsCreatingSite(true)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Novo Site
                          </Button>
                        </div>

                        {sitesLoading ? (
                          <div className="space-y-4">
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-40 w-full" />
                          </div>
                        ) : sitesError ? (
                          <Alert variant="destructive">
                            <AlertDescription>
                              Erro ao carregar sites. Verifique sua conexão e tente
                              novamente.
                            </AlertDescription>
                          </Alert>
                        ) : sites?.length === 0 ? (
                          <EmptyState
                            icon={Globe}
                            title="Nenhum site configurado"
                            description="Comece adicionando seu primeiro site para começar a rastrear visitantes e gerar insights sobre suas campanhas imobiliárias"
                            action={{
                              label: 'Adicionar Primeiro Site',
                              onClick: () => setIsCreatingSite(true),
                            }}
                          />
                        ) : (
                          <div className="space-y-3 sm:space-y-4">
                            {sites?.map((s) => (
                              <Card
                                key={s.id}
                                className="bg-card border border-border/40 shadow-sm hover:shadow-md transition-all duration-200 ease-out"
                              >
                                <CardContent className="p-4 sm:p-5">
                                  <div className="space-y-4">
                                    {/* Header: Nome, Status e Ações */}
                                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                                      <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                          <Globe className="h-5 w-5 sm:h-5 sm:w-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                            <CardTitle className="text-base sm:text-lg font-semibold truncate">
                                              {s.name}
                                            </CardTitle>
                                            <Badge
                                              variant={
                                                s.status === 'active'
                                                  ? 'default'
                                                  : 'secondary'
                                              }
                                              className="flex items-center gap-1 text-xs flex-shrink-0"
                                            >
                                              <CheckCircle2 className="h-3 w-3" />
                                              {s.status === 'active'
                                                ? 'Ativo'
                                                : 'Inativo'}
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          aria-label="Editar site"
                                          title="Editar site"
                                          className="h-8 w-8 sm:h-8 sm:w-8"
                                          onClick={() => {
                                            setEditingSiteId(s.id)
                                            setContextEditingSiteId(s.id)
                                          }}
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                        <DeleteSiteButton siteId={s.id} />
                                      </div>
                                    </div>

                                    {/* Site Key */}
                                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                                      <Key className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                      <code className="bg-muted/50 px-2 py-1.5 rounded-md font-mono text-xs break-all flex-1">
                                        {s.siteKey}
                                      </code>
                                    </div>

                                    {/* Domínio */}
                                    {s.domains && s.domains.length > 0 && (
                                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                        <a
                                          href={`https://${s.domains.find((d) => d.isPrimary)?.host || s.domains[0]?.host}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-muted-foreground hover:text-primary transition-colors truncate flex-1"
                                        >
                                          {s.domains.find((d) => d.isPrimary)
                                            ?.host || s.domains[0]?.host}
                                        </a>
                                        {s.domains.length > 1 && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs flex-shrink-0"
                                          >
                                            +{s.domains.length - 1}
                                          </Badge>
                                        )}
                                      </div>
                                    )}

                                    {/* Ações */}
                                    <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 sm:flex-initial text-xs sm:text-sm"
                                        onClick={() => setActiveSection('install')}
                                      >
                                        <Key className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                                        Ver Código
                                      </Button>
                                      <Button
                                        asChild
                                        variant="default"
                                        size="sm"
                                        className="flex-1 sm:flex-initial text-xs sm:text-sm"
                                      >
                                        <Link
                                          href="/admin/insights"
                                          className="flex items-center justify-center gap-1.5 sm:gap-2"
                                        >
                                          <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                          Ver Análises
                                        </Link>
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {activeSection === 'install' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold mb-1">
                        Instalação
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Cole uma linha de código no seu site e comece a coletar
                        dados automaticamente
                      </p>
                    </div>

                    {sitesLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ) : sitesError ? (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Erro ao carregar sites</AlertTitle>
                        <AlertDescription>
                          Não foi possível carregar suas configurações.
                          Verifique sua conexão e tente novamente.
                        </AlertDescription>
                      </Alert>
                    ) : !firstSite ? (
                      <div className="space-y-4">
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Nenhum site configurado</AlertTitle>
                          <AlertDescription>
                            Você precisa criar um site antes de obter o código de
                            instalação.
                          </AlertDescription>
                        </Alert>
                        <EmptyState
                          icon={Globe}
                          title="Configure seu primeiro site"
                          description="Adicione seu site para receber o código de rastreamento e começar a coletar dados de analytics em tempo real"
                          action={{
                            label: 'Criar Primeiro Site',
                            onClick: () => {
                              setActiveSection('sites')
                              setIsCreatingSite(true)
                            },
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        {/* Installation snippet */}
                        <Card className="bg-card border border-border/40 shadow-sm">
                          <CardHeader className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                              <div className="space-y-1 sm:space-y-2">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Code className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                  </div>
                                  <CardTitle className="text-base sm:text-lg md:text-xl font-semibold">
                                    Script de Rastreamento
                                  </CardTitle>
                                </div>
                                <CardDescription className="text-xs sm:text-sm md:text-base">
                                  Copie e cole este código no{' '}
                                  <code className="bg-muted px-1.5 py-0.5 rounded font-mono">
                                    {'<head>'}
                                  </code>{' '}
                                  do seu site
                                </CardDescription>
                              </div>
                              <Badge className="font-semibold px-3 py-1 text-xs sm:text-sm">
                                {firstSite.name}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 sm:p-6 space-y-4">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="relative group">
                                    <pre className="p-4 sm:p-6 bg-muted border border-border/40 rounded-xl text-xs sm:text-sm overflow-auto font-mono transition-all duration-200 ease-out">
                                      {`<script async src="${loaderUrl}"></script>`}
                                    </pre>
                                    <div className="absolute top-4 right-4">
                                      <CopySnippetButton
                                        snippet={`<script async src="${loaderUrl}"></script>`}
                                      />
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Clique para copiar o código</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </CardContent>
                        </Card>

                        {/* Installation instructions */}
                        <div className="space-y-4 sm:space-y-6">
                          <div className="text-center">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">
                              Simples como deve ser
                            </h3>
                            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                              Não precisa de desenvolvedor. Não precisa de
                              integração complexa.
                            </p>
                          </div>

                          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
                            {[
                              {
                                number: 1,
                                title: 'Cole o código',
                                description:
                                  'Adicione o script no <head> do seu site. Funciona com qualquer plataforma.',
                              },
                              {
                                number: 2,
                                title: 'Aguarde',
                                description:
                                  'Os dados começam a chegar automaticamente. Nenhuma configuração adicional necessária.',
                              },
                              {
                                number: 3,
                                title: 'Analise',
                                description:
                                  'Veja insights claros e tome decisões que aumentam suas vendas.',
                              },
                            ].map((step) => (
                              <Card
                                key={step.number}
                                className="bg-card border border-border/40 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ease-out text-center"
                              >
                                <CardContent className="p-4 sm:p-6 pt-6 space-y-3 sm:space-y-4">
                                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary text-primary-foreground rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto text-2xl sm:text-3xl font-bold">
                                    {step.number}
                                  </div>
                                  <div>
                                    <h4 className="text-sm sm:text-base md:text-lg font-semibold mb-2">
                                      {step.title}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                      {step.description}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>

                        {/* Methods */}
                        <Card className="bg-card border border-border/40 shadow-sm">
                          <CardHeader className="p-4 sm:p-6">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-base sm:text-lg md:text-xl font-semibold">
                                  Métodos de Instalação
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm md:text-base mt-1">
                                  Escolha o método que melhor se adequa ao seu
                                  site
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 sm:p-6">
                            <div className="space-y-4 sm:space-y-6">
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
                                    1
                                  </div>
                                  <h4 className="text-base sm:text-lg font-semibold">
                                    Instalação Direta no HTML
                                  </h4>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground pl-11">
                                  Cole o código acima dentro da tag{' '}
                                  <code className="bg-muted px-1.5 py-0.5 rounded font-mono">
                                    {'<head>'}
                                  </code>{' '}
                                  do seu site, preferencialmente logo após a
                                  abertura da tag.
                                </p>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
                                    2
                                  </div>
                                  <h4 className="text-base sm:text-lg font-semibold">
                                    Via Google Tag Manager
                                  </h4>
                                </div>
                                <div className="pl-11 space-y-2">
                                  <p className="text-xs sm:text-sm text-muted-foreground">
                                    Se você usa GTM, siga estes passos:
                                  </p>
                                  <ol className="text-xs sm:text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                                    <li>Acesse seu container no Google Tag Manager</li>
                                    <li>
                                      Crie uma nova tag do tipo &quot;HTML
                                      Personalizado&quot;
                                    </li>
                                    <li>Cole o código do script no campo HTML</li>
                                    <li>
                                      Configure o acionador para &quot;All
                                      Pages&quot;
                                    </li>
                                    <li>Salve e publique o container</li>
                                  </ol>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
