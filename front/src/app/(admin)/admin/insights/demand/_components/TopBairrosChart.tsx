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
      <div className="flex h-[200px] sm:h-[220px] items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  if (!data || !data.topBairros.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-10 text-center">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-muted flex items-center justify-center mb-3">
          <MapPin className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground" />
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
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
          dataKey="bairro"
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
        <Bar
          dataKey="count"
          layout="vertical"
          fill="var(--color-count)"
          radius={4}
        >
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
