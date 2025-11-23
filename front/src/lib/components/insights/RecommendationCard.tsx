import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Button } from '@ui/button'
import { Badge } from '@ui/badge'
import {
  Lightbulb,
  TrendingUp,
  Target,
  Building2,
  Smartphone,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import type { CampaignRecommendation } from '@/lib/hooks/useCampaignRecommendations'

interface RecommendationCardProps {
  recommendation: CampaignRecommendation
}

const typeIcons = {
  search: Target,
  conversion: TrendingUp,
  property: Building2,
  device: Smartphone,
}

const priorityConfig = {
  high: {
    variant: 'destructive' as const,
    icon: AlertTriangle,
    label: 'Alta Prioridade',
  },
  medium: {
    variant: 'default' as const,
    icon: Lightbulb,
    label: 'Média Prioridade',
  },
  low: {
    variant: 'secondary' as const,
    icon: CheckCircle2,
    label: 'Baixa Prioridade',
  },
}

const actionLinks = {
  'Ver análise de buscas': '/admin/insights/search',
  'Ver análise de conversões': '/admin/insights/conversion',
  'Ver análise de imóveis': '/admin/insights/properties',
  'Ver análise de dispositivos': '/admin/insights',
  'Ver filtros que convertem': '/admin/insights/search',
}

export function RecommendationCard({
  recommendation,
}: RecommendationCardProps) {
  const TypeIcon = typeIcons[recommendation.type]
  const priorityInfo = priorityConfig[recommendation.priority]
  const PriorityIcon = priorityInfo.icon
  const actionLink = recommendation.action
    ? actionLinks[recommendation.action as keyof typeof actionLinks]
    : undefined

  return (
    <Card className="shadow-layer-5">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TypeIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{recommendation.title}</CardTitle>
              <CardDescription className="mt-1.5">
                {recommendation.description}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={priorityInfo.variant}
            className="flex items-center gap-1 shrink-0"
          >
            <PriorityIcon className="h-3 w-3" />
            <span className="text-xs">{priorityInfo.label}</span>
          </Badge>
        </div>
      </CardHeader>
      {recommendation.action && actionLink && (
        <CardContent>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <Link href={actionLink}>
              {recommendation.action}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      )}
    </Card>
  )
}
