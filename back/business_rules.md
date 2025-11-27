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

### Demanda vs Oferta (Demand vs Supply)
Esta é uma análise complexa que compara o que é buscado com o que existe no site.

*   **Oferta (Supply):**
    1.  Busca o **Sitemap XML** do site (`/xml/{dominio}/sitemap-imoveis.xml`) para obter a lista de códigos de imóveis ativos.
    2.  Para cada código ativo, busca o evento `property_page_view` mais recente no banco de dados para inferir suas características (ex: número de quartos).
    3.  Agrega a contagem de imóveis por categoria (atualmente focado em "Quartos").
*   **Demanda (Demand):**
    *   Agrega os filtros de "Quartos" utilizados nos eventos de busca (`search_submit`).
*   **Gap Score (Oportunidade):**
    *   Calcula a diferença percentual entre Demanda e Oferta.
    *   `Gap = % Demanda - % Oferta`
    *   **Positivo:** Muita procura, pouco imóvel (Oportunidade).
    *   **Negativo:** Muito imóvel, pouca procura (Sobrecarga).

---

## Perguntas Essenciais para Entendimento
Ao analisar ou modificar estes controllers, faça as seguintes perguntas:

1.  **Definição de Sessão:** O `sessionId` está sendo gerado e mantido corretamente no frontend? A quebra de sessão afeta diretamente métricas como "Visitantes Únicos" e "Taxa de Conversão".
2.  **Nomes de Eventos:** Os nomes dos eventos (`search_submit`, `property_page_view`, etc.) correspondem exatamente ao que o frontend envia? Mudanças no frontend podem quebrar essas regras.
3.  **Estrutura do JSON `properties`:** As regras dependem fortemente da estrutura do objeto `properties` dentro do evento. Ex: `properties->>'quartos'` vs `properties->'quartos'->>0`. A consistência desses dados é crucial.
4.  **Sitemap:** A lógica de "Oferta" depende do sitemap estar acessível e atualizado. Se o sitemap falhar, a análise de "Demand vs Supply" retornará dados incompletos.
5.  **Filtros de Data:** Todas as queries respeitam o `dateRange`? A conversão de datas (UTC vs Local) está sendo tratada consistentemente?
