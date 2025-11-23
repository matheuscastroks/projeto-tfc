'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Spinner } from '@ui/spinner'
import { BarChart3, Target, Building2, Smartphone } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@ui/chart'

interface ChartCardProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  isLoading?: boolean
  children: React.ReactNode
}

function ChartCard({
  title,
  description,
  icon: Icon,
  isLoading,
  children,
}: ChartCardProps) {
  return (
    <Card className="shadow-inner-5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="text-xs">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner className="w-4 h-4" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}

interface InsightsSummaryChartsProps {
  topCities?: Array<{ cidade: string; count: number }>
  conversionsByType?: Array<{ type: string; count: number }>
  topProperties?: Array<{
    propertyCode: string
    views: number
    favorites: number
  }>
  topDevices?: Array<{ deviceType: string; count: number }>
  isLoadingSearch?: boolean
  isLoadingConversion?: boolean
  isLoadingProperty?: boolean
  isLoadingDevices?: boolean
}

export function InsightsSummaryCharts({
  topCities,
  conversionsByType,
  topProperties,
  topDevices,
  isLoadingSearch,
  isLoadingConversion,
  isLoadingProperty,
  isLoadingDevices,
}: InsightsSummaryChartsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ChartCard
        title="Top 5 Cidades"
        description="Cidades mais buscadas"
        icon={BarChart3}
        isLoading={isLoadingSearch}
      >
        {topCities && topCities.length > 0 ? (
          (() => {
            const top5Cities = topCities.slice(0, 5)
            const chartConfig: ChartConfig = {
              count: {
                label: 'Buscas',
              },
            }

            const colors = [
              'hsl(var(--chart-1))',
              'hsl(var(--chart-2))',
              'hsl(var(--chart-3))',
              'hsl(var(--chart-4))',
              'hsl(var(--chart-5))',
            ]

            top5Cities.forEach((city, index) => {
              const key = city.cidade.toLowerCase().replace(/\s+/g, '_')
              chartConfig[key] = {
                label: city.cidade,
                color: colors[index % colors.length],
              }
            })

            const chartData = top5Cities.map((city) => {
              const key = city.cidade.toLowerCase().replace(/\s+/g, '_')
              return {
                cidade: key,
                cidadeLabel: city.cidade,
                count: city.count,
                fill: `var(--color-${key})`,
              }
            })

            return (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart
                  accessibilityLayer
                  data={chartData}
                  layout="vertical"
                  margin={{
                    left: 0,
                  }}
                >
                  <YAxis
                    dataKey="cidade"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) =>
                      chartConfig[value as keyof typeof chartConfig]?.label ||
                      value
                    }
                  />
                  <XAxis dataKey="count" type="number" hide />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="count" layout="vertical" radius={5} />
                </BarChart>
              </ChartContainer>
            )
          })()
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum dado disponível
          </p>
        )}
      </ChartCard>

      <ChartCard
        title="Conversões por Tipo"
        description="Tipos de conversão"
        icon={Target}
        isLoading={isLoadingConversion}
      >
        {conversionsByType && conversionsByType.length > 0 ? (
          (() => {
            const chartConfig: ChartConfig = {
              count: {
                label: 'Conversões',
              },
            }

            const colors = [
              'hsl(var(--chart-1))',
              'hsl(var(--chart-2))',
              'hsl(var(--chart-3))',
              'hsl(var(--chart-4))',
              'hsl(var(--chart-5))',
            ]

            conversionsByType.forEach((item, index) => {
              const key = item.type.toLowerCase().replace(/\s+/g, '_')
              chartConfig[key] = {
                label: item.type,
                color: colors[index % colors.length],
              }
            })

            const chartData = conversionsByType.map((item) => {
              const key = item.type.toLowerCase().replace(/\s+/g, '_')
              return {
                type: key,
                typeLabel: item.type,
                count: item.count,
                fill: `var(--color-${key})`,
              }
            })

            const total = chartData.reduce((sum, item) => sum + item.count, 0)

            return (
              <ChartContainer
                config={chartConfig}
                className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[300px]"
              >
                <PieChart>
                  <ChartTooltip
                    content={<ChartTooltipContent nameKey="count" hideLabel />}
                  />
                  <Pie
                    data={chartData}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    stroke="0"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <LabelList
                      dataKey="typeLabel"
                      className="fill-background"
                      stroke="none"
                      fontSize={12}
                      formatter={(value: string) => {
                        const item = chartData.find(
                          (d) => d.typeLabel === value
                        )
                        const percentage = item
                          ? ((item.count / total) * 100).toFixed(0)
                          : '0'
                        return `${value} (${percentage}%)`
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            )
          })()
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum dado disponível
          </p>
        )}
      </ChartCard>

      <ChartCard
        title="Top 5 Imóveis"
        description="Imóveis mais visualizados"
        icon={Building2}
        isLoading={isLoadingProperty}
      >
        {topProperties && topProperties.length > 0 ? (
          (() => {
            const top5Properties = topProperties.slice(0, 5)
            const chartConfig: ChartConfig = {
              views: {
                label: 'Visualizações',
              },
            }

            const colors = [
              'hsl(var(--chart-1))',
              'hsl(var(--chart-2))',
              'hsl(var(--chart-3))',
              'hsl(var(--chart-4))',
              'hsl(var(--chart-5))',
            ]

            top5Properties.forEach((property, index) => {
              const key = property.propertyCode
                .toLowerCase()
                .replace(/\s+/g, '_')
              chartConfig[key] = {
                label: `#${property.propertyCode}`,
                color: colors[index % colors.length],
              }
            })

            const chartData = top5Properties.map((property) => {
              const key = property.propertyCode
                .toLowerCase()
                .replace(/\s+/g, '_')
              return {
                propertyCode: key,
                propertyCodeLabel: `#${property.propertyCode}`,
                views: property.views,
                favorites: property.favorites,
                fill: `var(--color-${key})`,
              }
            })

            return (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <XAxis
                    dataKey="propertyCodeLabel"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    dataKey="views"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="views" radius={5} />
                </BarChart>
              </ChartContainer>
            )
          })()
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum dado disponível
          </p>
        )}
      </ChartCard>

      <ChartCard
        title="Dispositivos"
        description="Acessos por dispositivo"
        icon={Smartphone}
        isLoading={isLoadingDevices}
      >
        {topDevices && topDevices.length > 0 ? (
          (() => {
            const chartConfig: ChartConfig = {
              count: {
                label: 'Acessos',
              },
            }

            const colors = [
              'hsl(var(--chart-1))',
              'hsl(var(--chart-2))',
              'hsl(var(--chart-3))',
              'hsl(var(--chart-4))',
              'hsl(var(--chart-5))',
            ]

            topDevices.forEach((device, index) => {
              const key = device.deviceType.toLowerCase().replace(/\s+/g, '_')
              chartConfig[key] = {
                label:
                  device.deviceType.charAt(0).toUpperCase() +
                  device.deviceType.slice(1),
                color: colors[index % colors.length],
              }
            })

            const chartData = topDevices.map((device) => {
              const key = device.deviceType.toLowerCase().replace(/\s+/g, '_')
              return {
                deviceType: key,
                deviceTypeLabel:
                  device.deviceType.charAt(0).toUpperCase() +
                  device.deviceType.slice(1),
                count: device.count,
                fill: `var(--color-${key})`,
              }
            })

            const total = chartData.reduce((sum, item) => sum + item.count, 0)

            return (
              <ChartContainer
                config={chartConfig}
                className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[300px]"
              >
                <PieChart>
                  <ChartTooltip
                    content={<ChartTooltipContent nameKey="count" hideLabel />}
                  />
                  <Pie
                    data={chartData}
                    dataKey="count"
                    nameKey="deviceType"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    stroke="0"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <LabelList
                      dataKey="deviceTypeLabel"
                      className="fill-background"
                      stroke="none"
                      fontSize={12}
                      formatter={(value: string) => {
                        const item = chartData.find(
                          (d) => d.deviceTypeLabel === value
                        )
                        const percentage = item
                          ? ((item.count / total) * 100).toFixed(0)
                          : '0'
                        return `${value} (${percentage}%)`
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            )
          })()
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum dado disponível
          </p>
        )}
      </ChartCard>
    </div>
  )
}
