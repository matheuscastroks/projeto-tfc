import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Spinner } from '@ui/spinner'
import { GlobalFunnelResponse } from '@/lib/types/insights'
import {
  Funnel,
  FunnelChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@ui/chart'

interface FunnelSectionProps {
  data?: GlobalFunnelResponse
  isLoading: boolean
}

const COLORS = [
  'hsl(var(--chart-1))', // Searches - Blue
  'hsl(var(--chart-2))', // Clicks - Sky
  'hsl(var(--chart-3))', // Views - Indigo
  'hsl(var(--chart-5))', // Leads - Emerald
]

export function FunnelSection({ data, isLoading }: FunnelSectionProps) {
  if (isLoading) {
    return (
      <Card className="bg-card border border-border/40 shadow-sm">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-sm sm:text-base">Funil de Conversão</CardTitle>
          <CardDescription className="text-xs">
            Jornada do usuário desde a busca até o lead
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] sm:h-[350px] flex items-center justify-center p-3 sm:p-4">
          <Spinner className="h-6 w-6" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const funnelData = [
    {
      id: 'searches',
      name: 'Buscas',
      value: data.searches,
      fill: COLORS[0],
    },
    {
      id: 'clicks',
      name: 'Cliques',
      value: data.resultsClicks,
      fill: COLORS[1],
    },
    {
      id: 'views',
      name: 'Visualizações',
      value: data.propertyViews,
      fill: COLORS[2],
    },
    {
      id: 'leads',
      name: 'Leads',
      value: data.leads,
      fill: COLORS[3],
    },
  ]

  const chartConfig = {
    value: {
      label: 'Quantidade',
    },
    searches: {
      label: 'Buscas',
      color: COLORS[0],
    },
    clicks: {
      label: 'Cliques',
      color: COLORS[1],
    },
    views: {
      label: 'Visualizações',
      color: COLORS[2],
    },
    leads: {
      label: 'Leads',
      color: COLORS[3],
    },
  }

  return (
    <Card className="bg-card border border-border/40 shadow-sm flex flex-col">
      <CardHeader className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <div>
            <CardTitle className="text-sm sm:text-base">Funil de Conversão</CardTitle>
            <CardDescription className="text-xs">
              Visualização da jornada do cliente e taxas de conversão
            </CardDescription>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-lg sm:text-xl font-bold text-emerald-600">
              {((data.leads / (data.searches || 1)) * 100).toFixed(2)}%
            </div>
            <div className="text-xs text-muted-foreground">
              Conversão Global
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px] sm:min-h-[350px] p-3 sm:p-4">
        <ChartContainer config={chartConfig} className="w-full h-full mx-auto max-w-3xl">
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Funnel
                data={funnelData}
                dataKey="value"
                isAnimationActive
                labelLine={false}
              >
                <LabelList
                  position="right"
                  fill="#000"
                  stroke="none"
                  dataKey="name"
                  className="fill-foreground font-medium"
                  fontSize={14}
                />
                 <LabelList
                  position="right"
                  fill="#000"
                  stroke="none"
                  dataKey="value"
                  className="fill-muted-foreground"
                  fontSize={12}
                  formatter={(val: number) => val.toLocaleString()}
                  offset={20}
                />
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
