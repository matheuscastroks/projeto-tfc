'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@ui/chart'
import { Spinner } from '@ui/spinner'
import { Building2 } from 'lucide-react'
import type { PopularPropertiesResponse } from '@/lib/types/insights'

interface PopularPropertiesChartProps {
  data: PopularPropertiesResponse | undefined
  isLoading?: boolean
}

const chartConfig = {
  engagementScore: {
    label: 'Pontuação de Engajamento',
    color: 'hsl(var(--chart-1))',
  },
}

export function PopularPropertiesChart({
  data,
  isLoading,
}: PopularPropertiesChartProps) {
  if (isLoading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!data || !data.properties.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Building2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          Nenhum imóvel visualizado no período selecionado
        </p>
      </div>
    )
  }

  const chartData = data.properties.slice(0, 5).map((item) => ({
    codigo: item.codigo,
    engagementScore: item.engagementScore,
    views: item.views,
    favorites: item.favorites,
  }))

  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="codigo" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey="engagementScore"
            fill="hsl(var(--chart-1))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
