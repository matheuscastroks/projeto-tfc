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
      <div className="flex h-[200px] sm:h-[220px] items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  if (!data || !data.topFinalidades.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-10 text-center">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-muted flex items-center justify-center mb-3">
          <Target className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground" />
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
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
      fill:
        (
          chartConfig[normalized as keyof typeof chartConfig] as {
            color?: string
          }
        )?.color || 'hsl(var(--primary))',
    }
  })

  return (
    <ChartContainer
      config={chartConfig}
      className="min-h-[160px] sm:min-h-[180px] w-full"
    >
      <BarChart
        accessibilityLayer
        data={chartData}
        layout="vertical"
        margin={{
          left: 0,
          right: 25,
          top: 5,
          bottom: 5,
        }}
        barSize={16}
      >
        <CartesianGrid
          horizontal={false}
          strokeDasharray="3 3"
          strokeOpacity={0.3}
        />
        <YAxis
          dataKey="label"
          type="category"
          tickLine={false}
          tickMargin={8}
          axisLine={false}
          width={80}
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
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
            offset={6}
            className="fill-foreground font-medium"
            fontSize={11}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
