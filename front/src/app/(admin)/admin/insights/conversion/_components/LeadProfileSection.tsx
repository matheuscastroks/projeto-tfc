'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Spinner } from '@ui/spinner'
import { TrendingUp, DollarSign, MapPin, Home, Tag } from 'lucide-react'
import type { LeadProfileResponse } from '@/lib/types/insights'
import { Bar, BarChart, LabelList, Pie, PieChart, XAxis, YAxis, Legend } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@ui/chart'

interface LeadProfileSectionProps {
  data: LeadProfileResponse | undefined
  isLoading: boolean
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

export function LeadProfileSection({
  data,
  isLoading,
}: LeadProfileSectionProps) {
  // Helper to generate chart config
  const generateConfig = (label: string): ChartConfig => ({
    count: {
      label: label,
    },
  })

  // Prepare data for charts
  const interestsData =
    data?.topInterests.map((i) => ({
      name: i.interest,
      count: i.count,
      fill: 'hsl(var(--chart-1))',
    })) || []

  const categoriesData =
    data?.topCategories.map((c, index) => ({
      name: c.category,
      count: c.count,
      fill: COLORS[index % COLORS.length],
    })) || []

  const typesData =
    data?.topPropertyTypes.map((t) => ({
      name: t.type,
      count: t.count,
      fill: 'hsl(var(--chart-2))',
    })) || []

  const citiesData =
    data?.topCities.map((c, index) => ({
      name: c.city,
      count: c.count,
      fill: COLORS[index % COLORS.length],
    })) || []

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Average Values Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2 hover:border-primary/50 transition-all duration-200 bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ticket Médio (Venda)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.averageSaleValue
                ? formatCurrency(data.averageSaleValue)
                : 'R$ 0,00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Média de valor dos imóveis convertidos em venda
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-all duration-200 bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ticket Médio (Aluguel)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.averageRentalValue
                ? formatCurrency(data.averageRentalValue)
                : 'R$ 0,00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Média de valor dos imóveis convertidos em aluguel
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Interests Chart (Bar) */}
        <Card className="border-2 hover:border-primary/50 transition-all duration-200 flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Principais Interesses</CardTitle>
            </div>
            <CardDescription>
              Finalidades mais buscadas pelos leads
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-2">
            {interestsData.length > 0 ? (
              <ChartContainer
                config={generateConfig('Interesses')}
                className="min-h-[200px] w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={interestsData}
                  layout="vertical"
                  margin={{ left: 0, right: 30 }}
                >
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    width={100}
                    className="text-xs font-medium"
                  />
                  <XAxis dataKey="count" type="number" hide />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar
                    dataKey="count"
                    layout="vertical"
                    radius={4}
                    barSize={32}
                  >
                    <LabelList
                      dataKey="count"
                      position="right"
                      className="fill-foreground font-medium"
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                Sem dados disponíveis
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categories Chart (Donut) */}
        <Card className="border-2 hover:border-primary/50 transition-all duration-200 flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              <CardTitle>Categorias</CardTitle>
            </div>
            <CardDescription>Distribuição por categoria</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            {categoriesData.length > 0 ? (
              <ChartContainer
                config={generateConfig('Categorias')}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={categoriesData}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={60}
                    strokeWidth={5}
                    label
                  />
                  <Legend />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                Sem dados disponíveis
              </div>
            )}
          </CardContent>
        </Card>

        {/* Property Types Chart (Bar) */}
        <Card className="border-2 hover:border-primary/50 transition-all duration-200 flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              <CardTitle>Tipos de Imóvel</CardTitle>
            </div>
            <CardDescription>Tipos mais convertidos</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-2">
            {typesData.length > 0 ? (
              <ChartContainer
                config={generateConfig('Tipos')}
                className="min-h-[200px] w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={typesData}
                  layout="vertical"
                  margin={{ left: 0, right: 30 }}
                >
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    width={100}
                    className="text-xs font-medium"
                  />
                  <XAxis dataKey="count" type="number" hide />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar
                    dataKey="count"
                    layout="vertical"
                    radius={4}
                    barSize={32}
                  >
                    <LabelList
                      dataKey="count"
                      position="right"
                      className="fill-foreground font-medium"
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                Sem dados disponíveis
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cities Chart (Donut) */}
        <Card className="border-2 hover:border-primary/50 transition-all duration-200 flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle>Cidades</CardTitle>
            </div>
            <CardDescription>Localidades com mais leads</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            {citiesData.length > 0 ? (
              <ChartContainer
                config={generateConfig('Cidades')}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={citiesData}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={60}
                    strokeWidth={5}
                    label
                  />
                  <Legend />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                Sem dados disponíveis
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
