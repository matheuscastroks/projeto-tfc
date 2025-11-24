import { SectionHeader, ActionCard } from '@/lib/components/dashboard'
import { Search, Building2, TrendingUp } from 'lucide-react'

export function QuickActionsSection() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Análises Avançadas"
        description="Acesse análises detalhadas por categoria para insights mais profundos"
      />
      <div className="grid gap-4 md:grid-cols-3">
        <ActionCard
          href="/admin/insights/search"
          icon={Search}
          title="Buscas"
          description="Análise de filtros e localidades"
        />
        <ActionCard
          href="/admin/insights/properties"
          icon={Building2}
          title="Imóveis"
          description="Imóveis populares e engajamento"
        />
        <ActionCard
          href="/admin/insights/conversion"
          icon={TrendingUp}
          title="Conversões"
          description="Taxa e perfil de leads"
        />
      </div>
    </div>
  )
}
