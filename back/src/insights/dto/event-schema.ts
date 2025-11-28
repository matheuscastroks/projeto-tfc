export enum EventName {
  VIEW_PROPERTY = 'view_property',
  SEARCH = 'search',
  CLICK_PROPERTY_CARD = 'click_property_card',
  TOGGLE_FAVORITE = 'toggle_favorite',
  CLICK_CONTACT = 'click_contact',
  SUBMIT_LEAD_FORM = 'submit_lead_form',
}

export interface PageContext {
  url: string;
  title: string;
  referrer: string;
}

export interface DeviceContext {
  userAgent: string;
  screen: { width: number; height: number };
  viewport: { width: number; height: number };
}

export interface JourneyContext {
  depth: number;
  timeOnSite: number;
  returning: boolean;
}

export interface AnalyticsContext {
  page: PageContext;
  device: DeviceContext;
  journey: JourneyContext;
}

export interface AnalyticsEvent<T = Record<string, any>> {
  name: EventName;
  ts: number;
  userId: string;
  sessionId: string;
  context: AnalyticsContext;
  properties: T;
}

// Payload Definitions

export interface ViewPropertyPayload {
  propertyId: string;
  // Add other relevant property details if needed for snapshotting
}

export interface SearchPayload {
  source: string;
  filters: {
    term?: string;
    type?: string[];
    city?: string[];
    neighborhood?: string[];
    priceMin?: number;
    priceMax?: number;
    bedrooms?: string[];
    [key: string]: any; // Allow flexibility for other filters
  };
  resultsCount?: number;
}

export interface ClickPropertyCardPayload {
  propertyId: string;
  listPosition?: number;
  listSource?: string; // e.g., 'search_results', 'similar_properties'
}

export interface ToggleFavoritePayload {
  propertyId: string;
  action: 'add' | 'remove';
}

export interface ClickContactPayload {
  propertyId: string;
  method: 'whatsapp' | 'phone' | 'email';
  destination?: string; // e.g., phone number
}

export interface SubmitLeadFormPayload {
  propertyId?: string;
  source: 'modal' | 'page_bottom' | 'thank_you_page';
  name?: string;
  email?: string;
  phone?: string;
  interest?: string;
}
