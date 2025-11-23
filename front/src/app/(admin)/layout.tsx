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
                <span className="text-md font-bold">Insight House</span>
              </Link>
            </SidebarMenuButton>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {/* Dashboard Principal */}
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <span className="text-xs">Dashboard</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Visão Geral">
                    <Link href="/admin/insights">
                      <LayoutGrid /> <span>Visão Geral</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {/* Insights Categorizados */}
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <span className="text-xs">Análises</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Buscas">
                    <Link href="/admin/insights/search">
                      <Search className="w-4 h-4" />
                      <span>Buscas</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Imóveis">
                    <Link href="/admin/insights/properties">
                      <Building2 className="w-4 h-4" />
                      <span>Imóveis</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Conversões">
                    <Link href="/admin/insights/conversion">
                      <Target className="w-4 h-4" />
                      <span>Conversões</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {/* Gerenciamento */}
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <span className="text-xs">Gerenciamento</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Gerenciar Sites">
                    <Link href="/admin/sites">
                      <Building2 className="w-4 h-4" />
                      <span>Gerenciar Sites</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Configurações">
                    <Link href="/admin/install">
                      <Settings className="w-4 h-4" />
                      <span>Configurações</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Minha Conta">
                    <Link href="/admin/account">
                      <User className="w-4 h-4" />
                      <span>Minha Conta</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
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
                      <span className="text-xs font-medium leading-tight">
                        {isLoading ? 'Carregando...' : user?.name || 'Usuário'}
                      </span>
                      <span className="text-[10px] text-sidebar-foreground/70 leading-tight">
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
        <div className="sticky top-0 z-50 flex h-12 items-center justify-between border-b px-4 bg-sidebar">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            {sites && sites.length > 1 && (
              <SiteSelector
                value={selectedSiteKey}
                onValueChange={setSelectedSiteKey}
                className="min-w-[250px] max-w-[350px]"
              />
            )}
          </div>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {siteUrl ? (
                    <a
                      href={siteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
                    >
                      <Globe className="h-4 w-4" />
                      <span className="sr-only">Visitar meu site</span>
                    </a>
                  ) : (
                    <button
                      disabled
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
                    >
                      <Globe className="h-4 w-4" />
                      <span className="sr-only">Visitar meu site</span>
                    </button>
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {siteUrl ? 'Visitar meu site' : 'Nenhum site selecionado'}
                  </p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Landing page</span>
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Landing page</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9">
                    <HelpCircle className="h-4 w-4" />
                    <span className="sr-only">Ajuda</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ajuda</p>
                </TooltipContent>
              </Tooltip>

              <ThemeToggle />
            </TooltipProvider>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6 bg-sidebar">{children}</div>
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
