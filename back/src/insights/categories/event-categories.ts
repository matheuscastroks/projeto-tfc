export enum EventCategory {
  SEARCH = 'search',
  NAVIGATION = 'navigation',
  CONVERSION = 'conversion',
  PROPERTY = 'property',
}

export const EVENT_CATEGORY_MAP: Record<string, EventCategory> = {
  // Busca
  search: EventCategory.SEARCH,

  // Navegação
  click_property_card: EventCategory.NAVIGATION,
  view_property: EventCategory.NAVIGATION,

  // Engajamento com imóvel (favoritos)
  toggle_favorite: EventCategory.PROPERTY,

  // Conversão
  click_contact: EventCategory.CONVERSION,
  submit_lead_form: EventCategory.CONVERSION,
};

/**
 * Retorna a categoria para um dado nome de evento
 * @param eventName Nome do evento
 * @returns EventCategory ou undefined se não encontrado
 */
export function getEventCategory(eventName: string): EventCategory | undefined {
  return EVENT_CATEGORY_MAP[eventName];
}

/**
 * Retorna todos os eventos de uma determinada categoria
 * @param category Categoria de evento para filtrar
 * @returns Array de nomes de eventos nessa categoria
 */
export function getEventsByCategory(category: EventCategory): string[] {
  return Object.entries(EVENT_CATEGORY_MAP)
    .filter(([, cat]) => cat === category)
    .map(([eventName]) => eventName);
}

/**
 * Verifica se um evento pertence a uma categoria específica
 * @param eventName Nome do evento
 * @param category Categoria para checar
 * @returns boolean
 */
export function isEventInCategory(
  eventName: string,
  category: EventCategory,
): boolean {
  return EVENT_CATEGORY_MAP[eventName] === category;
}
