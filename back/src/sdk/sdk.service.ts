import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SdkService {
  private readonly logger = new Logger(SdkService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Busca a configuração do site para o SDK
   * @param siteKey Chave do site
   * @returns Configuração do site
   */
  async getSiteConfig(siteKey: string) {
    const site = await this.prisma.site.findUnique({
      where: { siteKey },
      include: {
        domains: {
          select: { host: true },
        },
        settings: {
          select: { key: true, value: true },
        },
      },
    });

    if (!site) {
      throw new NotFoundException('Site não encontrado');
    }

    if (site.status !== 'active') {
      throw new NotFoundException('Site não está ativo');
    }

    // Pega o host da API da config
    const apiHost = this.configService.get<string>('api.baseUrl');

    // Converte array de configurações em objeto
    const settingsObj = site.settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      },
      {} as Record<string, string>,
    );

    return {
      siteKey: site.siteKey,
      allowedDomains: site.domains.map((d) => d.host),
      apiHost,
      consentDefault: settingsObj.consentDefault || 'opt-out',
      settings: settingsObj,
    };
  }

  /**
   * Gera o script loader do SDK
   * @param siteKey Chave do site
   * @returns Código JavaScript do loader
   */
  async getLoader(siteKey: string) {
    // Verifica se o site existe
    const site = await this.prisma.site.findUnique({
      where: { siteKey },
      select: { id: true, status: true },
    });

    if (!site) {
      throw new NotFoundException('Site não encontrado');
    }

    if (site.status !== 'active') {
      throw new NotFoundException('Site não está ativo');
    }

    const apiHost = this.configService.get<string>('api.baseUrl');

    // Gera o script do loader
    const loaderScript = `
(function() {
  'use strict';

  var SITE_KEY = '${siteKey}';
  var API_URL = '${apiHost}';

  // Verifica se já está carregado
  if (window.__INSIGHTHOUSE_LOADED__) {
    console.warn('InsightHouse SDK já carregado');
    return;
  }
  window.__INSIGHTHOUSE_LOADED__ = true;

  // Define variáveis globais para o script do SDK
  window.IH_SITE_KEY = SITE_KEY;
  window.IH_API_URL = API_URL;

  // Busca a configuração do site
  fetch(API_URL + '/api/sdk/site-config?site=' + SITE_KEY)
    .then(function(res) {
      if (!res.ok) throw new Error('Falha ao carregar config do site');
      return res.json();
    })
    .then(function(config) {
      // Valida o domínio
      var currentHost = window.location.hostname.toLowerCase();
      var allowed = config.allowedDomains.map(function(d) { return d.toLowerCase(); });

      if (allowed.indexOf(currentHost) === -1) {
        console.warn('InsightHouse: Domínio não permitido:', currentHost);
        return;
      }

      // Salva a config globalmente
      window.__INSIGHTHOUSE_CONFIG__ = config;

      // Carrega o script principal do SDK do endpoint na API backend
      // O arquivo capture-filters.js é servido pelo endpoint /api/sdk/capture-filters.js
      var script = document.createElement('script');
      script.src = API_URL + '/api/sdk/capture-filters.js';
      script.async = true;
      // script.onload = function() {
      //   console.log('[InsightHouse] SDK carregado');
      // };
      // script.onerror = function() {
      //   console.error('[InsightHouse] Falha ao carregar o SDK');
      // };
      document.head.appendChild(script);
    })
    .catch(function(err) {
      console.error('Erro na inicialização do InsightHouse:', err);
    });
})();
`;

    this.logger.log(`Loader gerado para o site: ${siteKey}`);

    return loaderScript;
  }
}
