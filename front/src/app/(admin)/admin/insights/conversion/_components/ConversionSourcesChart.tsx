'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@ui/chart'
import { Spinner } from '@ui/spinner'
import type { ConversionSourcesResponse } from '@/lib/types/insights'

interface ConversionSourcesChartProps {
  data: ConversionSourcesResponse | undefined
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
  conversions: {
    label: 'Conversões',
  },
}

export function ConversionSourcesChart({
  data,
  isLoading,
}: ConversionSourcesChartProps) {
  if (isLoading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!data || !data.sources.length) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Sem dados disponíveis</p>
      </div>
    )
  }

  const chartData = data.sources.map((item) => ({
    name: item.source,
    value: item.conversions,
    percentage: item.percentage,
  }))

  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) =>
              `${name}: ${percentage.toFixed(1)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

