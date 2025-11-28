/**
 * Interfaces de resposta para os endpoints de insights categorizados
 */

// =====================
// BUSCA E FILTROS
// =====================

export interface SearchAnalyticsResponse {
  totalSearches: number;
  topFinalidades: Array<{
    finalidade: string;
    count: number;
  }>;
  topTipos: Array<{
    tipo: string;
    count: number;
  }>;
  topCidades: Array<{
    cidade: string;
    count: number;
  }>;
  topBairros: Array<{
    bairro: string;
    count: number;
  }>;
  topQuartos: Array<{
    quartos: string;
    count: number;
  }>;
  topSuites: Array<{
    suites: string;
    count: number;
  }>;
  topBanheiros: Array<{
    banheiros: string;
    count: number;
  }>;
  topVagas: Array<{
    vagas: string;
    count: number;
  }>;
  topSalas: Array<{
    salas: string;
    count: number;
  }>;
  topGalpoes: Array<{
    galpoes: string;
    count: number;
  }>;
  topComodos: Array<{
    comodo: string;
    count: number;
  }>;
  priceRanges: {
    venda: Array<{
      range: string;
      count: number;
    }>;
    aluguel: Array<{
      range: string;
      count: number;
    }>;
  };
  areaRanges: Array<{
    range: string;
    count: number;
  }>;
  topSwitches: Array<{
    switch: string;
    count: number;
    percentage: number;
  }>;
  topComodidades: Array<{
    comodidade: string;
    count: number;
  }>;
  topLazer: Array<{
    lazer: string;
    count: number;
  }>;
  topSeguranca: Array<{
    seguranca: string;
    count: number;
  }>;
  period: {
    start: string;
    end: string;
  };
}

export interface TopConvertingFiltersResponse {
  filters: Array<{
    combination: Record<string, string | string[]>;
    conversions: number;
  }>;
  period: {
    start: string;
    end: string;
  };
}

// =====================
// CONVERSÃO
// =====================

export interface ConversionRateResponse {
  totalConversions: number;
  totalSessions: number;
  conversionRate: number;
  conversionsByType: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  period: {
    start: string;
    end: string;
  };
}

export interface ConversionSourcesResponse {
  sources: Array<{
    source: string;
    conversions: number;
    percentage: number;
  }>;
  period: {
    start: string;
    end: string;
  };
}

export interface LeadProfileResponse {
  topInterests: Array<{
    interest: string;
    count: number;
  }>;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
  topPropertyTypes: Array<{
    type: string;
    count: number;
  }>;
  topCities: Array<{
    city: string;
    count: number;
  }>;
  averageSaleValue: number;
  averageRentalValue: number;
  period: {
    start: string;
    end: string;
  };
}

// =====================
// IMÓVEIS
// =====================

export interface PopularPropertiesResponse {
  properties: Array<{
    codigo: string;
    url: string;
    views: number;
    favorites: number;
    leads: number;
    engagementScore: number;
  }>;
  period: {
    start: string;
    end: string;
  };
}

export interface PropertyEngagementResponse {
  totalViews: number;
  totalFavorites: number;
  period: {
    start: string;
    end: string;
  };
}

export interface PropertyFunnelResponse {
  views: number;
  favorites: number;
  leads: number;
  viewToLeadRate: number;
  period: {
    start: string;
    end: string;
  };
}

export interface UnderperformingPropertiesResponse {
  properties: Array<{
    codigo: string;
    url: string;
    views: number;
    leads: number;
    conversionRate: number;
  }>;
  period: {
    start: string;
    end: string;
  };
}

export interface StagnantPropertiesResponse {
  properties: Array<{
    codigo: string;
    url: string;
    views: number;
    daysSinceFirstView: number;
  }>;
  period: {
    start: string;
    end: string;
  };
}

// =====================
// JORNADA
// =====================

export interface JourneyResponse {
  avgTimeOnSite: number; // em segundos
  avgPageDepth: number;
  recurrentVisitorsPercentage: number;
  period: {
    start: string;
    end: string;
  };
}

export interface DemandVsSupplyResponse {
  demand: Array<{
    category: string; // e.g., '3 quartos', 'Casa', 'Centro'
    count: number;
    percentage: number;
  }>;
  supply: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  gap: Array<{
    category: string;
    gapScore: number; // Positive = High Demand/Low Supply
  }>;
  period: {
    start: string;
    end: string;
  };
}
