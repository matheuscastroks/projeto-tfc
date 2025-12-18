'use client'

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
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
  views: {
    label: 'Visualizações',
    color: 'hsl(var(--primary))',
  },
  leads: {
    label: 'Leads',
    color: '#10b981', // Emerald 500
  },
}

export function PopularPropertiesChart({
  data,
  isLoading,
}: PopularPropertiesChartProps) {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  if (!data || !data.properties.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-10 text-center h-full">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-muted flex items-center justify-center mb-3">
          <Building2 className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground" />
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Nenhum imóvel visualizado no período selecionado
        </p>
      </div>
    )
  }

  const chartData = data.properties.slice(0, 5).map((item) => ({
    codigo: item.codigo,
    views: item.views,
    leads: item.leads,
    favorites: item.favorites,
  }))

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          layout="vertical"
          margin={{ left: 0, right: 25, top: 5, bottom: 5 }}
          barGap={2}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            strokeOpacity={0.3}
          />
          <XAxis type="number" hide />
          <YAxis
            dataKey="codigo"
            type="category"
            tickLine={false}
            tickMargin={8}
            axisLine={false}
            width={50}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
          <Bar
            dataKey="views"
            name="Visualizações"
            fill="var(--color-views)"
            radius={[0, 4, 4, 0]}
            barSize={16}
          />
          <Bar
            dataKey="leads"
            name="Leads"
            fill="var(--color-leads)"
            radius={[0, 4, 4, 0]}
            barSize={16}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
