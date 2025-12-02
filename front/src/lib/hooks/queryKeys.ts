export const queryKeys = {
  sites: {
    all: ['sites'] as const,
    detail: (id: string) => [...queryKeys.sites.all, id] as const,
  },
  domains: {
    all: (siteId: string) =>
      [...queryKeys.sites.detail(siteId), 'domains'] as const,
  },
  insights: {
    all: ['insights'] as const,
    overview: {
      all: () => [...queryKeys.insights.all, 'overview'] as const,
      devices: (siteKey: string, params?: any) =>
        [
          ...queryKeys.insights.overview.all(),
          'devices',
          siteKey,
          params,
        ] as const,
      devicesTimeSeries: (siteKey: string, params?: any) =>
        [
          ...queryKeys.insights.overview.all(),
          'devicesTimeSeries',
          siteKey,
          params,
        ] as const,
      kpis: (siteKey: string, params?: any) =>
        [
          ...queryKeys.insights.overview.all(),
          'kpis',
          siteKey,
          params,
        ] as const,
      funnel: (siteKey: string, params?: any) =>
        [
          ...queryKeys.insights.overview.all(),
          'funnel',
          siteKey,
          params,
        ] as const,
    },
    search: {
      all: () => [...queryKeys.insights.all, 'search'] as const,
      summary: (siteKey: string, params?: any) =>
        [
          ...queryKeys.insights.search.all(),
          'summary',
          siteKey,
          params,
        ] as const,
      filtersUsage: (siteKey: string, params?: any) =>
        [
          ...queryKeys.insights.search.all(),
          'filtersUsage',
          siteKey,
          params,
        ] as const,
      topConvertingFilters: (siteKey: string, params?: any) =>
        [
          ...queryKeys.insights.search.all(),
          'topConvertingFilters',
          siteKey,
          params,
        ] as const,
    },
    property: {
      all: () => [...queryKeys.insights.all, 'property'] as const,
      popular: (siteKey: string, params?: any) =>
        [
          ...queryKeys.insights.property.all(),
          'popular',
          siteKey,
          params,
        ] as const,
      engagement: (siteKey: string, params?: any) =>
        [
          ...queryKeys.insights.property.all(),
          'engagement',
          siteKey,
          params,
        ] as const,
      funnel: (siteKey: string, propertyCode: string, params?: any) =>
        [
          ...queryKeys.insights.property.all(),
          'funnel',
          siteKey,
          propertyCode,
          params,
        ] as const,
      underperforming: (siteKey: string, params?: any) =>
        [
          ...queryKeys.insights.property.all(),
          'underperforming',
          siteKey,
          params,
        ] as const,
      stagnant: (siteKey: string, params?: any) =>
        [
          ...queryKeys.insights.property.all(),
          'stagnant',
          siteKey,
          params,
        ] as const,
    },
    conversion: {
      all: () => [...queryKeys.insights.all, 'conversion'] as const,
      summary: (siteKey: string, params?: any) =>
        [
          ...queryKeys.insights.conversion.all(),
          'summary',
          siteKey,
          params,
        ] as const,
      sources: (siteKey: string, params?: any) =>
        [
          ...queryKeys.insights.conversion.all(),
          'sources',
          siteKey,
          params,
        ] as const,
      leadProfile: (siteKey: string, params?: any) =>
        [
          ...queryKeys.insights.conversion.all(),
          'leadProfile',
          siteKey,
        ] as const,
    },
    journey: {
      all: () => [...queryKeys.insights.all, 'journey'] as const,
      stats: (siteKey: string, params?: any) =>
        [
          ...queryKeys.insights.journey.all(),
          'stats',
          siteKey,
          params,
        ] as const,
    },
  },
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },
} as const
