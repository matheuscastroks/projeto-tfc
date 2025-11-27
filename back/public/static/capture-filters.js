// InsightHouse Analytics
// Foco: Busca, Engajamento de Imóveis e Conversão.
// A orquestração é feita através de uma classe única para encapsular estado e lógica.
// Eventos são delegados para evitar múltiplos listeners, melhorando a performance.

class InsightHouseAnalytics {
  // ==========================
  // CONFIGURAÇÕES
  // Define o comportamento do envio de eventos em lote.
  // ==========================
  MAX_QUEUE_SIZE = 10; // Envia o lote quando a fila atinge este tamanho.
  FLUSH_INTERVAL = 3000; // Envia o lote após este tempo em ms, mesmo que a fila não esteja cheia.
  FAILED_LIMIT = 300; // máx eventos persistidos p/ retry
  BACKOFF_MAX = 30000;
  SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos para expirar a sessão.

  // ==========================
  // CHAVES DE ARMAZENAMENTO
  // Centraliza as chaves do localStorage para evitar erros de digitação.
  // ==========================
  LS_FAILED = 'ih_failed_events'; // Eventos que falharam ao enviar.
  LS_USER = 'ih_user_id'; // ID persistente do usuário.
  LS_SESSION = 'ih_session_id'; // ID da sessão atual.
  LS_TIMEOUT = 'ih_session_timeout'; // Timestamp da última atividade para controle da sessão.
  LS_FIRST_TS = 'ih_first_page_time'; // Timestamp do carregamento da página.
  LS_JOURNEY = 'ih_journey_pages'; // Array de páginas visitadas na sessão.

  // ==========================
  // ESTADO INTERNO
  // Gerencia o estado da instância da classe.
  // ==========================
  eventQueue = []; // Fila de eventos a serem enviados.
  flushTimer = null; // Timer para o próximo envio da fila.
  backoffMs = 1000;
  pageLoadTime = Date.now(); // Timestamp do carregamento da página.

  // O construtor inicializa o SDK, valida a siteKey e define o endpoint.
  // Se a siteKey não for encontrada, o SDK é desabilitado.
  constructor({ apiUrl, siteKey, debug = true } = {}) {
    const MyAnalytics = (window.MyAnalytics = window.MyAnalytics || {});
    this.debug = debug ?? MyAnalytics.debug ?? false;

    this.API_URL = apiUrl ?? window.IH_API_URL ?? '';
    this.SITE_KEY = siteKey ?? window.IH_SITE_KEY ?? '';

    if (!this.SITE_KEY) {
      console.error('[InsightHouse] SITE_KEY não configurada');
      this.disabled = true;
      return;
    }

    this.BATCH_ENDPOINT = `${this.API_URL}/api/events/track/batch`;
  }

  // ==========================
  // UTILITÁRIOS
  // Funções de ajuda para logging, parsing e acesso ao localStorage.
  // ==========================
  log = (...args) => this.debug && console.log('[InsightHouse]', ...args);

  clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  safeJSONParse = (s, fallback) => {
    if (s == null) return fallback;
    try {
      return JSON.parse(s);
    } catch {
      return fallback;
    }
  };

  setLS = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  getLS = (k, fallback) =>
    this.safeJSONParse(localStorage.getItem(k), fallback);

  byId = (id) => (id ? document.getElementById(id) : null);

  // ==========================
  // GERENCIAMENTO DE USER & SESSION
  // Orquestra a criação e renovação de IDs de usuário e sessão.
  // ==========================

  // Retorna um ID de usuário persistente, criando um se não existir.
  getUserId = () => {
    let id = localStorage.getItem(this.LS_USER);
    if (!id) {
      id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(this.LS_USER, id);
    }
    return id;
  };

