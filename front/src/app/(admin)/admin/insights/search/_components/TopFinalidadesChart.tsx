'use client'

import { PieChart, Pie, Cell } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@ui/chart'
import { Spinner } from '@ui/spinner'
import type { SearchAnalyticsResponse } from '@/lib/types/insights'

interface TopFinalidadesChartProps {
  data: SearchAnalyticsResponse | undefined
  isLoading?: boolean
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

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
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Sem dados disponíveis</p>
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
      count: item.count,
    }
  })

  return (
    <ChartContainer
      config={chartConfig}
      className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px]"
    >
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Pie
          data={chartData}
          dataKey="count"
          label
          nameKey="finalidade"
          stroke="0"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
