'use client'

import * as React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@ui/chart'
import { Spinner } from '@ui/spinner'
import { Smartphone } from 'lucide-react'
import type { DevicesTimeSeriesResponse } from '@/lib/types/insights'

interface DevicesChartProps {
  data: DevicesTimeSeriesResponse | undefined
  isLoading?: boolean
}

const chartConfig = {
  views: {
    label: 'Acessos',
  },
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-2))',
  },
  mobile: {
    label: 'Mobile',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

export function DevicesChart({ data, isLoading }: DevicesChartProps) {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>('desktop')

  const total = React.useMemo(() => {
    if (!data?.data) return { desktop: 0, mobile: 0 }
    return {
      desktop: data.data.reduce((acc, curr) => acc + curr.desktop, 0),
      mobile: data.data.reduce((acc, curr) => acc + curr.mobile, 0),
    }
  }, [data])

  if (isLoading) {
    return (
      <Card className="bg-card border border-border/40 shadow-sm">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-sm sm:text-base">Dispositivos</CardTitle>
          <CardDescription className="text-xs">
            Acessos por tipo de dispositivo ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="flex h-[140px] sm:h-[160px] items-center justify-center">
            <Spinner className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || !data.data.length) {
    return (
      <Card className="bg-card border border-border/40 shadow-sm">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-sm sm:text-base">Dispositivos</CardTitle>
          <CardDescription className="text-xs">
            Acessos por tipo de dispositivo ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col items-center justify-center py-8 sm:py-10 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-muted flex items-center justify-center mb-3">
              <Smartphone className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground" />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Sem dados de dispositivos disponíveis para o período selecionado
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border border-border/40 shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="flex flex-col items-stretch border-b border-border/40 !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-3 py-2 sm:px-4 sm:py-3">
          <CardTitle className="text-sm sm:text-base">Dispositivos</CardTitle>
        </div>
        <div className="flex">
          {['desktop', 'mobile'].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-0.5 sm:gap-1 border-t border-border/40 px-3 py-2 text-left even:border-l sm:border-t-0 sm:border-l sm:px-4 sm:py-2.5"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[chart].label}
                </span>
                <span className="text-base leading-none font-bold sm:text-lg">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-3">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[100px] sm:h-[120px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={data.data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('pt-BR', {
                  month: 'short',
                  day: 'numeric',
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('pt-BR', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
