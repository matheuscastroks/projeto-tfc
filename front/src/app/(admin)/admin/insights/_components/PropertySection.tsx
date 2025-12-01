import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/lib/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Spinner } from '@ui/spinner'
import {
  PopularPropertiesResponse,
  UnderperformingPropertiesResponse,
  StagnantPropertiesResponse,
} from '@/lib/types/insights'
import { ExternalLink, AlertTriangle, Clock } from 'lucide-react'
import { Button } from '@ui/button'

interface PropertySectionProps {
  popularData?: PopularPropertiesResponse
  underperformingData?: UnderperformingPropertiesResponse
  stagnantData?: StagnantPropertiesResponse
  isLoading: boolean
}

export function PropertySection({
  popularData,
  underperformingData,
  stagnantData,
  isLoading,
}: PropertySectionProps) {
  if (isLoading) {
    return (
      <Card className="border-2">
        <CardContent className="h-[400px] flex items-center justify-center">
          <Spinner className="h-8 w-8" />
        </CardContent>
      </Card>
    )
  }

  const renderHeatmapPill = (
    value: number,
    max: number,
    color: 'blue' | 'green' | 'red' | 'yellow' = 'blue'
  ) => {
    const percent = max > 0 ? value / max : 0
    const colors = {
      blue: { bg: 'hsl(var(--primary))', text: 'hsl(var(--primary))' },
      green: { bg: 'hsl(142 76% 36%)', text: 'hsl(142 76% 36%)' },
      red: { bg: 'hsl(0 84% 60%)', text: 'hsl(0 84% 60%)' },
      yellow: { bg: 'hsl(45 93% 47%)', text: 'hsl(45 93% 47%)' },
    }
    const c = colors[color]

    return (
      <div className="flex justify-end">
        <div
          className="px-2.5 py-1 rounded-md font-medium text-xs transition-colors"
          style={{
            backgroundColor: `${c.bg.replace(')', ` / ${Math.max(percent * 0.25, 0.05)})`)}`,
            color: c.text,
          }}
        >
          {value.toLocaleString()}
        </div>
      </div>
    )
  }

  const renderTable = (
    properties: any[],
    type: 'popular' | 'underperforming' | 'stagnant'
  ) => {
    if (!properties?.length) {
      return (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Nenhum imóvel encontrado nesta categoria
        </div>
      )
    }

    const maxViews = Math.max(...properties.map((p) => p.views), 1)
    const maxLeads = Math.max(...properties.map((p) => p.leads || 0), 1)

    return (
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="h-9 px-4 text-left font-medium text-muted-foreground w-[50%]">
                Imóvel
              </th>
              <th className="h-9 px-4 text-right font-medium text-muted-foreground">
                Views
              </th>
              <th className="h-9 px-4 text-right font-medium text-muted-foreground">
                Leads
              </th>
            </tr>
          </thead>
          <tbody>
            {properties.slice(0, 5).map((prop) => (
              <tr
                key={prop.codigo}
                className="border-b last:border-0 hover:bg-muted/50 transition-colors"
              >
                <td className="p-3 align-middle">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">#{prop.codigo}</span>
                    {prop.url && (
                      <a
                        href={prop.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  {type === 'underperforming' && (
                    <div className="text-xs text-red-500 mt-0.5">
                      Conv: {prop.conversionRate}%
                    </div>
                  )}
                  {type === 'stagnant' && (
                    <div className="text-xs text-yellow-600 mt-0.5">
                      {prop.daysSinceFirstView} dias sem leads
                    </div>
                  )}
                </td>
                <td className="p-3 align-middle">
                  {renderHeatmapPill(prop.views, maxViews, 'blue')}
                </td>
                <td className="p-3 align-middle">
                  {renderHeatmapPill(
                    prop.leads || 0,
                    type === 'popular' ? maxLeads : 1, // Relative to max for popular, absolute/low for others
                    type === 'popular' ? 'green' : 'red'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <Card className="border-2 h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Performance de Imóveis</CardTitle>
            <CardDescription>
              Top 5 imóveis por categoria
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => (window.location.href = '/admin/insights/properties')}
          >
            Ver todos
            <ExternalLink className="ml-2 h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="popular" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="popular">Populares</TabsTrigger>
            <TabsTrigger value="underperforming">Baixa Conversão</TabsTrigger>
            <TabsTrigger value="stagnant">Estagnados</TabsTrigger>
          </TabsList>

          <TabsContent value="popular" className="mt-0">
            {renderTable(popularData?.properties || [], 'popular')}
          </TabsContent>

          <TabsContent value="underperforming" className="mt-0">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md flex items-start gap-3 text-xs text-yellow-800 dark:text-yellow-200 mb-4 border border-yellow-100 dark:border-yellow-900/50">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                Muitas visualizações mas poucos leads. Revise preço e fotos.
              </p>
            </div>
            {renderTable(underperformingData?.properties || [], 'underperforming')}
          </TabsContent>

          <TabsContent value="stagnant" className="mt-0">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md flex items-start gap-3 text-xs text-blue-800 dark:text-blue-200 mb-4 border border-blue-100 dark:border-blue-900/50">
              <Clock className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                No site há mais de 30 dias com baixo engajamento.
              </p>
            </div>
            {renderTable(stagnantData?.properties || [], 'stagnant')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
