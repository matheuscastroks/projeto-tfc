import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Spinner } from '@ui/spinner'
import { JourneyResponse } from '@/lib/types/insights'
import { Clock, Layers, Repeat } from 'lucide-react'

interface JourneySectionProps {
  data?: JourneyResponse
  isLoading: boolean
}

export function JourneySection({ data, isLoading }: JourneySectionProps) {
  if (isLoading) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Jornada do Usuário</CardTitle>
          <CardDescription>
            Como os usuários navegam no seu site
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <Spinner className="h-8 w-8" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Comportamento de Navegação</CardTitle>
        <CardDescription>
          Entenda o engajamento e a fidelidade dos visitantes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg text-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold">
              {formatTime(data.avgTimeOnSite)}
            </div>
            <div className="text-sm text-muted-foreground">
              Tempo Médio no Site
            </div>
          </div>

          <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg text-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-3">
              <Layers className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold">
              {data.avgPageDepth.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">
              Páginas por Sessão
            </div>
          </div>

          <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg text-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
              <Repeat className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold">
              {data.recurrentVisitorsPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">
              Visitantes Recorrentes
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
