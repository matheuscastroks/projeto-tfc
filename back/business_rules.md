# Regras de Negócio do Backend

Este documento detalha as regras de negócio, definições de métricas e lógica de processamento de dados implementadas nos controllers e services do backend (`src/insights`).

## 1. Visão Geral (Overview)
**Arquivo:** `src/insights/overview/overview.service.ts`

Este serviço fornece os KPIs globais e o funil principal do dashboard.

### Definições de Métricas
*   **Visitantes Únicos (Unique Visitors):**
    *   Contagem distinta de `sessionId` na tabela de eventos.
    *   Representa o número de sessões únicas no período selecionado.
*   **Leads Gerados:**
    *   Contagem de eventos com os seguintes nomes:
        *   `conversion_whatsapp_click` (Clique no botão de WhatsApp)
        *   `thank_you_view` (Visualização da página de agradecimento após formulário)
        *   `conversion_generate_lead` (Evento genérico de geração de lead)
*   **Taxa de Conversão (Conversion Rate):**
    *   Fórmula: `(Leads Gerados / Visitantes Únicos) * 100`
*   **Média de Visualizações por Sessão (Avg Properties Viewed):**
    *   Fórmula: `(Total de eventos 'property_page_view' / Visitantes Únicos)`
*   **Total de Favoritos:**
    *   Contagem de eventos `favorite_toggle` onde a ação é `add` (adicionar aos favoritos).

### Funil de Vendas Global
O funil é composto por 5 etapas sequenciais. A taxa de abandono (dropoff) é calculada entre cada etapa.

1.  **Busca:** Evento `search_submit`.
2.  **Clique em Resultado:** Evento `results_item_click`.
3.  **Visualização de Imóvel:** Evento `property_page_view`.
4.  **Favorito:** Evento `favorite_toggle` (ação `add`).
5.  **Lead:** Eventos de conversão (`conversion_whatsapp_click`, `thank_you_view`, etc.).

---

## 2. Conversão (Conversion)
**Arquivo:** `src/insights/conversion/conversion.service.ts`

Foca na análise detalhada das conversões e perfil dos leads.

### Regras Específicas
*   **Tipos de Conversão:**
    *   `thank_you_view` → Mapeado como "Formulário da página do imóvel".
    *   `conversion_whatsapp_click` → Mapeado como "Botão de WhatsApp".
*   **Taxa de Conversão (Variante):**
    *   Neste serviço, a taxa é calculada sobre o **Total de Sessões** (`sessionId` distintos), que é tecnicamente igual a Visitantes Únicos no contexto de sessão, mas a implementação é separada.
*   **Perfil do Lead:**
    *   Baseado exclusivamente em eventos `thank_you_view`.
    *   Extrai metadados do evento (`properties`) para identificar:
        *   Interesses principais
        *   Categorias mais convertidas
        *   Tipos de imóvel
        *   Cidades
        *   Valor médio de venda e aluguel (ignora valores zerados).

---

## 3. Jornada do Usuário (Journey)
**Arquivo:** `src/insights/journey/journey.service.ts`

Analisa o comportamento de navegação dentro das sessões.

### Definições
*   **Tempo Médio no Site:**
    *   Calculado como a diferença entre o último (`MAX(ts)`) e o primeiro (`MIN(ts)`) evento de uma sessão.
    *   Considera apenas sessões com mais de 1 evento.
*   **Profundidade Média (Avg Page Depth):**
    *   Média de "page views" por sessão.
    *   Eventos considerados como page view: `property_page_view`, `search_submit`, `home_view`, `results_view`.
*   **Visitantes Recorrentes:**
    *   Percentual de usuários (`userId`) no período selecionado que **já tiveram eventos registrados anteriormente** (antes da data de início do filtro).
    *   *Nota: Depende da persistência do `userId` (cookies/login).*

---

## 4. Imóveis (Property)
**Arquivo:** `src/insights/property/property.service.ts`

Analisa o desempenho individual dos imóveis.

### Métricas e Classificações
*   **Imóveis Populares:**
    *   Ordenados por visualizações (`property_page_view`).
    *   **Score de Engajamento:** `(Visualizações * 1) + (Favoritos * 3)`.
*   **Funil do Imóvel:**
    *   Funil específico para um código de imóvel: Visualizações → Favoritos → Leads.
    *   Calcula a taxa de conversão específica do imóvel (Visualização p/ Lead).
*   **Imóveis com Baixo Desempenho (Underperforming):**
    *   Critério: Mais de 10 visualizações, mas baixo número de leads.
    *   Ordenação: Menor número de leads primeiro, depois maior número de visualizações (muita vitrine, pouca ação).
*   **Imóveis Estagnados (Stagnant):**
    *   Critério: Menos de 50 visualizações E visto pela primeira vez há mais de 30 dias.
    *   Indica imóveis "encalhados" ou com pouca visibilidade há muito tempo.