  // Retorna o ID da sessão atual. Se a sessão expirou, cria uma nova.
  // Isso garante que a jornada do usuário seja agrupada em sessões.
  getSessionId = () => {
    const now = Date.now();
    const last = parseInt(localStorage.getItem(this.LS_TIMEOUT) || '0', 10);
    let sid = localStorage.getItem(this.LS_SESSION);

    if (!sid || now - last > this.SESSION_TIMEOUT) {
      sid = `session_${now}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(this.LS_SESSION, sid);
    }
    localStorage.setItem(this.LS_TIMEOUT, String(now));
    return sid;
  };

  // Adiciona a página atual à jornada do usuário no localStorage.
  // Isso é útil para dar contexto a outros eventos (e.g., page_depth).
  trackPageView = () => {
    const journey = this.getLS(this.LS_JOURNEY, []);
    const safeJourney = Array.isArray(journey) ? journey : [];
    safeJourney.push({
      url: location.href,
      title: document.title,
      timestamp: Date.now(),
    });
    if (safeJourney.length > 20) safeJourney.shift();
    this.setLS(this.LS_JOURNEY, safeJourney);
    return safeJourney;
  };

  ensureFirstTs = () => {
    if (!localStorage.getItem(this.LS_FIRST_TS)) {
      localStorage.setItem(this.LS_FIRST_TS, Date.now().toString());
    }
  };

  calculateTimeOnSite = () => {
    const firstTs = parseInt(
      localStorage.getItem(this.LS_FIRST_TS) || Date.now().toString(),
      10,
    );
    return Math.floor((Date.now() - firstTs) / 1000);
  };

  // Adiciona contexto sobre a jornada do usuário a cada evento.
  // Isso enriquece os dados, permitindo análises de comportamento.
  getUserJourneyContext = () => {
    const journey = this.getLS(this.LS_JOURNEY, []);
    const safeJourney = Array.isArray(journey) ? journey : [];
    return {
      user_id: this.getUserId(),
      session_id: localStorage.getItem(this.LS_SESSION) || 'unknown',
      page_depth: safeJourney.length,
      time_on_site: this.calculateTimeOnSite(),
      returning_visitor: safeJourney.length > 1,
    };
  };

  // Retorna userId e sessionId para serem incluídos no nível do evento (não em properties).
  getUserSessionIds = () => {
    return {
      userId: this.getUserId(),
      sessionId: localStorage.getItem(this.LS_SESSION) || 'unknown',
    };
  };

  // ==========================
  // FILA E ENVIO DE EVENTOS
  // Orquestra o envio de eventos em lote para o backend.
  // Usa sendBeacon para envios confiáveis ao sair da página.
  // ==========================

  // Agenda o envio da fila de eventos.
  scheduleFlush = () => {
    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.flushTimer = setTimeout(this.flushQueue, this.FLUSH_INTERVAL);
  };

  // Adiciona um evento à fila e agenda o envio.
  queueEvent = (event) => {
    this.eventQueue.push(event);
    if (this.eventQueue.length >= this.MAX_QUEUE_SIZE) {
      this.flushQueue();
    } else {
      this.scheduleFlush();
    }
  };

  // Persiste eventos que falharam ao enviar para tentar novamente mais tarde.
  persistFailed = (events) => {
    if (!events?.length) return;
    const cur = this.getLS(this.LS_FAILED, []);
    const safeCur = Array.isArray(cur) ? cur : [];
    const merged = [...safeCur, ...events].slice(-this.FAILED_LIMIT);
    this.setLS(this.LS_FAILED, merged);
  };

  // Envia eventos usando fetch com keepalive, ideal para quando a página está sendo descarregada.
  sendBatchKeepalive = async (events) => {
    try {
      const res = await fetch(this.BATCH_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Site-Key': this.SITE_KEY,
        },
        body: JSON.stringify({ events }),
        keepalive: true, // Garante que a requisição continue mesmo se a página estiver sendo descarregada.
      });
      if (res.ok) {
        this.log('Lote enviado via fetch (keepalive):', events.length);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Envia um lote de eventos via fetch, com lógica de retry em caso de falha.
  sendBatch = async (events) => {
    if (!events?.length) return;
    try {
      const res = await fetch(this.BATCH_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Site-Key': this.SITE_KEY,
        },
        body: JSON.stringify({ events }),
        keepalive: true,
      });
      if (!res.ok) {
        // Tenta ler a mensagem de erro do backend para debug.
        let errorMessage = `HTTP ${res.status}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // Se não conseguir ler o JSON, usa a mensagem padrão.
        }
        throw new Error(errorMessage);
      }
      this.log('Lote enviado com sucesso:', events.length);
      this.backoffMs = 1000;
    } catch (err) {
      this.log('Falha ao enviar lote, persistindo para retry:', err);
      this.persistFailed(events);
      this.backoffMs = this.clamp(this.backoffMs * 2, 1000, this.BACKOFF_MAX);
      setTimeout(this.retryFailedEvents, this.backoffMs);
    }
  };

  // Descarrega a fila de eventos, enviando para o backend.
  flushQueue = () => {
    if (!this.eventQueue.length) return;
    const toSend = this.eventQueue.slice();
    this.eventQueue = [];
    this.sendBatch(toSend);
  };

  // Tenta reenviar eventos que falharam anteriormente.
  retryFailedEvents = () => {
    const failed = this.getLS(this.LS_FAILED, []);
    if (!failed || !Array.isArray(failed) || !failed.length) return;
    this.setLS(this.LS_FAILED, []); // Limpa a fila de falhas antes de tentar.
    this.sendBatch(failed);
  };

  // ==========================
  // CAPTURA PRINCIPAL DE EVENTOS
  // Ponto de entrada para todos os eventos rastreados.
  // ==========================
  capture = (eventName, properties = {}) => {
    if (this.disabled) return;
    try {
      const userSessionIds = this.getUserSessionIds();
      const event = {
        name: eventName,
        userId: userSessionIds.userId,
        sessionId: userSessionIds.sessionId,
        ts: Date.now(),
        // Adiciona o contexto da jornada do usuário a cada evento.
        properties: { ...properties, ...this.getUserJourneyContext() },
        context: {
          url: location.href,
          title: document.title,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          screen: { width: screen.width, height: screen.height },
          viewport: { width: innerWidth, height: innerHeight },
        },
      };
      this.queueEvent(event);
      this.log('Evento:', eventName, event.properties);
    } catch (e) {
      this.log('Erro ao capturar evento:', e);
    }
  };

  // ==========================
  // CONTEXTO DA PÁGINA
  // Funções para extrair informações do estado atual da página (e.g., código do imóvel).
  // ==========================
  getPropertyCodeFromPage = () => {
    // Tenta extrair o código do imóvel da URL, que é o método mais confiável.
    const m = location.pathname.match(/\/imovel\/(\d+)\//);
    if (m) return m[1];

    // Se estiver na página de obrigado, tenta extrair da query string.
    if (/\/obrigado\/?/.test(location.pathname)) {
      const qs = new URLSearchParams(location.search);
      const codigo = qs.get('codigo');
      if (codigo) return codigo;
    }

    // Como fallback, procura em links de formulário na página.
    const formBtn = document.querySelector('a[href*="codigo_imovel="]');
    if (formBtn) {
      const href = formBtn.getAttribute('href') || '';
      const mm = href.match(/codigo_imovel=(\d+)/);
      if (mm) return mm[1];
    }
    return '';
  };

  // ==========================
  // DELEGAÇÃO DE EVENTOS
  // Um único listener no 'document' para capturar eventos em elementos específicos.
  // Isso é mais performático do que adicionar um listener para cada elemento.
  // ==========================
  on = (type, selector, handler, opts) => {
    document.addEventListener(
      type,
      (ev) => {
        const el = ev.target && (ev.target.closest?.(selector) || null);
        if (!el) return;
        handler(ev, el);
      },
      opts,
    );
  };

  // ==========================
  // BINDINGS (VINCULAÇÃO DE EVENTOS)
  // Conecta as ações do usuário (e.g., cliques) à função de captura.
  // ==========================

  // Gerencia o ciclo de vida da página: retries e envio de eventos ao sair.
  bindGlobalLifecycle = () => {
    // Garante que eventos offline sejam enviados quando a conexão voltar.
    this.retryFailedEvents();
    window.addEventListener('online', this.retryFailedEvents);

    // Garante que eventos na fila sejam enviados se o usuário mudar de aba.
    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.visibilityState === 'hidden' && this.eventQueue.length) {
          const snapshot = this.eventQueue.slice();
          this.eventQueue = [];
          // Usa .then() porque não podemos usar await em um event listener.
          this.sendBatchKeepalive(snapshot).then((success) => {
            if (!success) {
              this.persistFailed(snapshot);
            }
          });
        }
      },
      { passive: true },
    );

    // Garante o envio final de eventos ao fechar a página.
    window.addEventListener('beforeunload', () => {
      const snapshot = this.eventQueue.slice();
      this.eventQueue = [];
      // O navegador completará a Promise mesmo se a página fechar.
      this.sendBatchKeepalive(snapshot).then((success) => {
        if (!success) {
          this.persistFailed(snapshot);
        }
      });
    });
  };

  // ====== LÓGICA DE CAPTURA DA BUSCA ======
  // Funções de ajuda para extrair valores dos diferentes tipos de campos de filtro.
  getVal = (id) => {
    const el = this.byId(id);
    return el && el.value ? String(el.value) : '';
  };

  getMultiSelect = (id) => {
    const el = this.byId(id);
    if (!el || !el.selectedOptions) return [];
    return Array.from(el.selectedOptions).map((o) => o.value);
  };

  getCheckedValues = (name) =>
    Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(
      (el) => el.value,
    );

  getSliderRangeFromVal = (value) => {
    const [min, max] = String(value || '').split(',');
    return { min: min || '0', max: max || 'unlimited' };
  };

  isChecked = (id) => {
    const el = this.byId(id);
    return !!(el && el.checked);
  };

  // Orquestra a captura de todos os filtros no momento do submit da busca.
  captureSearchSubmit = (source) => {
    const searchData = {
      source,
      timestamp: Date.now(),
      // Básicos
      finalidade: this.getVal('property-status'),
      tipos: this.getMultiSelect('residencial-property-type'),
      cidades: this.getMultiSelect('search-field-cidade'),
      bairros: this.getMultiSelect('search-field-cidadebairro'),
      // Avançados
      quartos: this.getCheckedValues('dormitorios[]'),
      suites: this.getCheckedValues('suites[]'),
      banheiros: this.getCheckedValues('banheiros[]'),
      vagas: this.getCheckedValues('vagas[]'),
      // Comerciais
      salas: this.getCheckedValues('salas[]'),
      galpoes: this.getCheckedValues('galpoes[]'),
      // Preço
      preco_venda: this.getSliderRangeFromVal(
        this.getVal('input-slider-valor-venda'),
      ),
      preco_aluguel: this.getSliderRangeFromVal(
        this.getVal('input-slider-valor-aluguel'),
      ),
      preco_min_manual: this.getVal('input-number-valor-min'),
      preco_max_manual: this.getVal('input-number-valor-max'),
      // Área
      area: this.getSliderRangeFromVal(this.getVal('input-slider-area')),
      area_min_manual: this.getVal('input-number-area-min'),
      area_max_manual: this.getVal('input-number-area-max'),
      // Switches
      mobiliado: this.isChecked('filtermobiliado'),
      semi_mobiliado: this.isChecked('filtersemimobiliado'),
      promocao: this.isChecked('filterpromocao'),
      imovel_novo: this.isChecked('filternovo'),
      na_planta: this.isChecked('filternaplanta'),
      em_construcao: this.isChecked('filterconstrucao'),
      aceita_permuta: this.isChecked('filterpermuta'),
      pet_friendly: this.isChecked('filterpet'),
      seguro_fianca: this.isChecked('filtersegfianca'),
      reservado: this.isChecked('filterproposta'),
      valor_total_pacote: this.isChecked('filterpacote'),
      // Comodidades
      comodidades: {
        ar_condicionado: this.isChecked('ArCondicionado-advanced'),
        lareira: this.isChecked('Lareira-advanced'),
        lavanderia: this.isChecked('Lavanderia-advanced'),
        sauna: this.isChecked('Sauna-advanced'),
        elevador: this.isChecked('Elevador-advanced'),
      },
      // Lazer
      lazer: {
        churrasqueira: this.isChecked('Churrasqueira-advanced'),
        piscina: this.isChecked('Piscina-advanced'),
        academia: this.isChecked('Academia-advanced'),
        playground: this.isChecked('Playground-advanced'),
        salao_festas: this.isChecked('SalaoFestas-advanced'),
        salao_jogos: this.isChecked('SalaoJogos-advanced'),
      },
      // Cômodos
      comodos: {
        area_servico: this.isChecked('AreaServico-advanced'),
        varanda: this.isChecked('Varanda-advanced'),
      },
      // Segurança
      seguranca: {
        alarme: this.isChecked('Alarme-advanced'),
        circuito_tv: this.isChecked('CircuitoFechadoTV-advanced'),
        interfone: this.isChecked('Interfone-advanced'),
        portaria_24h: this.isChecked('Portaria24Hrs-advanced'),
      },
      // Jornada
      journey_length: (() => {
        const journey = this.getLS(this.LS_JOURNEY, []);
        return Array.isArray(journey) ? journey.length : 0;
      })(),
    };

    this.capture('search_submit', searchData);
  };

  // ==========================
  // BINDINGS DE AÇÕES DO USUÁRIO
  // Conecta cliques em resultados, favoritos e conversões à captura de eventos.
  // ==========================
  bindResultsAndActions = () => {
    // Captura cliques nos resultados de busca para medir o interesse nos imóveis.
    this.on(
      'click',
      'a',
      (e, a) => {
        const href = String(a.getAttribute('href') || '');
        if (!href) return;

        if (href.includes('/imovel/')) {
          const m = href.match(/\/imovel\/(\d+)\//);
          const codigo = m ? m[1] : '';
          this.capture('results_item_click', {
            target: href,
            kind: 'imovel',
            codigo,
          });
        } else if (href.includes('/condominio/')) {
          this.capture('results_item_click', {
            target: href,
            kind: 'condominio',
          });
        } else if (a.classList.contains('button-info-panel')) {
          const box = a.closest('.imovel-box-single');
          const codigo = box?.getAttribute('data-codigo') || '';
          this.capture('results_saber_mais_click', { codigo, href });
        }
      },
      { passive: true },
    );

    // Captura o ato de favoritar um imóvel, um forte indicador de engajamento.
    this.on(
      'click',
      '.btn-favoritar, .btn-favoritar *',
      (_e, el) => {
        const btn = el.closest('.btn-favoritar');
        const codigo = btn?.getAttribute('data-codigo') || '';
        this.capture('favorite_toggle', {
          codigo,
          action: btn?.classList?.contains('favorited') ? 'remove' : 'add',
        });
      },
      { passive: true },
    );

    // Captura cliques no WhatsApp, o principal ponto de conversão.
    this.on(
      'click',
      'a[href^="https://wa.me"],a[href*="api.whatsapp.com"]',
      (_e, a) => {
        const codigo =
          a.closest('.imovel-box-single')?.getAttribute('data-codigo') || '';
        this.capture('conversion_whatsapp_click', {
          codigo,
          href: a.href || '',
        });
      },
      { passive: true },
    );

    // Adiciona listeners aos diferentes botões de submit de busca.
    const mainSubmit = this.byId('submit-main-search-form');
    if (mainSubmit)
      mainSubmit.addEventListener(
        'click',
        () => this.captureSearchSubmit('main_form'),
        { passive: true },
      );
    // Note: 'submit-main-search-form' ID was not found on the results page during validation (2025-11-27).
    // It might be present on the Home page. If not, this code block is safe to remove or ignore.

    const codeSubmit = this.byId('submit-main-search-form-codigo');
    if (codeSubmit)
      codeSubmit.addEventListener(
        'click',
        () => {
          const codigo = this.getVal('property-codigo');
          this.capture('search_submit', { source: 'codigo', codigo });
        },
        { passive: true },
      );

    document.querySelectorAll('.submit-sidebar-search-form').forEach((btn) => {
      btn.addEventListener(
        'click',
        () => this.captureSearchSubmit('sidebar_form'),
        { passive: true },
      );
    });
  };

  // Adiciona listeners específicos para a página de um imóvel.
  bindPropertyPage = () => {
    // Evita capturar visualização de imóvel na página de obrigado
    if (/\/obrigado\/?/.test(location.pathname)) return;

    const propertyCode = this.getPropertyCodeFromPage();
    if (!propertyCode) return;

    this.log('Página de propriedade detectada:', propertyCode);
    // Este é o evento que contabiliza uma visualização de imóvel.
    this.capture('property_page_view', {
      codigo: propertyCode,
      url: location.href,
      title: document.title,
    });

    // Captura o ato de favoritar na própria página do imóvel.
    const favBtn = document.querySelector('.clb-form-fixed-fav a[data-codigo]');
    if (favBtn)
      favBtn.addEventListener(
        'click',
        () => {
          const isFavorited = !!favBtn?.classList?.contains('favorited');
          this.capture('favorite_toggle', {
            codigo: propertyCode,
            action: isFavorited ? 'remove' : 'add',
          });
        },
        { passive: true },
      );
  };

  bindThankYouPage = () => {
    if (!/\/obrigado\/?/.test(location.pathname)) return;
    const qs = new URLSearchParams(location.search);
    const payload = {
      target: qs.get('target') || '',
      interesse: qs.get('interesse') || '',
      codigo: qs.get('codigo') || '',
      categoria: qs.get('categoria') || '',
      tipo: qs.get('tipo') || '',
      cidade: qs.get('cidade') || '',
      bairro: qs.get('bairro') || '',
      empreendimento: qs.get('empreendimento') || '',
      valor_venda: Number(qs.get('valor_venda') || 0),
      valor_aluguel: Number(qs.get('valor_aluguel') || 0),
      dormitorios: qs.get('dormitorios') || '',
      vagas: qs.get('vagas') || '',
      titulo_anuncio: qs.get('titulo_anuncio') || '',
      agencianome: qs.get('agencianome') || '',
    };
    this.capture('thank_you_view', payload);

    // Opcional: intercepta dataLayer.push para observar generate_lead
    const w = window;
    const origDL = w.dataLayer;
    if (Array.isArray(origDL)) {
      const origPush = origDL.push.bind(origDL);
      origDL.push = (...args) => {
        args.forEach((evt) => {
          if (
            evt &&
            (evt.event === 'gtm.formSubmit' || evt.ga_event === 'generate_lead')
          ) {
            this.capture('conversion_generate_lead', { ...evt, ...payload });
          }
        });
        return origPush(...args);
      };
    }
  };

  // ==========================
  // INICIALIZAÇÃO
  // Orquestra a execução de todos os bindings e configurações iniciais.
  // ==========================
  init = () => {
    if (this.disabled) return;

    // Inicialização
    this.ensureFirstTs();
    this.trackPageView();

    // Logs
    this.log('Inicializando analytics...');
    this.log('API URL:', this.API_URL);
    this.log('Site Key:', this.SITE_KEY);

    // Garante que a sessão seja iniciada ou renovada.
    this.getSessionId();

    // Ativa todos os listeners de eventos.
    this.bindGlobalLifecycle();
    this.bindResultsAndActions();
    this.bindPropertyPage();
    this.bindThankYouPage(); // Adicionado aqui

    // Expõe uma API pública no objeto window para depuração ou integrações externas.
    window.MyAnalytics = {
      ...window.MyAnalytics,
      capture: this.capture,
      getUserId: this.getUserId,
      getSessionId: this.getSessionId,
      getJourney: () => this.getLS(this.LS_JOURNEY, []),
      getPropertyCode: this.getPropertyCodeFromPage,
      clearJourney: () => {
        localStorage.removeItem(this.LS_JOURNEY);
        localStorage.removeItem(this.LS_FIRST_TS);
        localStorage.removeItem(this.LS_SESSION);
        localStorage.removeItem(this.LS_TIMEOUT);
      },
      flush: this.flushQueue,
      debug: this.debug,
    };

    this.log('Analytics avançado inicializado ✓');
    this.log('User ID:', this.getUserId());
    this.log('Session ID:', this.getSessionId());
  };
}

// ==========================
// BOOTSTRAP
// Garante que o script seja executado após o carregamento do DOM.
// ==========================
(() => {
  const analytics = new InsightHouseAnalytics({
    apiUrl: window.IH_API_URL,
    siteKey: window.IH_SITE_KEY,
    debug: false,
  });

  // Helper para executar o init() quando o DOM estiver pronto.
  const onReady = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  };

  onReady(() => analytics.init());
})();
