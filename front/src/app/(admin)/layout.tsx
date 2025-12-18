'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger,
  SidebarRail,
} from '@ui/sidebar'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@ui/tooltip'
import {
  ChevronUp,
  LayoutGrid,
  Building2,
  Settings,
  ExternalLink,
  Globe,
  HelpCircle,
  Target,
  User,
  Search,
} from 'lucide-react'
import { ThemeToggle } from '@/lib/components/ThemeToggle'
import { Spinner } from '@ui/spinner'
import { Button } from '@ui/button'
import { SiteProvider, useSiteContext } from '@/lib/providers/SiteProvider'
import { useUser, useLogout, useSites } from '@/lib/hooks'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import logo from '@/assets/logo-insighthouse-fundo-preto.png'
import favicon from '@/assets/favicon.png'
import { SiteSelector } from '@/lib/components/SiteSelector'

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useUser()
  const logoutMutation = useLogout()
  const router = useRouter()
  const { selectedSiteKey, setSelectedSiteKey } = useSiteContext()
  const { data: sites } = useSites()

  // Encontrar o site selecionado e obter o domínio
  const selectedSite = sites?.find((site) => site.siteKey === selectedSiteKey)
  const primaryDomain = selectedSite?.domains?.find((d) => d.isPrimary)
  const siteUrl = primaryDomain
    ? `https://${primaryDomain.host}`
    : selectedSite?.domains?.[0]
      ? `https://${selectedSite.domains[0].host}`
      : null

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <SidebarProvider>
      <Sidebar side="left" variant="inset" collapsible="icon">
        <SidebarHeader>
          <div className="rounded-md">
            <SidebarMenuButton asChild tooltip="Home">
              <Link href="/admin" className="flex items-center gap-2">
                <Image
                  src={favicon}
                  alt="Insighthouse"
                  width={24}
                  height={24}
                  className="w-4 h-4 flex-shrink-0 dark:invert-0 invert"
                />
                <span className="text-sm sm:text-base font-semibold">
                  InsightHouse
                </span>
              </Link>
            </SidebarMenuButton>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {/* Dashboard Principal */}
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <span className="text-xs font-medium">Dashboard</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Visão Geral">
                    <Link
                      href="/admin/insights"
                      className="transition-all duration-200"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span className="text-sm">Visão Geral</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="bg-border/50 dark:bg-border/30" />

          {/* Insights Categorizados */}
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <span className="text-xs font-medium">Análises</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Funil de Vendas">
                    <Link
                      href="/admin/insights/funnel"
                      className="transition-all duration-200"
                    >
                      <Target className="w-4 h-4" />
                      <span className="text-sm">Funil de Vendas</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Imóveis">
                    <Link
                      href="/admin/insights/properties"
                      className="transition-all duration-200"
                    >
                      <Building2 className="w-4 h-4" />
                      <span className="text-sm">Imóveis</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Demanda">
                    <Link
                      href="/admin/insights/demand"
                      className="transition-all duration-200"
                    >
                      <Search className="w-4 h-4" />
                      <span className="text-sm">Demanda</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Jornada">
                    <Link
                      href="/admin/insights/journey"
                      className="transition-all duration-200"
                    >
                      <Globe className="w-4 h-4" />
                      <span className="text-sm">Jornada</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Conversões">
                    <Link
                      href="/admin/insights/conversion"
                      className="transition-all duration-200"
                    >
                      <Target className="w-4 h-4" />
                      <span className="text-sm">Conversões</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="bg-border/50 dark:bg-border/30" />

          {/* Gerenciamento */}
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <span className="text-xs font-medium">Gerenciamento</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Gerenciar Sites">
                    <Link
                      href="/admin/sites"
                      className="transition-all duration-200"
                    >
                      <Building2 className="w-4 h-4" />
                      <span className="text-sm">Gerenciar Sites</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Configurações">
                    <Link
                      href="/admin/install"
                      className="transition-all duration-200"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-sm">Configurações</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Minha Conta">
                    <Link
                      href="/admin/account"
                      className="transition-all duration-200"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">Minha Conta</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator className="bg-border/50 dark:bg-border/30" />
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback className="text-xs">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left">
                      <span className="text-xs sm:text-sm font-medium leading-tight">
                        {isLoading ? 'Carregando...' : user?.name || 'Usuário'}
                      </span>
                      <span className="text-[10px] sm:text-xs text-sidebar-foreground/70 leading-tight">
                        {isLoading ? '...' : user?.email || 'user@example.com'}
                      </span>
                    </div>
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem>
                    <span>Pagamento</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Suporte</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending && (
                      <Spinner className="mr-2 h-4 w-4" />
                    )}
                    {logoutMutation.isPending ? 'Saindo...' : 'Sair'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="m-0 p-0">
        <div className="sticky top-0 z-50 flex h-14 sm:h-16 items-center justify-between border-b border-border/50 dark:border-border/30 px-4 sm:px-6 bg-sidebar backdrop-blur-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <SidebarTrigger />
            {sites && sites.length > 1 && (
              <SiteSelector
                value={selectedSiteKey}
                onValueChange={setSelectedSiteKey}
                className="min-w-[200px] sm:min-w-[250px] max-w-[300px] sm:max-w-[350px]"
              />
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {siteUrl ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-8 w-8 sm:h-9 sm:w-9 hover:scale-105 transition-transform"
                    >
                      <a
                        href={siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="h-4 w-4" />
                        <span className="sr-only">Visitar meu site</span>
                      </a>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled
                      className="h-8 w-8 sm:h-9 sm:w-9"
                    >
                      <Globe className="h-4 w-4" />
                      <span className="sr-only">Visitar meu site</span>
                    </Button>
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs sm:text-sm">
                    {siteUrl ? 'Visitar meu site' : 'Nenhum site selecionado'}
                  </p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-8 w-8 sm:h-9 sm:w-9 hover:scale-105 transition-transform"
                  >
                    <a href="/" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">Landing page</span>
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs sm:text-sm">Landing page</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-9 hover:scale-105 transition-transform"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span className="sr-only">Ajuda</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs sm:text-sm">Ajuda</p>
                </TooltipContent>
              </Tooltip>

              <ThemeToggle />
            </TooltipProvider>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-sidebar">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SiteProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SiteProvider>
  )
}
