import { useRouter } from 'next/navigation'
import { InsightCard } from '@/lib/components/dashboard'
import { TrendingUp, Target, Building2, Smartphone } from 'lucide-react'
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

const categoryLabels = {
  search: 'Análise de Buscas',
  conversion: 'Conversões',
  property: 'Imóveis',
  device: 'Dispositivos',
}

const priorityColors = {
  high: 'orange' as const,
  medium: 'blue' as const,
  low: 'green' as const,
}

const priorityLabels = {
  high: 'Alta Prioridade',
  medium: 'Média Prioridade',
  low: 'Baixa Prioridade',
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
  const router = useRouter()
  const TypeIcon = typeIcons[recommendation.type]
  const categoryColor = priorityColors[recommendation.priority]
  const categoryLabel = `${categoryLabels[recommendation.type]} • ${priorityLabels[recommendation.priority]}`
  const actionLink = recommendation.action
    ? actionLinks[recommendation.action as keyof typeof actionLinks]
    : undefined

  const handleAction = () => {
    if (actionLink) {
      router.push(actionLink)
    }
  }

  return (
    <InsightCard
      category={categoryLabel}
      categoryColor={categoryColor}
      title={recommendation.title}
      description={recommendation.description}
      icon={TypeIcon}
      action={
        recommendation.action && actionLink
          ? {
              label: recommendation.action,
              onClick: handleAction,
            }
          : undefined
      }
    />
  )
}
