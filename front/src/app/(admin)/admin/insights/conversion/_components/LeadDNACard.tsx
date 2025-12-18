'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Spinner } from '@ui/spinner'
import {
  Users,
  MapPin,
  Wallet,
  Building2,
  TrendingUp,
  Tag,
} from 'lucide-react'
import type { LeadProfileResponse } from '@/lib/types/insights'
import { Progress } from '@ui/progress'

interface LeadDNACardProps {
  data: LeadProfileResponse | undefined
  isLoading: boolean
}

export function LeadDNACard({ data, isLoading }: LeadDNACardProps) {
  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    })

  if (isLoading) {
    return (
      <Card className="bg-card border border-border/40 shadow-sm h-full min-h-[300px] flex items-center justify-center">
        <Spinner className="h-6 w-6" />
      </Card>
    )
  }

  // Calculate max values for progress bars
  const maxCityCount = data?.topCities?.[0]?.count || 1
  const maxInterestCount = data?.topInterests?.[0]?.count || 1

  return (
    <Card className="bg-card border border-border/40 shadow-sm">
      <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 sm:space-y-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm sm:text-base">
                DNA do Lead
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Perfil comportamental e demográfico do seu cliente ideal
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border/40">
          {/* Coluna 1: Financeiro & Categorias */}
          <div className="p-3 sm:p-4 space-y-4 sm:space-y-5">
            <div>
              <h4 className="flex items-center gap-1.5 sm:gap-2 font-semibold text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                <Wallet className="h-3.5 w-3.5" />
                Capacidade Financeira
              </h4>
              <div className="space-y-2 sm:space-y-3">
                <div className="p-2 sm:p-2.5 rounded-lg bg-muted/30 border border-border/40 space-y-0.5 sm:space-y-1">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Ticket Médio (Venda)
                  </span>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {data?.averageSaleValue
                      ? formatCurrency(data.averageSaleValue)
                      : 'R$ 0'}
                  </div>
                </div>
                <div className="p-2 sm:p-2.5 rounded-lg bg-muted/30 border border-border/40 space-y-0.5 sm:space-y-1">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Ticket Médio (Aluguel)
                  </span>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {data?.averageRentalValue
                      ? formatCurrency(data.averageRentalValue)
                      : 'R$ 0'}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="flex items-center gap-1.5 sm:gap-2 font-semibold text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                <Tag className="h-3.5 w-3.5" />
                Preferência de Categoria
              </h4>
              <div className="flex flex-wrap gap-2">
                {data?.topCategories.map((cat, i) => (
                  <div
                    key={cat.category}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                      i === 0
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'bg-muted text-muted-foreground border-transparent'
                    }`}
                  >
                    {cat.category}
                    <span className="ml-1.5 opacity-70">({cat.count})</span>
                  </div>
                ))}
                {!data?.topCategories.length && (
                  <span className="text-sm text-muted-foreground italic">
                    Sem dados
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Coluna 2: Localização (Heatmap List) */}
          <div className="p-3 sm:p-4">
            <h4 className="flex items-center gap-1.5 sm:gap-2 font-semibold text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              <MapPin className="h-3.5 w-3.5" />
              Top Localizações
            </h4>
            <div className="space-y-2.5 sm:space-y-3">
              {data?.topCities.slice(0, 8).map((city) => {
                const percent = (city.count / maxCityCount) * 100
                return (
                  <div key={city.city} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{city.city}</span>
                      <span className="text-muted-foreground text-xs">
                        {city.count} leads
                      </span>
                    </div>
                    <Progress value={percent} className="h-1.5" />
                  </div>
                )
              })}
              {!data?.topCities.length && (
                <div className="text-sm text-muted-foreground italic text-center py-8">
                  Nenhuma localização identificada
                </div>
              )}
            </div>
          </div>

          {/* Coluna 3: Interesses & Tipos */}
          <div className="p-6 space-y-8">
            <div>
              <h4 className="flex items-center gap-2 font-semibold text-sm text-muted-foreground mb-4">
                <TrendingUp className="h-4 w-4" />
                Interesses (Finalidade)
              </h4>
              <div className="space-y-3">
                {data?.topInterests.map((interest) => (
                  <div
                    key={interest.interest}
                    className="flex items-center justify-between text-sm group"
                  >
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                      {interest.interest}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary/60"
                          style={{
                            width: `${(interest.count / maxInterestCount) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium w-6 text-right">
                        {interest.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="flex items-center gap-1.5 sm:gap-2 font-semibold text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                <Building2 className="h-3.5 w-3.5" />
                Tipos de Imóvel
              </h4>
              <div className="space-y-1.5 sm:space-y-2">
                {data?.topPropertyTypes.slice(0, 5).map((type, i) => (
                  <div
                    key={type.type}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded bg-muted text-xs font-medium text-muted-foreground">
                      {i + 1}
                    </div>
                    <span className="flex-1 truncate">{type.type}</span>
                    <span className="text-xs text-muted-foreground">
                      {type.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