---

## 5. Busca e Demanda (Search)
**Arquivo:** `src/insights/search/search.service.ts`

Analisa o que os usuários estão procurando e compara com o estoque.

### Análise de Busca
*   **Total de Buscas:** Contagem de eventos `search_submit`.
*   **Filtros Mais Usados:**
    *   Extrai e conta valores de filtros como: Finalidade, Tipo, Cidade, Bairro, Quartos, Suítes, Vagas, Faixas de Preço, etc.
    *   **Normalização:** Capitaliza palavras e remove hífens/underscores para agrupar termos similares.
*   **Combinações de Filtros:**
    *   Identifica quais filtros são usados em conjunto (ex: "Apartamento + 3 Quartos + Venda").
    *   Ignora combinações com menos de 2 filtros.
*   **Filtros que Convertem:**
    *   Cruza sessões que fizeram busca (`search_submit`) com sessões que converteram (`thank_you_view`, etc.).
    *   Identifica quais critérios de busca levam a mais leads.


---

## Perguntas Essenciais para Entendimento
Ao analisar ou modificar estes controllers, faça as seguintes perguntas:

1.  **Definição de Sessão:** O `sessionId` está sendo gerado e mantido corretamente no frontend? A quebra de sessão afeta diretamente métricas como "Visitantes Únicos" e "Taxa de Conversão".
2.  **Nomes de Eventos:** Os nomes dos eventos (`search_submit`, `property_page_view`, etc.) correspondem exatamente ao que o frontend envia? Mudanças no frontend podem quebrar essas regras.
3.  **Estrutura do JSON `properties`:** As regras dependem fortemente da estrutura do objeto `properties` dentro do evento. Ex: `properties->>'quartos'` vs `properties->'quartos'->>0`. A consistência desses dados é crucial.
5.  **Filtros de Data:** Todas as queries respeitam o `dateRange`? A conversão de datas (UTC vs Local) está sendo tratada consistentemente?

---

## 6. Categorias de Eventos (Categories)
**Arquivo:** `src/insights/categories/event-categories.ts`

Organiza os tipos de eventos capturados em categorias lógicas para facilitar a análise e filtragem.

### Categorias Definidas
*   **SEARCH (`search`):** Eventos relacionados a buscas realizadas pelo usuário.
*   **NAVIGATION (`navigation`):** Eventos de navegação, como visualização de imóveis ou cliques em cards.
*   **CONVERSION (`conversion`):** Eventos que representam uma conversão ou intenção clara de contato.
*   **PROPERTY (`property`):** Eventos de engajamento direto com o imóvel, como favoritar.

### Mapeamento Atual
| Evento | Categoria |
| :--- | :--- |
| `search` | SEARCH |
| `click_property_card` | NAVIGATION |
| `view_property` | NAVIGATION |
| `toggle_favorite` | PROPERTY |
| `click_contact` | CONVERSION |
| `submit_lead_form` | CONVERSION |

## Diagramas de Fluxo (Mermaid)

### Overview – Cálculo de KPIs Globais e Funil

```mermaid
flowchart TD
  Start_Overview[[Start Overview Aggregation]] --> LoadEvents[Load events filtered by site and date range]
  LoadEvents --> UniqueSessions[Compute distinct sessionId]
  UniqueSessions --> UniqueVisitors[Unique Visitors = count(sessionId)]

  LoadEvents --> LeadEvents[Filter lead events\nconversion_whatsapp_click · thank_you_view · conversion_generate_lead]
  LeadEvents --> LeadsCount[Leads Generated = count(lead events)]

  LoadEvents --> PropertyViews[Filter events name = property_page_view]
  PropertyViews --> ViewsPerSession[Group by sessionId and count]
  ViewsPerSession --> AvgViews[Avg Properties Viewed = total_views / Unique Visitors]

  LoadEvents --> FavoriteEvents[Filter favorite_toggle where action = add]
  FavoriteEvents --> FavoritesCount[Total Favorites = count(events)]

  UniqueVisitors --> ConversionRate[(Conversion Rate = Leads / Unique Visitors * 100)]
  LeadsCount --> ConversionRate

  ConversionRate --> KPIs[Return overview KPIs JSON]
```

```mermaid
flowchart LR
  Search[search_submit\n(Search performed)] --> Click[results_item_click\n(Result click)]
  Click --> View[property_page_view\n(Property view)]
  View --> Favorite[favorite_toggle (add)\n(Add to favorites)]
  Favorite --> Lead[Lead events\nwhatsapp / thank_you_view / generate_lead]

  Search -->|dropoff 1| Drop1[(Abandon after search)]
  Click -->|dropoff 2| Drop2[(Abandon after click)]
  View -->|dropoff 3| Drop3[(Abandon after property view)]
  Favorite -->|dropoff 4| Drop4[(Abandon after favorite)]
```

