export const PropertyKeys = {
  // Search Filters
  STATUS: 'status', // finalidade (venda/aluguel)
  TYPE: 'type', // tipos de imóvel
  CITY: 'city',
  NEIGHBORHOOD: 'neighborhood',
  BEDROOMS: 'bedrooms',
  SUITES: 'suites',
  BATHROOMS: 'bathrooms',
  GARAGE: 'garage',
  LIVING_ROOMS: 'living_rooms',
  WAREHOUSES: 'warehouses',
  ROOMS: 'rooms',
  LEISURE: 'leisure',
  SECURITY: 'security',
  AMENITIES: 'amenities',

  // Price & Area
  PRICE_SALE: 'price_sale',
  PRICE_RENT: 'price_rent',
  AREA: 'area',

  // Switches / Booleans
  FURNISHED: 'furnished', // mobiliado
  PROMOTION: 'promotion', // promocao
  PET_FRIENDLY: 'pet_friendly',

  // Search Metadata
  QUERY: 'query',
  CODE: 'code', // codigo do imóvel
  SEARCH_TERM: 'search_term', // termo de busca livre

  // Property Details
  PROPERTY_ID: 'propertyId', // camelCase as sent by frontend
  PROPERTY_CODE: 'property_code',
  PROPERTY_URL: 'url', // simple 'url' key in properties

  // Actions
  ACTION: 'action', // favorite action (add/remove)

  // Lead / Contact
  LEAD_SOURCE: 'source',
  LEAD_HAS_NAME: 'hasName',
  LEAD_HAS_EMAIL: 'hasEmail',
  LEAD_HAS_PHONE: 'hasPhone',
  LEAD_INTEREST: 'interest',
  LEAD_CATEGORY: 'category',
  LEAD_VALUE: 'value',
  LEAD_RENTAL_VALUE: 'rental_value',
  CONTACT_METHOD: 'method',
  CONTACT_DESTINATION: 'destination',
} as const;
