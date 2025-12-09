# Documentação Técnica do Tracker JavaScript (InsightHouse)

Este documento descreve a arquitetura, lógica interna e funcionamento do script de rastreamento do cliente (`tracker.js`), responsável pela coleta de dados de analytics no frontend.

## 1. Visão Geral

O `tracker.js` é um script vanilla JavaScript (ES5+) leve, projetado para ser embutido em sites imobiliários de terceiros. Ele opera de forma assíncrona, capturando eventos de navegação, interação e conversão, e enviando-os para a API de ingestão do InsightHouse.

## 2. Mecanismo de Disponibilização

O script pode ser carregado de duas formas, garantindo flexibilidade e compatibilidade:

1.  **Via Loader (Recomendado):**
    *   Endpoint: `GET /api/sdk/loader?site=SITE_KEY`
    *   O loader injeta configurações dinâmicas e carrega assincronamente o arquivo principal via URL estática.
2.  **Via Arquivo Estático (Alta Performance):**
    *   **Método Principal**: O loader aponta para este endpoint.
    *   **Minificação**: Em produção, este endpoint serve automaticamente a versão minificada (`tracker.min.js`) para segurança e performance.

## 3. Arquitetura Interna

O script é organizado em módulos funcionais isolados dentro de uma *IIFE* (Immediately Invoked Function Expression) para evitar poluição do escopo global.

### 3.1 Módulos Principais

*   **CONFIG**: Centraliza constantes como `API_URL`, `SITE_KEY`, intervalos de envio (`FLUSH_INTERVAL`) e limites de fila (`MAX_QUEUE_SIZE`).
*   **UserSession**: Gerencia a identidade do usuário e sessão.
    *   `userId`: Persistente (localStorage), gerado aleatoriamente se não existir.
    *   `sessionId`: Temporário, expira após 30 minutos de inatividade (`SESSION_TIMEOUT`).
    *   `journey`: Histórico de navegação (últimas 50 URLs/Titles) para contexto.
    *   `UTMs`: Captura persistente de tags UTM (`source`, `medium`, `campaign`) da primeira visita.
    *   `failed_events`: Armazenamento temporário para retry de eventos que falharam no envio.
    *   `last_activity`: Timestamp para controle de timeout da sessão.
*   **DomScraper**: Responsável por ler o DOM da página para extrair dados contextuais.
    *   Identifica IDs de imóveis na URL (ex: `/imovel/123/`).
    *   **Filtros de Busca**: Captura estado de inputs complexos:
        *   Range Sliders (preço, área)
        *   Multi-selects e Checkboxes (cidade, bairro, características)
        *   Flags booleanas (mobiliado, novo)
    *   **Thank You Page**: Captura dados de conversão via query params (`valor_venda`, `interesse`, `lead_id`).
*   **EventBuilder**: Padroniza a estrutura dos eventos.
    *   Adiciona metadados automáticos: Timestamp, UserAgent, Dimensões de tela, Referrer.
    *   Anexa o contexto de sessão e jornada a cada evento.
*   **Transport**: Gerencia o envio de dados.
    *   **Fila (Queue)**: Eventos são enfileirados em memória.
    *   **Batching**: O envio ocorre quando a fila atinge 10 itens ou a cada 3 segundos (o que ocorrer primeiro).
    *   **Beacon/Keepalive**: Usa `fetch` com `keepalive: true` para garantir envio mesmo durante navegação (unload).
    *   **Retry**: Persiste eventos falhos no localStorage e tenta reenviar na próxima carga de página.
*   **Collector**: Ponto de entrada e *binding* de eventos.
    *   Inicializa a sessão.
    *   Captura eventos globais (`click`, `visibilitychange`, `pagehide`).
    *   Captura eventos específicos de página (`view_property`, `search`, `submit_lead_form`).

## 4. Eventos Capturados

### Automáticos
*   `view_property`: Disparado ao acessar uma URL de detalhe de imóvel.
*   `submit_lead_form`: Disparado ao acessar a página de agradecimento (detectado por URL).

### Interações (Delegated Listeners)
*   `click_property_card`: Clique em qualquer link que leve a um imóvel.
*   `toggle_favorite`: Clique em botões com a classe `.btn-favoritar`.
*   `click_contact`: Clique em links de WhatsApp (`wa.me`, `api.whatsapp.com`).
*   `search`: Disparado ao clicar em botões de busca (IDs/Classes mapeadas: `#submit-main-search-form`, `.submit-sidebar-search-form`).

## 5. Fluxo de Dados

1.  **Captura**: `Collector.capture(nome, payload)`
2.  **Construção**: `EventBuilder` enriquece com dados de sessão e dispositivo.
3.  **Fila**: `Transport.enqueue(evento)` adiciona à fila em memória.
4.  **Agendamento**: `Transport.scheduleFlush()` inicia timer de 3s.
5.  **Envio**: `Transport.flush()` envia o lote via `POST /api/events/track/batch`.
6.  **Confirmação**:
    *   **Sucesso**: Fila limpa.
    *   **Erro**: Eventos salvos em `ih_failed_events` (localStorage) para retentativa futura.

## 6. Depuração

O script expõe uma API global para debug se `CONFIG.DEBUG` estiver ativo:
```javascript
window.IH_Analytics_v2.capture('test_event', { foo: 'bar' });
window.IH_Analytics_v2.flush();
console.log(window.IH_Analytics_v2.getConfig());
```