### Conversion – Taxas por Tipo e Perfil de Lead

```mermaid
flowchart TD
  StartConv[[Start Conversion Analytics]] --> LoadSessions[Load events filtered by site/date]
  LoadSessions --> DistinctSessions[Compute distinct sessionId]
  DistinctSessions --> TotalSessions[Total Sessions]

  LoadSessions --> ConvEvents[Filter conversion events\nthank_you_view · conversion_whatsapp_click]
  ConvEvents --> MapTypes[Map event name to conversion type]
  MapTypes --> ConvAgg[Aggregate by type\n(count, rate)]

  ConvEvents --> TYEvents[Filter only thank_you_view]
  TYEvents --> ExtractProps[Extract properties\n(city, type, category, price, rent)]
  ExtractProps --> LeadProfileAgg[Aggregate lead profile metrics]

  TotalSessions --> ConvRate[(Conversion Rate = total_conversions / Total Sessions)]
  ConvAgg --> ConvRate

  ConvRate --> ResultConv[Return conversion KPIs + breakdown]
  LeadProfileAgg --> ResultConv
```

### Journey – Tempo, Profundidade e Recorrência

```mermaid
flowchart TD
  StartJourney[[Start Journey Analytics]] --> LoadJourneyEvents[Load events by site/date]

  LoadJourneyEvents --> GroupBySession[Group events by sessionId]

  GroupBySession --> TimePerSession[Compute time per session\nMAX(ts) - MIN(ts)]
  TimePerSession --> AvgTimeOnSite[Average time on site]

  GroupBySession --> PageViewEvents[Filter page view events\nproperty_page_view · search_submit · home_view · results_view]
  PageViewEvents --> DepthPerSession[Count page views per session]
  DepthPerSession --> AvgDepth[Average page depth]

  LoadJourneyEvents --> CurrentPeriodUsers[Compute distinct userId in period]
  CurrentPeriodUsers --> CheckHistory[Check events before start date per user]
  CheckHistory --> ReturningUsers[Returning users count]
  ReturningUsers --> RecurringRate[(Recurring visitors % = Returning / Current)]

  AvgTimeOnSite --> JourneyKPIs[Return journey KPIs]
  AvgDepth --> JourneyKPIs
  RecurringRate --> JourneyKPIs
```

### Property – Engajamento e Segmentação de Imóveis

```mermaid
flowchart TD
  StartProperty[[Start Property Analytics]] --> LoadPropertyEvents[Load events filtered by site/date]

  LoadPropertyEvents --> PV[Filter property_page_view]
  PV --> ViewsByProperty[Group views by propertyCode]

  LoadPropertyEvents --> Fav[Filter favorite_toggle (add)]
  Fav --> FavoritesByProperty[Group favorites by propertyCode]

  ViewsByProperty --> EngagementScore[(Engagement score = views * 1 + favorites * 3)]
  FavoritesByProperty --> EngagementScore

  EngagementScore --> PopularProps[Sort properties by engagement score]

  ViewsByProperty --> Underperforming[Filter properties\nviews > 10 AND leads low]
  ViewsByProperty --> Stagnant[Filter properties\nviews < 50 AND firstSeen > 30 days ago]

  PopularProps --> ResultProperty[Return popular + underperforming + stagnant lists]
  Underperforming --> ResultProperty
  Stagnant --> ResultProperty
```

### Search – Filtros, Combinações e Filtros que Convertem

```mermaid
flowchart TD
  StartSearch[[Start Search Analytics]] --> LoadSearchEvents[Load events filtered by site/date]

  LoadSearchEvents --> SearchSubmit[Filter search_submit events]
  SearchSubmit --> TotalSearches[Total Searches = count(search_submit)]

  SearchSubmit --> ExtractFilters[Extract filter fields\n(purpose, type, city, priceRange, rooms, etc.)]
  ExtractFilters --> Normalize[Normalize values\n(capitalize, remove hyphens/underscores)]
  Normalize --> TopFilters[Count occurrences per filter value]

  ExtractFilters --> Combos[Build filter combinations\n(only combos with >= 2 filters)]
  Combos --> ComboAgg[Aggregate and rank combinations]

  LoadSearchEvents --> SearchSessions[Sessions with search_submit]
  SearchSessions --> JoinConversions[Join with sessions that converted\n(thank_you_view, etc.)]
  JoinConversions --> ConvertingFilters[Identify filters that correlate with conversions]

  TotalSearches --> SearchKPIs[Return search analytics JSON]
  TopFilters --> SearchKPIs
  ComboAgg --> SearchKPIs
  ConvertingFilters --> SearchKPIs
```
