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
import { ExternalLink, AlertTriangle, Clock, TrendingUp } from 'lucide-react'

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

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Performance de Imóveis</CardTitle>
        <CardDescription>
          Analise quais imóveis estão performando bem e quais precisam de
          atenção
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="popular" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="popular">Populares</TabsTrigger>
            <TabsTrigger value="underperforming">Baixa Conversão</TabsTrigger>
            <TabsTrigger value="stagnant">Estagnados</TabsTrigger>
          </TabsList>

          <TabsContent value="popular">
            <div className="space-y-4">
              {popularData?.properties.map((prop) => (
                <div
                  key={prop.codigo}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Cód. {prop.codigo}</span>
                      <a
                        href={prop.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Score de Engajamento: {prop.engagementScore}
                    </div>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-bold">{prop.views}</div>
                      <div className="text-muted-foreground text-xs">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">{prop.favorites}</div>
                      <div className="text-muted-foreground text-xs">
                        Favoritos
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-600">
                        {prop.leads}
                      </div>
                      <div className="text-muted-foreground text-xs">Leads</div>
                    </div>
                  </div>
                </div>
              ))}
              {!popularData?.properties.length && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="underperforming">
            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg flex items-start gap-3 text-sm text-yellow-800 dark:text-yellow-200 mb-4">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <p>
                  Estes imóveis têm muitas visualizações mas poucos leads.
                  Considere revisar o preço, fotos ou descrição.
                </p>
              </div>
              {underperformingData?.properties.map((prop) => (
                <div
                  key={prop.codigo}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Cód. {prop.codigo}</span>
                      <a
                        href={prop.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Conv. Rate: {prop.conversionRate}%
                    </div>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-bold">{prop.views}</div>
                      <div className="text-muted-foreground text-xs">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-red-500">{prop.leads}</div>
                      <div className="text-muted-foreground text-xs">Leads</div>
                    </div>
                  </div>
                </div>
              ))}
              {!underperformingData?.properties.length && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum imóvel com baixa performance identificado
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="stagnant">
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3 text-sm text-blue-800 dark:text-blue-200 mb-4">
                <Clock className="h-5 w-5 shrink-0" />
                <p>
                  Estes imóveis estão no site há mais de 30 dias com poucas
                  visualizações. Melhore o destaque ou promova-os.
                </p>
              </div>
              {stagnantData?.properties.map((prop) => (
                <div
                  key={prop.codigo}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Cód. {prop.codigo}</span>
                      <a
                        href={prop.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      No ar há {prop.daysSinceFirstView} dias
                    </div>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-bold">{prop.views}</div>
                      <div className="text-muted-foreground text-xs">
                        Views Totais
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {!stagnantData?.properties.length && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum imóvel estagnado identificado
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
