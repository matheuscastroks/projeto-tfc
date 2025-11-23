'use client'

import { Pie, PieChart, Cell } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@ui/chart'
import { Spinner } from '@ui/spinner'
import type { SearchAnalyticsResponse } from '@/lib/types/insights'

interface TopBairrosChartProps {
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

// Generate chart config dynamically for neighborhoods
const generateChartConfig = (
  bairros: Array<{ bairro: string }>
): ChartConfig => {
  const config: ChartConfig = {
    count: {
      label: 'Buscas',
    },
  }

  bairros.forEach((item, index) => {
    const key = item.bairro.toLowerCase().replace(/\s+/g, '_')
    config[key] = {
      label: item.bairro,
      color: COLORS[index % COLORS.length],
    }
  })

  return config
}

export function TopBairrosChart({ data, isLoading }: TopBairrosChartProps) {
  if (isLoading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!data || !data.topBairros.length) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Sem dados disponíveis</p>
      </div>
    )
  }

  const topBairros = data.topBairros.slice(0, 5)
  const chartConfig = generateChartConfig(topBairros)

  const chartData = topBairros.map((item) => {
    const key = item.bairro.toLowerCase().replace(/\s+/g, '_')
    return {
      bairro: key,
      bairroLabel: item.bairro,
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
          nameKey="bairro"
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

