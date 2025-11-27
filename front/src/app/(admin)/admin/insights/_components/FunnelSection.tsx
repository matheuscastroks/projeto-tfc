import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card'
import { Spinner } from '@ui/spinner'
import { GlobalFunnelResponse } from '@/lib/types/insights'

interface FunnelSectionProps {
  data?: GlobalFunnelResponse
  isLoading: boolean
}

export function FunnelSection({ data, isLoading }: FunnelSectionProps) {
  if (isLoading) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Funil de Conversão</CardTitle>
          <CardDescription>Jornada do usuário desde a busca até o lead</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Spinner className="h-8 w-8" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const funnelData = [
    { name: 'Buscas', value: data.searches, fill: '#3b82f6' },
    { name: 'Cliques', value: data.resultsClicks, fill: '#60a5fa' },
    { name: 'Visualizações', value: data.propertyViews, fill: '#93c5fd' },
    { name: 'Favoritos', value: data.favorites, fill: '#bfdbfe' },
    { name: 'Leads', value: data.leads, fill: '#10b981' },
  ]

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Funil de Conversão</CardTitle>
        <CardDescription>
          Visualize onde você está perdendo oportunidades.
          Taxa de conversão final: {((data.leads / (data.searches || 1)) * 100).toFixed(2)}%
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={funnelData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-6 text-center text-sm text-muted-foreground">
           <div>
             <div className="font-semibold text-foreground">{data.dropoffRates.searchToClick.toFixed(1)}%</div>
             <div>Busca → Clique</div>
           </div>
           <div>
             <div className="font-semibold text-foreground">{data.dropoffRates.clickToView.toFixed(1)}%</div>
             <div>Clique → View</div>
           </div>
           <div>
             <div className="font-semibold text-foreground">{data.dropoffRates.viewToFavorite.toFixed(1)}%</div>
             <div>View → Favorito</div>
           </div>
           <div>
             <div className="font-semibold text-foreground">{data.dropoffRates.favoriteToLead.toFixed(1)}%</div>
             <div>Favorito → Lead</div>
           </div>
        </div>
      </CardContent>
    </Card>
  )
}
