

(function () {
  'use strict';

  const CONFIG = {
    API_URL: window.IH_API_URL || '',
    SITE_KEY: window.IH_SITE_KEY || '',
    DEBUG: true, // Default to true for now to help debugging
    FLUSH_INTERVAL: 3000,
    MAX_QUEUE_SIZE: 10,
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 min
    ENDPOINT: '/api/events/track/batch',
  };

  const EVENT_NAMES = {
    VIEW_PROPERTY: 'view_property',
    SEARCH: 'search',
    CLICK_PROPERTY_CARD: 'click_property_card',
    TOGGLE_FAVORITE: 'toggle_favorite',
    CLICK_CONTACT: 'click_contact',
    SUBMIT_LEAD_FORM: 'submit_lead_form',
  };

  const STORAGE_KEYS = {
    USER_ID: 'ih_user_id',
    SESSION_ID: 'ih_session_id',
    LAST_ACTIVITY: 'ih_last_activity',
    JOURNEY: 'ih_journey',
    FAILED_EVENTS: 'ih_failed_events',
  };

  const Utils = {
    log: (...args) => {
      if (CONFIG.DEBUG) console.log('[InsightHouse v2]', ...args);
    },

    generateId: (prefix = 'id') => {
      return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    },

    getLS: (key, fallback = null) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
      } catch (e) {
        return fallback;
      }
    },

    setLS: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        // Quota exceeded or private mode
      }
    },

    byId: (id) => document.getElementById(id),

    // Helper to get value from input, select, or checkbox
    getVal: (id) => {
      const el = document.getElementById(id);
      if (!el) return undefined;
      if (el.type === 'checkbox' || el.type === 'radio') return el.checked;
      return el.value || undefined;
    },
  };
  const UserSession = {
    getUserId: () => {
      let uid = Utils.getLS(STORAGE_KEYS.USER_ID);
      if (!uid) {
        uid = Utils.generateId('user');
        Utils.setLS(STORAGE_KEYS.USER_ID, uid);
      }
      return uid;
    },

    getSessionId: () => {
      const now = Date.now();
      const last = Utils.getLS(STORAGE_KEYS.LAST_ACTIVITY, 0);
      let sid = Utils.getLS(STORAGE_KEYS.SESSION_ID);

      if (!sid || now - last > CONFIG.SESSION_TIMEOUT) {
        sid = Utils.generateId('session');
        Utils.setLS(STORAGE_KEYS.SESSION_ID, sid);
        // Reset journey on new session? Optional. Keeping it for now.
      }
      Utils.setLS(STORAGE_KEYS.LAST_ACTIVITY, now);
      return sid;
    },

    trackPageVisit: () => {
      const journey = Utils.getLS(STORAGE_KEYS.JOURNEY, []);
      journey.push({
        url: location.href,
        title: document.title,
        timestamp: Date.now(),
      });
      if (journey.length > 50) journey.shift(); // Keep last 50
      Utils.setLS(STORAGE_KEYS.JOURNEY, journey);
    },

    getJourneyContext: () => {
      const journey = Utils.getLS(STORAGE_KEYS.JOURNEY, []);
      const firstVisit = journey[0]?.timestamp || Date.now();
      return {
        depth: journey.length,
        timeOnSite: Math.floor((Date.now() - firstVisit) / 1000),
        returning: journey.length > 1, // Simplistic definition
      };
    },
  };

  const DomScraper = {
    getPropertyIdFromUrl: () => {
      // Exclude thank you pages
      if (/\/obrigado\/?/.test(location.pathname)) return null;

      const match = location.pathname.match(/\/imovel\/(\d+)\//);
      return match ? match[1] : null;
    },

    getSearchFilters: () => {
      // Helper to get checked values from a NodeList
      const getChecked = (name) => {
        return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
          .map(el => el.value);
      };

      // Helper to parse "min,max" slider values
      const getRange = (id) => {
        const val = Utils.getVal(id);
        if (!val) return undefined;
        const [min, max] = String(val).split(',');
        return { min: Number(min) || 0, max: max === 'unlimited' ? null : Number(max) };
      };

      return {
        term: undefined,
        status: Utils.getVal('property-status'), // finalidade
        type: Utils.getVal('residencial-property-type') ? [Utils.getVal('residencial-property-type')] : undefined,
        city: Utils.getVal('search-field-cidade') ? [Utils.getVal('search-field-cidade')] : undefined,
        neighborhood: Utils.getVal('search-field-cidadebairro') ? [Utils.getVal('search-field-cidadebairro')] : undefined,
        bedrooms: getChecked('dormitorios[]'),
        suites: getChecked('suites[]'),
        bathrooms: getChecked('banheiros[]'),
        parking: getChecked('vagas[]'),
        salePrice: getRange('input-slider-valor-venda'),
        rentPrice: getRange('input-slider-valor-aluguel'),
        area: getRange('input-slider-area'),
        // Add boolean flags
        furnished: Utils.getVal('filtermobiliado'),
        newProperty: Utils.getVal('filternovo'),

        // Detailed filters (Arrays)
        rooms: getChecked('comodos[]'),
        leisure: getChecked('lazer[]'),
        security: getChecked('seguranca[]'),
        amenities: getChecked('comodidades[]'),
        // ... add other filters as needed
      };
    },

    getThankYouPageData: () => {
      if (!/\/obrigado\/?/.test(location.pathname)) return null;
      const qs = new URLSearchParams(location.search);
      return {
        propertyId: qs.get('codigo'),
        interest: qs.get('interesse'),
        value: Number(qs.get('valor_venda') || 0),
        // ... extract other params
      };
    },
  };
  const EventBuilder = {
    build: (eventName, payload = {}) => {
      return {
        name: eventName,
        timestamp: Date.now(),
        user: {
          anonymousId: UserSession.getUserId(),
          sessionId: UserSession.getSessionId(),
        },
        context: {
          page: {
            url: location.href,
            title: document.title,
            referrer: document.referrer,
          },
          device: {
            userAgent: navigator.userAgent,
            screen: { width: screen.width, height: screen.height },
            viewport: { width: window.innerWidth, height: window.innerHeight },
          },
          journey: UserSession.getJourneyContext(),
        },
        payload: payload,
      };
    },
  };
  const Transport = {
    queue: [],
    timer: null,

    enqueue: (event) => {
      Transport.queue.push(event);
      Utils.log('Queued:', event.name, event);

      if (Transport.queue.length >= CONFIG.MAX_QUEUE_SIZE) {
        Transport.flush();
      } else {
        Transport.scheduleFlush();
      }
    },

    scheduleFlush: () => {
      if (Transport.timer) clearTimeout(Transport.timer);
      Transport.timer = setTimeout(Transport.flush, CONFIG.FLUSH_INTERVAL);
    },

    flush: () => {
      if (Transport.queue.length === 0) return;

      const batch = Transport.queue.slice();
      Transport.queue = [];

      const url = `${CONFIG.API_URL}${CONFIG.ENDPOINT}`;


      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Site-Key': CONFIG.SITE_KEY,
        },
        body: JSON.stringify({ events: batch }),
        keepalive: true,
      })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        Utils.log('Batch sent:', batch.length);
      })
      .catch(err => {
        Utils.log('Send failed:', err);
        Transport.persistFailed(batch);
        Transport.scheduleRetry();
      });
    },

    persistFailed: (events) => {
      const current = Utils.getLS(STORAGE_KEYS.FAILED_EVENTS, []);
      const updated = [...current, ...events].slice(-50); // Keep max 50 failed
      Utils.setLS(STORAGE_KEYS.FAILED_EVENTS, updated);
    },

    retryFailed: () => {
      const failed = Utils.getLS(STORAGE_KEYS.FAILED_EVENTS, []);
      if (failed.length === 0) return;

      Utils.setLS(STORAGE_KEYS.FAILED_EVENTS, []); // Clear
      Utils.log('Retrying failed events:', failed.length);

      failed.forEach(e => Transport.enqueue(e));
    },

    scheduleRetry: () => {
      setTimeout(Transport.retryFailed, 10000); // Retry after 10s
    },
  };
  const Collector = {
    init: () => {
      if (!CONFIG.SITE_KEY) {
        console.error('[InsightHouse] Missing SITE_KEY. Analytics disabled.');
        return;
      }

      UserSession.trackPageVisit();
      Transport.retryFailed();

      Collector.bindGlobalEvents();
      Collector.bindPageSpecificEvents();

      Utils.log('Initialized v2');
    },

    capture: (eventName, payload) => {
      const event = EventBuilder.build(eventName, payload);
      Transport.enqueue(event);
    },

    bindGlobalEvents: () => {
      // Visibility Change (Flush on hide)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') Transport.flush();
      });

      // Click Delegation
      document.addEventListener('click', (e) => {
        const target = e.target;

        // 1. Property Card Click
        const cardLink = target.closest('a[href*="/imovel/"]');
        if (cardLink) {
          const href = cardLink.getAttribute('href');
          const match = href.match(/\/imovel\/(\d+)\//);
          if (match) {
            Collector.capture(EVENT_NAMES.CLICK_PROPERTY_CARD, {
              propertyId: match[1],
              url: href,
            });
          }
        }

        // 2. Favorite Toggle
        const favBtn = target.closest('.btn-favoritar');
        if (favBtn) {
          const propertyId = favBtn.getAttribute('data-codigo');
          const action = favBtn.classList.contains('favorited') ? 'remove' : 'add';
          Collector.capture(EVENT_NAMES.TOGGLE_FAVORITE, { propertyId, action });
        }

        // 3. WhatsApp/Contact Click
        const waLink = target.closest('a[href*="wa.me"], a[href*="api.whatsapp.com"]');
        if (waLink) {
          const propertyId = waLink.closest('[data-codigo]')?.getAttribute('data-codigo');
          Collector.capture(EVENT_NAMES.CLICK_CONTACT, {
            propertyId,
            method: 'whatsapp',
            destination: waLink.href,
          });
        }
      }, { passive: true });
    },

    bindPageSpecificEvents: () => {
      // 1. View Property
      const propertyId = DomScraper.getPropertyIdFromUrl();
      if (propertyId) {
        Collector.capture(EVENT_NAMES.VIEW_PROPERTY, { propertyId });
      }

      // 2. Search Submit
      // Bind to main search button if present
      const mainSearchBtn = Utils.byId('submit-main-search-form');
      if (mainSearchBtn) {
        mainSearchBtn.addEventListener('click', () => {
          Collector.capture(EVENT_NAMES.SEARCH, {
            source: 'main_search',
            filters: DomScraper.getSearchFilters(),
          });
        });
      }

      // Bind to sidebar search buttons
      document.querySelectorAll('.submit-sidebar-search-form').forEach(btn => {
        btn.addEventListener('click', () => {
          Collector.capture(EVENT_NAMES.SEARCH, {
            source: 'sidebar_search',
            filters: DomScraper.getSearchFilters(),
          });
        });
      });

      // 3. Lead Form Submission (Thank You Page)
      const thankYouData = DomScraper.getThankYouPageData();
      if (thankYouData) {
        Collector.capture(EVENT_NAMES.SUBMIT_LEAD_FORM, {
          source: 'thank_you_page',
          ...thankYouData
        });
      }
    },
  };

  // Expose for debugging
  window.IH_Analytics_v2 = {
    capture: Collector.capture,
    flush: Transport.flush,
    getConfig: () => CONFIG,
  };

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Collector.init);
  } else {
    Collector.init();
  }

})();
