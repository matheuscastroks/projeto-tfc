// Resposta para dispositivos acessados
export interface DevicesResponse {
  devices: Array<{
    deviceType: string; // tipo de dispositivo
    count: number; // quantidade de acessos
  }>;
}

// Resposta para série temporal de dispositivos
export interface DevicesTimeSeriesResponse {
  data: Array<{
    date: string; // data da métrica
    mobile: number; // acessos em dispositivos móveis
    desktop: number; // acessos em desktop
  }>;
  period: {
    start: string; // início do período
    end: string; // fim do período
  };
}

export interface GlobalKPIsResponse {
  uniqueVisitors: number;
  leadsGenerated: number;
  conversionRate: number;
  avgPropertiesViewed: number;
  totalFavorites: number;
  period: {
    start: string;
    end: string;
  };
}

export interface GlobalFunnelResponse {
  searches: number;
  resultsClicks: number;
  propertyViews: number;
  favorites: number;
  leads: number;
  dropoffRates: {
    searchToClick: number;
    clickToView: number;
    viewToFavorite: number;
    favoriteToLead: number;
  };
  period: {
    start: string;
    end: string;
  };
}
