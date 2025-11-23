import Link from 'next/link'
import { Button } from '@ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Search, Building2, TrendingUp, ArrowRight } from 'lucide-react'

export function QuickActionsSection() {
  return (
    <Card className="shadow-layer-5">
      <CardHeader>
        <CardTitle>Análises Avançadas</CardTitle>
        <CardDescription>
          Acesse análises detalhadas por categoria
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-3">
          <Button
            asChild
            variant="outline"
            className="h-auto py-4 justify-start"
          >
            <Link href="/admin/insights/search">
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">Buscas</p>
                  <p className="text-xs text-muted-foreground">
                    Análise de filtros e localidades
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-auto py-4 justify-start"
          >
            <Link href="/admin/insights/properties">
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">Imóveis</p>
                  <p className="text-xs text-muted-foreground">
                    Imóveis populares e engajamento
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-auto py-4 justify-start"
          >
            <Link href="/admin/insights/conversion">
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">Conversões</p>
                  <p className="text-xs text-muted-foreground">
                    Taxa e perfil de leads
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
