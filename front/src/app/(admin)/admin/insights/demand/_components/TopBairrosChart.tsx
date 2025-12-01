'use client'

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@ui/chart'
import { Spinner } from '@ui/spinner'
import { MapPin } from 'lucide-react'
import type { SearchAnalyticsResponse } from '@/lib/types/insights'

interface TopBairrosChartProps {
  data: SearchAnalyticsResponse | undefined
  isLoading?: boolean
}

const chartConfig = {
  count: {
    label: 'Buscas',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig

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
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <MapPin className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          Nenhum bairro buscado no período selecionado
        </p>
      </div>
    )
  }

  const chartData = data.topBairros.slice(0, 5).map((item) => ({
    bairro: item.bairro,
    count: item.count,
  }))

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
          dataKey="bairro"
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
        <Bar dataKey="count" layout="vertical" fill="var(--color-count)" radius={4}>
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
