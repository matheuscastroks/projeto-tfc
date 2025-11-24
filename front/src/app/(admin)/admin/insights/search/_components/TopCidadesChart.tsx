'use client'

import { Pie, PieChart, Cell } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@ui/chart'
import { Spinner } from '@ui/spinner'
import { MapPin } from 'lucide-react'
import type { SearchAnalyticsResponse } from '@/lib/types/insights'

interface TopCidadesChartProps {
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

// Generate chart config dynamically for up to 5 cities
const generateChartConfig = (
  cidades: Array<{ cidade: string }>
): ChartConfig => {
  const config: ChartConfig = {
    count: {
      label: 'Buscas',
    },
  }

  cidades.forEach((item, index) => {
    const key = item.cidade.toLowerCase().replace(/\s+/g, '_')
    config[key] = {
      label: item.cidade,
      color: COLORS[index % COLORS.length],
    }
  })

  return config
}

export function TopCidadesChart({ data, isLoading }: TopCidadesChartProps) {
  if (isLoading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!data || !data.topCidades.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <MapPin className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          Nenhuma cidade buscada no período selecionado
        </p>
      </div>
    )
  }

  const topCidades = data.topCidades.slice(0, 5)
  const chartConfig = generateChartConfig(topCidades)

  const chartData = topCidades.map((item) => {
    const key = item.cidade.toLowerCase().replace(/\s+/g, '_')
    return {
      cidade: key,
      cidadeLabel: item.cidade,
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
        <Pie data={chartData} dataKey="count" label nameKey="cidade" stroke="0">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
