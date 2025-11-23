'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Button } from '@ui/button'
import { Spinner } from '@ui/spinner'
import { useSiteContext } from '@/lib/providers/SiteProvider'
import {
  useSearchSummary,
  useFiltersUsage,
  useTopConvertingFilters,
  useDevicesTimeSeries,
} from '@/lib/hooks/useInsights'
import {
  TrendingUp,
  MapPin,
  Home,
  Target,
  Filter,
  DollarSign,
  Maximize2,
  MoreHorizontal,
  ArrowLeft,
  Smartphone,
} from 'lucide-react'
import { TopFinalidadesChart } from './_components/TopFinalidadesChart'
import { TopCidadesChart } from './_components/TopCidadesChart'
import { TopBairrosChart } from './_components/TopBairrosChart'
import { DevicesChart } from './_components/DevicesChart'
import { TopConvertingFiltersTable } from './_components/TopConvertingFiltersTable'
import {
  DetailsModal,
  type DetailsDataItem,
} from '@/lib/components/insights/DetailsModal'
import { PeriodSelector } from '@/lib/components/insights/PeriodSelector'
import Link from 'next/link'
import type { InsightsQuery } from '@/lib/types/insights'
import { formatDateToISO } from 'src/utils/utils'

export default function SearchAnalyticsPage() {
  const { selectedSiteKey } = useSiteContext()
  const [dateQuery, setDateQuery] = useState<InsightsQuery>(() => {
    // Initialize with default 30 days period
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    const start = new Date()
    start.setDate(start.getDate() - 30)
    start.setHours(0, 0, 0, 0)
    return {
      dateFilter: 'CUSTOM',
      startDate: formatDateToISO(start),
      endDate: formatDateToISO(end),
    }
  })

  const handlePeriodChange = (start: Date, end: Date) => {
    setDateQuery({
      dateFilter: 'CUSTOM',
      startDate: formatDateToISO(start),
      endDate: formatDateToISO(end),
    })
  }

  const { data: searchData, isLoading: searchLoading } = useSearchSummary(
    selectedSiteKey || '',
    dateQuery
  )
  const { data: filtersData, isLoading: filtersLoading } = useFiltersUsage(
    selectedSiteKey || '',
    dateQuery
  )
  const {
    data: topConvertingFiltersData,
    isLoading: topConvertingFiltersLoading,
  } = useTopConvertingFilters(selectedSiteKey || '', dateQuery)
  const { data: devicesData, isLoading: devicesLoading } = useDevicesTimeSeries(
    selectedSiteKey || '',
    dateQuery
  )

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalData, setModalData] = useState<{
    title: string
    description?: string
    data: DetailsDataItem[]
    visualization?: 'table' | 'list' | 'chart-bars'
    recommendations?: string[]
  }>({
    title: '',
    data: [],
  })

  const openDetailsModal = (
    title: string,
    data: DetailsDataItem[],
    description?: string,
    recommendations?: string[],
    visualization: 'table' | 'list' | 'chart-bars' = 'chart-bars'
  ) => {
    setModalData({ title, description, data, visualization, recommendations })
    setModalOpen(true)
  }

  if (!selectedSiteKey) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">
          Por favor, selecione um site para visualizar as análises
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/admin/insights">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Visão Geral
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Análise de Buscas
          </h1>
          <p className="text-muted-foreground text-lg">
            Entenda o que seus clientes procuram e otimize seu inventário
          </p>
        </div>
        <PeriodSelector onPeriodChange={handlePeriodChange} />
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-layer-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Buscas
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {searchLoading ? (
              <div className="flex items-center justify-center h-20">
                <Spinner className="h-6 w-6" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {searchData?.totalSearches.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Pesquisas realizadas
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-layer-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Filtros por Busca
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {searchLoading ? (
              <div className="flex items-center justify-center h-20">
                <Spinner className="h-6 w-6" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {searchData?.avgFiltersUsed.toFixed(1) || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Média de filtros utilizados
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-layer-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Mudanças
            </CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {filtersLoading ? (
              <div className="flex items-center justify-center h-20">
                <Spinner className="h-6 w-6" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {filtersData?.totalFilterChanges.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Mudanças de filtro
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-layer-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Filtros que Convertem
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {topConvertingFiltersLoading ? (
              <div className="flex items-center justify-center h-20">
                <Spinner className="h-6 w-6" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {topConvertingFiltersData?.filters?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Combinações identificadas
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section: Location Analysis */}
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-inner-5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Cidades Mais Buscadas</CardTitle>
                <CardDescription>
                  Top 5 cidades com mais pesquisas
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const cities = searchData?.topCidades || []
                  openDetailsModal(
                    'Todas as Cidades',
                    cities.map((c) => ({
                      label: c.cidade,
                      value: c.count,
                      percentage:
                        (c.count / (searchData?.totalSearches || 1)) * 100,
                    })),
                    'Ranking completo de todas as cidades buscadas',
                    [
                      `${cities[0]?.cidade || 'A cidade mais buscada'} representa ${(((cities[0]?.count || 0) / (searchData?.totalSearches || 1)) * 100).toFixed(1)}% de todas as buscas`,
                      'Considere aumentar o inventário nesta região',
                      'Crie campanhas segmentadas para as top 3 cidades',
                    ]
                  )
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {searchLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : (
                <TopCidadesChart data={searchData} />
              )}
            </CardContent>
          </Card>

          <Card className="shadow-inner-5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Bairros Mais Buscados</CardTitle>
                <CardDescription>
                  Top 5 bairros com mais interesse
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const bairros = searchData?.topBairros || []
                  openDetailsModal(
                    'Todos os Bairros',
                    bairros.map((b) => ({
                      label: b.bairro,
                      value: b.count,
                      percentage:
                        (b.count / (searchData?.totalSearches || 1)) * 100,
                    })),
                    'Ranking completo de todos os bairros buscados',
                    [
                      'Bairros específicos indicam público mais segmentado',
                      'Use estes dados para destacar imóveis nestas regiões',
                    ]
                  )
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <TopBairrosChart data={searchData} isLoading={searchLoading} />
            </CardContent>
          </Card>

          <Card className="shadow-inner-5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Finalidades Mais Buscadas</CardTitle>
                  <CardDescription>
                    Distribuição entre venda e aluguel
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const finalidades = searchData?.topFinalidades || []
                  openDetailsModal(
                    'Finalidades Detalhadas',
                    finalidades.map((f) => ({
                      label: f.finalidade,
                      value: f.count,
                      percentage:
                        (f.count / (searchData?.totalSearches || 1)) * 100,
                    })),
                    'Análise completa de todas as finalidades de busca',
                    [
                      `A finalidade predominante é ${finalidades[0]?.finalidade || 'N/A'}`,
                      'Ajuste seu inventário para atender esta demanda',
                      'Considere criar landing pages específicas por finalidade',
                    ]
                  )
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {searchLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : (
                <TopFinalidadesChart data={searchData} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section: Devices */}
      <DevicesChart data={devicesData} isLoading={devicesLoading} />

      {/* Section: Property Features */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Home className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">Características de Imóveis</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Quartos */}
          <Card className="shadow-layer-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quartos</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const quartos = searchData?.topQuartos || []
                  openDetailsModal(
                    'Quartos Mais Buscados',
                    quartos.map((q) => ({
                      label: `${q.quartos} quartos`,
                      value: q.count,
                      percentage:
                        (q.count / (searchData?.totalSearches || 1)) * 100,
                    })),
                    'Distribuição de buscas por número de quartos',
                    [
                      'Priorize imóveis com o número de quartos mais buscado',
                      'Destaque esta característica em anúncios',
                    ]
                  )
                }}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent>
              {searchLoading ? (
                <Spinner className="h-6 w-6" />
              ) : searchData?.topQuartos && searchData.topQuartos.length > 0 ? (
                <div className="text-2xl font-bold">
                  {searchData.topQuartos[0].quartos}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sem dados</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Mais buscado</p>
            </CardContent>
          </Card>

          {/* Suites */}
          <Card className="shadow-layer-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suítes</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const suites = searchData?.topSuites || []
                  openDetailsModal(
                    'Suítes Mais Buscadas',
                    suites.map((s) => ({
                      label: `${s.suites} suítes`,
                      value: s.count,
                      percentage:
                        (s.count / (searchData?.totalSearches || 1)) * 100,
                    })),
                    'Distribuição de buscas por número de suítes'
                  )
                }}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent>
              {searchLoading ? (
                <Spinner className="h-6 w-6" />
              ) : searchData?.topSuites && searchData.topSuites.length > 0 ? (
                <div className="text-2xl font-bold">
                  {searchData.topSuites[0].suites}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sem dados</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Mais buscado</p>
            </CardContent>
          </Card>

          {/* Banheiros */}
          <Card className="shadow-layer-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Banheiros</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const banheiros = searchData?.topBanheiros || []
                  openDetailsModal(
                    'Banheiros Mais Buscados',
                    banheiros.map((b) => ({
                      label: `${b.banheiros} banheiros`,
                      value: b.count,
                      percentage:
                        (b.count / (searchData?.totalSearches || 1)) * 100,
                    })),
                    'Distribuição de buscas por número de banheiros'
                  )
                }}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent>
              {searchLoading ? (
                <Spinner className="h-6 w-6" />
              ) : searchData?.topBanheiros &&
                searchData.topBanheiros.length > 0 ? (
                <div className="text-2xl font-bold">
                  {searchData.topBanheiros[0].banheiros}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sem dados</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Mais buscado</p>
            </CardContent>
          </Card>

          {/* Vagas */}
          <Card className="shadow-layer-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vagas</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const vagas = searchData?.topVagas || []
                  openDetailsModal(
                    'Vagas Mais Buscadas',
                    vagas.map((v) => ({
                      label: `${v.vagas} vagas`,
                      value: v.count,
                      percentage:
                        (v.count / (searchData?.totalSearches || 1)) * 100,
                    })),
                    'Distribuição de buscas por número de vagas'
                  )
                }}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent>
              {searchLoading ? (
                <Spinner className="h-6 w-6" />
              ) : searchData?.topVagas && searchData.topVagas.length > 0 ? (
                <div className="text-2xl font-bold">
                  {searchData.topVagas[0].vagas}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sem dados</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Mais buscado</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section: Price & Area Ranges */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">Faixas de Preço e Área</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="shadow-layer-5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Faixas de Preço</CardTitle>
                <CardDescription>
                  Distribuição de buscas por faixa de preço
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const prices = [
                    ...(searchData?.priceRanges?.venda || []),
                    ...(searchData?.priceRanges?.aluguel || []),
                  ]
                  openDetailsModal(
                    'Faixas de Preço Detalhadas',
                    prices.map((p) => ({
                      label: p.range,
                      value: p.count,
                      percentage:
                        (p.count / (searchData?.totalSearches || 1)) * 100,
                    })),
                    'Análise completa das faixas de preço mais buscadas',
                    [
                      'A faixa de preço mais popular indica o poder aquisitivo do seu público',
                      'Ajuste seu inventário para atender esta demanda',
                    ]
                  )
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {searchLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : searchData?.priceRanges?.venda &&
                searchData.priceRanges.venda.length > 0 ? (
                <div className="space-y-2">
                  {searchData.priceRanges.venda
                    .slice(0, 8)
                    .map((range, index) => {
                      const maxCount =
                        searchData.priceRanges.venda[0]?.count || 1
                      const widthPercent = (range.count / maxCount) * 100
                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{range.range}</span>
                            <span className="text-muted-foreground">
                              {range.count.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-500"
                              style={{ width: `${widthPercent}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum dado disponível
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-layer-5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Faixas de Área</CardTitle>
                <CardDescription>
                  Distribuição de buscas por área em m²
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const areas = searchData?.areaRanges || []
                  openDetailsModal(
                    'Faixas de Área Detalhadas',
                    areas.map((a) => ({
                      label: a.range,
                      value: a.count,
                      percentage:
                        (a.count / (searchData?.totalSearches || 1)) * 100,
                    })),
                    'Análise completa das faixas de área mais buscadas'
                  )
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {searchLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : searchData?.areaRanges && searchData.areaRanges.length > 0 ? (
                <div className="space-y-2">
                  {searchData.areaRanges.slice(0, 8).map((range, index) => {
                    const maxCount = searchData.areaRanges[0]?.count || 1
                    const widthPercent = (range.count / maxCount) * 100
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{range.range}</span>
                          <span className="text-muted-foreground">
                            {range.count.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum dado disponível
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section: Top Converting Filters */}
      <Card className="shadow-inner-5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Filtros que Mais Convertem</CardTitle>
              <CardDescription>
                Combinações de filtros com maior taxa de conversão
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {topConvertingFiltersLoading ? (
            <div className="flex items-center justify-center h-48">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <TopConvertingFiltersTable
              data={topConvertingFiltersData}
              isLoading={topConvertingFiltersLoading}
            />
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <DetailsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={modalData.title}
        description={modalData.description}
        data={modalData.data}
        visualization={modalData.visualization}
        recommendations={modalData.recommendations}
      />
    </div>
  )
}
