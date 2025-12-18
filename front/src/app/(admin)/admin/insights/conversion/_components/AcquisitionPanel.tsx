'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Spinner } from '@ui/spinner'
import { Target, Globe, ArrowRight } from 'lucide-react'
import type {
  ConversionRateResponse,
  ConversionSourcesResponse,
} from '@/lib/types/insights'
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@ui/chart'

interface AcquisitionPanelProps {
  summaryData: ConversionRateResponse | undefined
  sourcesData: ConversionSourcesResponse | undefined
  isLoading: boolean
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

export function AcquisitionPanel({
  summaryData,
  sourcesData,
  isLoading,
}: AcquisitionPanelProps) {
  if (isLoading) {
    return (
      <Card className="h-full min-h-[400px] flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </Card>
    )
  }

  const sourcesChartData =
    sourcesData?.sources.map((s) => ({
      name: s.source,
      value: s.conversions,
      percentage: s.percentage,
    })) || []

  const typesChartData =
    summaryData?.conversionsByType.map((t) => ({
      name: t.type,
      value: t.count,
      percentage: t.percentage,
    })) || []

  const sourcesConfig = {
    value: {
      label: 'Conversões',
      color: 'hsl(var(--primary))',
    },
  }

  const typesConfig = {
    value: {
      label: 'Conversões',
    },
  }

  return (
    <div className="grid lg:grid-cols-2 gap-3 sm:gap-4 h-full">
      {/* Sources Panel */}
      <Card className="bg-card border border-border/40 shadow-sm flex flex-col">
        <CardHeader className="p-3 sm:p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm sm:text-base">
                Origem do Tráfego
              </CardTitle>
            </div>
          </div>
          <CardDescription className="text-xs">
            Canais que geraram conversões
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-[250px] sm:min-h-[280px] p-3 sm:p-4 pt-0">
          {sourcesChartData.length > 0 ? (
            <ChartContainer config={sourcesConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sourcesChartData}
                  layout="vertical"
                  margin={{ left: 0, right: 40, top: 10, bottom: 10 }}
                  barSize={32}
                >
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    width={100}
                    className="text-xs font-medium"
                  />
                  <XAxis type="number" hide />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="value" radius={4} fill="var(--color-value)">
                    <LabelList
                      dataKey="value"
                      position="right"
                      className="fill-foreground font-medium"
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              Sem dados de origem
            </div>
          )}
        </CardContent>
      </Card>

      {/* Types Panel */}
      <Card className="shadow-sm border-border/60 flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Tipos de Conversão</CardTitle>
            </div>
          </div>
          <CardDescription>Ações realizadas pelos leads</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-[300px] flex items-center justify-center">
          {typesChartData.length > 0 ? (
            <div className="w-full h-full flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <ChartContainer
                config={typesConfig}
                className="aspect-square h-full max-h-[180px] sm:max-h-[200px] mx-auto"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={typesChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    strokeWidth={5}
                  >
                    {typesChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>

              {/* Custom Legend */}
              <div className="flex flex-col gap-3 justify-center min-w-[140px]">
                {typesChartData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-medium leading-none">
                        {entry.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {entry.value} ({entry.percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              Sem dados de conversão
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
