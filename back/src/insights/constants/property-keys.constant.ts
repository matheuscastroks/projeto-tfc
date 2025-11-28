export const PropertyKeys = {
  // Search Filters
  STATUS: 'status', // finalidade (venda/aluguel)
  TYPE: 'type', // tipos de imóvel
  CITY: 'city',
  NEIGHBORHOOD: 'neighborhood', // bairros
  BEDROOMS: 'bedrooms', // quartos
  SUITES: 'suites',
  BATHROOMS: 'bathrooms',
  GARAGE: 'garage', // vagas
  LIVING_ROOMS: 'living_rooms', // salas
  WAREHOUSES: 'warehouses', // galpoes
  ROOMS: 'rooms', // comodos
  LEISURE: 'leisure', // lazer
  SECURITY: 'security', // seguranca
  AMENITIES: 'amenities', // comodidades

  // Price & Area
  PRICE_SALE: 'price_sale', // preco_venda
  PRICE_RENT: 'price_rent', // preco_aluguel
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
  LEAD_NAME: 'name',
  LEAD_EMAIL: 'email',
  LEAD_PHONE: 'phone',
  LEAD_INTEREST: 'interest',
  LEAD_CATEGORY: 'category',
  LEAD_VALUE: 'value',
  LEAD_RENTAL_VALUE: 'rental_value',
  CONTACT_METHOD: 'method',
  CONTACT_DESTINATION: 'destination',
} as const;
