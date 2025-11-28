import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Spinner } from '@ui/spinner'
import { DemandVsSupplyResponse } from '@/lib/types/insights'
import { Progress } from '@/lib/components/ui/progress'
import { Badge } from '@ui/badge'

interface DemandSectionProps {
  data?: DemandVsSupplyResponse
  isLoading: boolean
}

export function DemandSection({ data, isLoading }: DemandSectionProps) {
  if (isLoading) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Demanda vs Oferta</CardTitle>
          <CardDescription>
            O que os clientes buscam vs O que você tem
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Spinner className="h-8 w-8" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  // Take top 5 gaps (opportunities)
  const opportunities = data.gap.filter((g) => g.gapScore > 0).slice(0, 5)

  // Take top 5 oversupply (risks)
  const oversupply = data.gap
    .filter((g) => g.gapScore < 0)
    .sort((a, b) => a.gapScore - b.gapScore)
    .slice(0, 5)

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Demanda de Mercado</CardTitle>
        <CardDescription>
          Identifique oportunidades onde a procura é maior que a oferta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
            🔥 Oportunidades (Alta Procura, Baixo Estoque)
          </h4>
          <div className="space-y-4">
            {opportunities.map((item) => {
              const demandItem = data.demand.find(
                (d) => d.category === item.category
              )
              const supplyItem = data.supply.find(
                (s) => s.category === item.category
              )

              return (
                <div key={item.category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.category}</span>
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-200 bg-green-50"
                    >
                      Gap: +{item.gapScore}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Procura</span>
                        <span>{demandItem?.percentage || 0}%</span>
                      </div>
                      <Progress
                        value={demandItem?.percentage || 0}
                        className="h-1.5 bg-muted [&>div]:bg-blue-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Oferta</span>
                        <span>{supplyItem?.percentage || 0}%</span>
                      </div>
                      <Progress
                        value={supplyItem?.percentage || 0}
                        className="h-1.5 bg-muted [&>div]:bg-gray-400"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
            {opportunities.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma oportunidade clara identificada no momento.
              </p>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
            ⚠️ Atenção (Muita Oferta, Baixa Procura)
          </h4>
          <div className="space-y-4">
            {oversupply.map((item) => {
              const demandItem = data.demand.find(
                (d) => d.category === item.category
              )
              const supplyItem = data.supply.find(
                (s) => s.category === item.category
              )

              return (
                <div key={item.category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.category}</span>
                    <Badge
                      variant="outline"
                      className="text-yellow-600 border-yellow-200 bg-yellow-50"
                    >
                      Excesso: {Math.abs(item.gapScore)}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Procura</span>
                        <span>{demandItem?.percentage || 0}%</span>
                      </div>
                      <Progress
                        value={demandItem?.percentage || 0}
                        className="h-1.5 bg-muted [&>div]:bg-blue-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Oferta</span>
                        <span>{supplyItem?.percentage || 0}%</span>
                      </div>
                      <Progress
                        value={supplyItem?.percentage || 0}
                        className="h-1.5 bg-muted [&>div]:bg-orange-400"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
            {oversupply.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum excesso de oferta identificado.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
