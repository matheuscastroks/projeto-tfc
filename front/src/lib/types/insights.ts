/**
 * Type definitions for Insights API responses (categorized analytics)
 */

export type DateFilter = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'CUSTOM'

export interface InsightsQuery {
  dateFilter?: DateFilter
  startDate?: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD
  limit?: number
  offset?: number
}

// =====================================================
// CATEGORIZED INSIGHTS
// =====================================================

// ===== SEARCH & FILTERS =====
export interface SearchAnalyticsResponse {
  totalSearches: number
  topFinalidades: Array<{
    finalidade: string
    count: number
  }>
  topTipos: Array<{
    tipo: string
    count: number
  }>
  topCidades: Array<{
    cidade: string
    count: number
  }>
  topBairros: Array<{
    bairro: string
    count: number
  }>
  topQuartos: Array<{
    quartos: string
    count: number
  }>
  topSuites: Array<{
    suites: string
    count: number
  }>
  topBanheiros: Array<{
    banheiros: string
    count: number
  }>
  topVagas: Array<{
    vagas: string
    count: number
  }>
  topSalas: Array<{
    salas: string
    count: number
  }>
  topGalpoes: Array<{
    galpoes: string
    count: number
  }>
  topComodos: Array<{
    comodo: string
    count: number
  }>
  priceRanges: {
    venda: Array<{
      range: string
      count: number
    }>
    aluguel: Array<{
      range: string
      count: number
    }>
  }
  areaRanges: Array<{
    range: string
    count: number
  }>
  topSwitches: Array<{
    switch: string
    count: number
    percentage: number
  }>
  topComodidades: Array<{
    comodidade: string
    count: number
  }>
  topLazer: Array<{
    lazer: string
    count: number
  }>
  topSeguranca: Array<{
    seguranca: string
    count: number
  }>
  avgFiltersUsed: number
  period: {
    start: string
    end: string
  }
}

export interface FiltersUsageResponse {
  totalFilterChanges: number
  filtersByType: Array<{
    filterType: string
    count: number
    percentage: number
  }>
  topFilterCombinations: Array<{
    combination: string[]
    count: number
  }>
  period: {
    start: string
    end: string
  }
}

export interface TopConvertingFiltersResponse {
  filters: Array<{
    combination: Record<string, string | string[]>
    conversions: number
  }>
  period: {
    start: string
    end: string
  }
}

// ===== CONVERSION =====
export interface ConversionRateResponse {
  totalConversions: number
  totalSessions: number
  conversionRate: number
  conversionsByType: Array<{
    type: string
    count: number
    percentage: number
  }>
  period: {
    start: string
    end: string
  }
}

export interface ConversionSourcesResponse {
  sources: Array<{
    source: string
    conversions: number
    percentage: number
  }>
  period: {
    start: string
    end: string
  }
}

export interface LeadProfileResponse {
  topInterests: Array<{
    interest: string
    count: number
  }>
  topCategories: Array<{
    category: string
    count: number
  }>
  topPropertyTypes: Array<{
    type: string
    count: number
  }>
  topCities: Array<{
    city: string
    count: number
  }>
  averageSaleValue: number
  averageRentalValue: number
  period: {
    start: string
    end: string
  }
}

// ===== PROPERTIES =====
export interface PopularPropertiesResponse {
  properties: Array<{
    codigo: string
    url: string
    views: number
    favorites: number
    leads: number
    engagementScore: number
  }>
  period: {
    start: string
    end: string
  }
}

export interface PropertyEngagementResponse {
  totalViews: number
  totalFavorites: number
  period: {
    start: string
    end: string
  }
}

export interface PropertyFunnelResponse {
  views: number
  favorites: number
  leads: number
  viewToLeadRate: number
  period: {
    start: string
    end: string
  }
}

// ===== DEVICES =====
export interface DevicesResponse {
  devices: Array<{
    deviceType: string
    count: number
  }>
}

export interface DevicesTimeSeriesResponse {
  data: Array<{
    date: string
    mobile: number
    desktop: number
  }>
  period: {
    start: string
    end: string
  }
}

// ===== NEW DASHBOARD TYPES =====

export interface GlobalKPIsResponse {
  uniqueVisitors: number
  leadsGenerated: number
  conversionRate: number
  avgPropertiesViewed: number
  totalFavorites: number
  period: {
    start: string
    end: string
  }
}

export interface GlobalFunnelResponse {
  searches: number
  resultsClicks: number
  propertyViews: number
  favorites: number
  leads: number
  dropoffRates: {
    searchToClick: number
    clickToView: number
    viewToFavorite: number
    favoriteToLead: number
  }
  period: {
    start: string
    end: string
  }
}

export interface UnderperformingPropertiesResponse {
  properties: Array<{
    codigo: string
    url: string
    views: number
    leads: number
    conversionRate: number
  }>
  period: {
    start: string
    end: string
  }
}

export interface StagnantPropertiesResponse {
  properties: Array<{
    codigo: string
    url: string
    views: number
    daysSinceFirstView: number
  }>
  period: {
    start: string
    end: string
  }
}

export interface JourneyResponse {
  avgTimeOnSite: number // em segundos
  avgPageDepth: number
  recurrentVisitorsPercentage: number
  period: {
    start: string
    end: string
  }
}

export interface DemandVsSupplyResponse {
  demand: Array<{
    category: string
    count: number
    percentage: number
  }>
  supply: Array<{
    category: string
    count: number
    percentage: number
  }>
  gap: Array<{
    category: string
    gapScore: number
  }>
  period: {
    start: string
    end: string
  }
}
