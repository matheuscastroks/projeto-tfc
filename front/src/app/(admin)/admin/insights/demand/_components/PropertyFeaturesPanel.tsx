'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card'
import { Spinner } from '@ui/spinner'
import { Home, Bed, Bath, Car, ShowerHead } from 'lucide-react'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, LabelList, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@ui/chart'
import type { SearchAnalyticsResponse } from '@/lib/types/insights'

interface PropertyFeaturesPanelProps {
  data: SearchAnalyticsResponse | undefined
  isLoading: boolean
  openDetailsModal?: any // Using any for now to avoid circular dependency or complex type import
}

const FeatureChart = ({
  data,
  dataKey,
  labelKey,
  color,
  label
}: {
  data: any[],
  dataKey: string,
  labelKey: string,
  color: string,
  label: string
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[120px] flex items-center justify-center text-sm text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
        Sem dados
      </div>
    )
  }

  const chartData = data.slice(0, 4).map(item => ({
    label: `${item[dataKey]} ${label}`,
    value: item.count,
    originalLabel: item[dataKey]
  }))

  const config = {
    value: {
      label: 'Buscas',
      color: color,
    },
  } satisfies ChartConfig

  return (
    <ChartContainer config={config} className="h-[120px] w-full">
      <BarChart
        accessibilityLayer
        data={chartData}
        layout="vertical"
        margin={{ left: 0, right: 35, top: 0, bottom: 0 }}
        barSize={18}
        barGap={2}
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" strokeOpacity={0.3} />
        <YAxis
          dataKey="originalLabel"
          type="category"
          tickLine={false}
          tickMargin={8}
          axisLine={false}
          width={20}
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
        />
        <XAxis type="number" hide />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="value" layout="vertical" fill={color} radius={4}>
          <LabelList
            dataKey="value"
            position="right"
            offset={8}
            className="fill-foreground font-medium"
            fontSize={11}
            formatter={(value: number) => value.toLocaleString()}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

export function PropertyFeaturesPanel({ data, isLoading, openDetailsModal }: PropertyFeaturesPanelProps) {
  if (isLoading) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Características de Imóveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 hover:border-primary/50 transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Home className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Características de Imóveis</CardTitle>
            <CardDescription>
              Perfil dos imóveis mais procurados pelos seus visitantes
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Quartos */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Bed className="h-4 w-4" />
              <span>Quartos</span>
            </div>
            <FeatureChart
              data={data?.topQuartos || []}
              dataKey="quartos"
              labelKey="quartos"
              color="hsl(var(--chart-1))"
              label=""
            />
          </div>

          {/* Suítes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ShowerHead className="h-4 w-4" />
              <span>Suítes</span>
            </div>
            <FeatureChart
              data={data?.topSuites || []}
              dataKey="suites"
              labelKey="suites"
              color="hsl(var(--chart-2))"
              label=""
            />
          </div>

          {/* Banheiros */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Bath className="h-4 w-4" />
              <span>Banheiros</span>
            </div>
            <FeatureChart
              data={data?.topBanheiros || []}
              dataKey="banheiros"
              labelKey="banheiros"
              color="hsl(var(--chart-3))"
              label=""
            />
          </div>

          {/* Vagas */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Car className="h-4 w-4" />
              <span>Vagas</span>
            </div>
            <FeatureChart
              data={data?.topVagas || []}
              dataKey="vagas"
              labelKey="vagas"
              color="hsl(var(--chart-4))"
              label=""
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
