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
    <Card className="border-2 h-full">
      <CardHeader>
        <CardTitle>Jornada do Usuário</CardTitle>
        <CardDescription>
          Engajamento e fidelidade dos visitantes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 divide-x">
          <div className="flex flex-col items-center justify-center text-center px-2">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Tempo Médio</span>
            </div>
            <div className="text-2xl font-bold tracking-tight">
              {formatTime(data.avgTimeOnSite)}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center text-center px-2">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <Layers className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Páginas/Sessão</span>
            </div>
            <div className="text-2xl font-bold tracking-tight">
              {data.avgPageDepth.toFixed(1)}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center text-center px-2">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <Repeat className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Recorrência</span>
            </div>
            <div className="text-2xl font-bold tracking-tight">
              {data.recurrentVisitorsPercentage.toFixed(1)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
