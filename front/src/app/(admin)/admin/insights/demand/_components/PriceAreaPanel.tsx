'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card'
import { Spinner } from '@ui/spinner'
import { DollarSign, Ruler, TrendingUp } from 'lucide-react'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@ui/chart'
import type { SearchAnalyticsResponse } from '@/lib/types/insights'

interface PriceAreaPanelProps {
  data: SearchAnalyticsResponse | undefined
  isLoading: boolean
  openDetailsModal?: any
}

const RangeChart = ({
  data,
  color
}: {
  data: any[],
  color: string
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
        Sem dados
      </div>
    )
  }

  const chartData = data.slice(0, 8).map(item => ({
    range: item.range,
    count: item.count,
  }))

  const config = {
    count: {
      label: 'Buscas',
      color: color,
    },
  } satisfies ChartConfig

  return (
    <ChartContainer config={config} className="h-[250px] w-full">
      <BarChart
        accessibilityLayer
        data={chartData}
        layout="vertical"
        margin={{ left: 0, right: 35, top: 0, bottom: 0 }}
        barSize={20}
        barGap={4}
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" strokeOpacity={0.3} />
        <YAxis
          dataKey="range"
          type="category"
          tickLine={false}
          tickMargin={8}
          axisLine={false}
          width={100}
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
        />
        <XAxis type="number" hide />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="count" layout="vertical" fill={color} radius={4}>
          <LabelList
            dataKey="count"
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

export function PriceAreaPanel({ data, isLoading, openDetailsModal }: PriceAreaPanelProps) {
  if (isLoading) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Faixas de Preço e Área</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const prices = [
    ...(data?.priceRanges?.venda || []),
    ...(data?.priceRanges?.aluguel || []),
  ].sort((a, b) => b.count - a.count)

  return (
    <Card className="border-2 hover:border-primary/50 transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Faixas de Preço e Área</CardTitle>
            <CardDescription>
              Poder de compra e preferências de tamanho dos seus visitantes
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-8 md:grid-cols-2">
          {/* Faixas de Preço */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-green-500/10">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="font-semibold text-sm">Faixas de Preço</h3>
              </div>
            </div>
            <RangeChart
              data={prices}
              color="hsl(var(--chart-2))"
            />
          </div>

          {/* Faixas de Área */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-blue-500/10">
                  <Ruler className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="font-semibold text-sm">Faixas de Área</h3>
              </div>
            </div>
            <RangeChart
              data={data?.areaRanges || []}
              color="hsl(var(--chart-1))"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
