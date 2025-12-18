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
      <Card className="bg-card border border-border/40 shadow-sm">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-sm sm:text-base">
            Jornada do Usuário
          </CardTitle>
          <CardDescription className="text-xs">
            Como os usuários navegam no seu site
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[150px] sm:h-[180px] flex items-center justify-center p-3 sm:p-4">
          <Spinner className="h-6 w-6" />
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
    <Card className="bg-card border border-border/40 shadow-sm">
      <CardHeader className="p-3 sm:p-4">
        <CardTitle className="text-sm sm:text-base">
          Jornada do Usuário
        </CardTitle>
        <CardDescription className="text-xs">
          Engajamento e fidelidade dos visitantes
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <div className="grid grid-cols-3 gap-3 sm:gap-4 divide-x divide-border/40">
          <div className="flex flex-col items-center justify-center text-center px-2">
            <div className="flex items-center gap-1.5 mb-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Tempo Médio
              </span>
            </div>
            <div className="text-lg sm:text-xl font-bold tracking-tight">
              {formatTime(data.avgTimeOnSite)}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center text-center px-2">
            <div className="flex items-center gap-1.5 mb-1.5 text-muted-foreground">
              <Layers className="h-3.5 w-3.5" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Páginas/Sessão
              </span>
            </div>
            <div className="text-lg sm:text-xl font-bold tracking-tight">
              {data.avgPageDepth.toFixed(1)}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center text-center px-2">
            <div className="flex items-center gap-1.5 mb-1.5 text-muted-foreground">
              <Repeat className="h-3.5 w-3.5" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Recorrência
              </span>
            </div>
            <div className="text-lg sm:text-xl font-bold tracking-tight">
              {data.recurrentVisitorsPercentage.toFixed(1)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
