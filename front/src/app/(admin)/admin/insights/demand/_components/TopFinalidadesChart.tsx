'use client'

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, LabelList, Cell } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@ui/chart'
import { Spinner } from '@ui/spinner'
import { Target } from 'lucide-react'
import type { SearchAnalyticsResponse } from '@/lib/types/insights'

interface TopFinalidadesChartProps {
  data: SearchAnalyticsResponse | undefined
  isLoading?: boolean
}

const chartConfig = {
  count: {
    label: 'Buscas',
  },
  venda: {
    label: 'Venda',
    color: 'hsl(var(--chart-1))',
  },
  aluguel: {
    label: 'Aluguel',
    color: 'hsl(var(--chart-2))',
  },
  lancamento: {
    label: 'Lançamento',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig

export function TopFinalidadesChart({
  data,
  isLoading,
}: TopFinalidadesChartProps) {
  if (isLoading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!data || !data.topFinalidades.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Target className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          Nenhuma finalidade buscada no período selecionado
        </p>
      </div>
    )
  }

  // Normalize finalidade names to match chartConfig keys
  const normalizeFinalidade = (finalidade: string): string => {
    const normalized = finalidade.toLowerCase().trim()
    if (normalized.includes('venda')) return 'venda'
    if (normalized.includes('aluguel')) return 'aluguel'
    if (
      normalized.includes('lançamento') ||
      normalized.includes('lancamento')
    ) {
      return 'lancamento'
    }
    // Fallback to first available color if unknown
    return 'venda'
  }

  // Map finalidades to chart data
  const chartData = data.topFinalidades.map((item) => {
    const normalized = normalizeFinalidade(item.finalidade)
    return {
      finalidade: normalized,
      label: item.finalidade, // Keep original label for display
      count: item.count,
      fill: (chartConfig[normalized as keyof typeof chartConfig] as { color?: string })?.color || 'hsl(var(--primary))',
    }
  })

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart
        accessibilityLayer
        data={chartData}
        layout="vertical"
        margin={{
          left: 0,
          right: 30, // Space for labels
        }}
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="label"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          width={100} // Fixed width for labels
          tickFormatter={(value) => value}
        />
        <XAxis dataKey="count" type="number" hide />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="count" layout="vertical" radius={4}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              offset={8}
              className="fill-foreground"
              fontSize={12}
            />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
