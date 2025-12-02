# Insighthouse (SaaS de Analytics Imobiliário)

Um SaaS de analytics multi-tenant para sites imobiliários. Oferece onboarding de clientes, configuração de sites, um loader first-party servido por esta aplicação e uma UI de dashboard para operadores.

## Resumo Executivo

O Insighthouse permite que qualquer site imobiliário utilize um loader de analytics first-party que captura interações de busca (filtros, cidade, faixas de preço, etc.), envia para o backend e expõe insights prontos para operadores em uma UI administrativa. O sistema é multi-tenant: cada cliente possui um "Site" com domínios e configurações. A aplicação roda em Next.js (App Router) e persiste metadados em PostgreSQL (Supabase).

## Estrutura do Projeto

- `src/app/` — App Next.js com App Router (rotas de API em `src/app/api/*`)
- `src/lib/` — utilitários compartilhados no servidor (cliente Prisma, helpers de site)
- `public/static/` — assets estáticos first-party servidos pela aplicação
  - `capture-filtros.js` — script genérico de captura para filtros de busca e conversões
- `prisma/` — schema e migrations do Prisma

## Variáveis de Ambiente

Crie um arquivo `.env` em `insighthouse/` (mesma pasta deste README). Comece a partir de `env.example` e ajuste:

- `SITE_URL` — URL base da aplicação (ex.: `http://localhost:3000`)
- `DATABASE_URL` — String de conexão PostgreSQL. Para Supabase em ambientes serverless (Vercel), use a conexão pooled (PgBouncer, porta 6543) com `?pgbouncer=true&connection_limit=1&sslmode=require`.
- `DIRECT_URL` — String de conexão direta (sem pool), usada pelo Prisma Migrate. Para Supabase, use o host direto (porta 5432) com `?sslmode=require`.
- `NEXTAUTH_SECRET` — Placeholder para uso futuro de autenticação

## Desenvolvimento Local

1) Instale as dependências na raiz do monorepo:
```
pnpm i
```

2) Opção A — Usando Supabase (recomendado):
   - Crie um projeto Supabase e vá para as configurações de Database.
   - Copie a string de conexão pooled (PgBouncer, geralmente porta 6543) para `DATABASE_URL` com `?pgbouncer=true&connection_limit=1&sslmode=require`.
   - Copie a string de conexão direta (porta 5432) para `DIRECT_URL` com `?sslmode=require`.
   - Aplique as migrations do Prisma no Supabase (não-interativo):
```
cd insighthouse
pnpm prisma:deploy
```

3) Opção B — PostgreSQL local (Docker):
```
docker run --name realty_analytics_postgres_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=realty_analytics \
  -p 5433:5432 -d postgres:15-alpine
```

Então configure `DATABASE_URL` como `postgresql://postgres:postgres@localhost:5433/realty_analytics` e rode as migrations:
```
cd insighthouse
pnpm prisma:migrate
```

4) Rode o servidor de desenvolvimento:
```
pnpm dev
```

- Local: `http://localhost:3000`

### Expondo o loader em desenvolvimento (HTTPS)

Sites reais geralmente rodam em HTTPS. Para embedar o loader da sua aplicação local, exponha-a com um túnel e use a origem do túnel no snippet:

- Ngrok: `ngrok http 3000` → `<script async src="https://SEU-ID.ngrok-free.app/api/sdk/loader?site=SITE_KEY&debug=1"></script>`
- Alternativamente, faça deploy na Vercel e use a origem de produção no snippet.

Garanta que o site cliente permite sua origem na Content-Security-Policy (CSP):
- `script-src`: inclua a origem da sua aplicação (Vercel/ngrok)

## Loader & Configuração do Site

- Endpoint do loader: `GET /api/sdk/loader?site=SITE_KEY`
  - Valida o `location.hostname` atual contra os domínios permitidos da configuração do site
  - Resolve a origem da aplicação a partir do próprio script do loader (funciona cross-domain)
  - Injeta `capture-filtros.js`
  - Suporta `?debug=1` para habilitar logs verbosos e `MyAnalytics.debug`

- Endpoint de configuração do site: `GET /api/sdk/site-config?site=SITE_KEY`
  - Retorna `{ allowedDomains, groupEnabled, options, consentDefault }`

### Snippet de Instalação (Site Cliente)

Coloque antes do fechamento do `</head>`:
```
<script async src="https://SEU-DOMINIO-APP/api/sdk/loader?site=SITE_KEY"></script>
```

Para testes locais:
```
<script async src="http://localhost:3000/api/sdk/loader?site=SITE_KEY"></script>
```

Para habilitar logs de debug no console do cliente:
```
window.MyAnalytics = window.MyAnalytics || {};
window.MyAnalytics.debug = true;
```

## Eventos Capturados (Manuais)

- `search_filter_changed` — `{ field, value }`
- `search_filter_city` — `{ cidade }`
- `search_filter_type` — `{ tipo }`
- `search_filter_bairro` — `{ bairro }`
- `search_submit` — `{ source, finalidade, preco_min, preco_max, area_min, area_max }`
- `results_item_click` — `{ target, kind: 'imovel' | 'condominio' }`
- `conversion_whatsapp_click` / `conversion_phone_click` / `conversion_email_click` / `conversion_lead_submit`

## API (SaaS)

- `POST /api/sites` — cria site, gera `siteKey`, retorna `loaderUrl`
- `POST /api/sites/:id/domains` — adiciona domínio/alias
- `GET  /api/insights/top-cidades?site=SITE_KEY` — retorna agregados de cidades
- `GET  /api/insights/overview?site=SITE_KEY` — retorna agregados de finalidade, tipos, cidades, bairros, faixas de preço/área, quartos, flags

## Consentimento & LGPD

- Configuração por site `consent_default` (`opt_in` ou `opt_out`)
- O loader respeita o padrão e permite controle em runtime via `window.__MYANALYTICS_CONSENT__`

## Arquitetura

- Next.js 15 (App Router) hospeda a UI administrativa e endpoints públicos do loader
- Prisma + PostgreSQL para metadados multi-tenant (Users, Sites, Domains, Settings)
- Loader first-party serve `capture-filtros.js` em `public/static`

### Fluxo de Dados (ponta a ponta)

1. Site embeda o snippet apontando para o loader do Insighthouse.
2. Loader busca `site-config`, valida `allowedDomains`, injeta `capture-filtros.js`.
3. Interações do usuário disparam eventos (ex.: `search_filter_city`, `search_filter_changed`).
4. Eventos são enviados para o backend próprio para análise.
5. Admin visita o Dashboard. Rotas de API consultam dados processados e computam insights para o `SITE_KEY` dado.
6. Resultados são renderizados como cards/tabelas.

```mermaid
flowchart TD
  ClientSite[Real estate website] --> Snippet[Loader snippet\n<script ...loader?site=SITE_KEY>]
  Snippet --> LoaderEndpoint[/GET /api/sdk/loader/]
  LoaderEndpoint --> ValidateDomain[Validate location.hostname\nagainst allowedDomains]
  ValidateDomain --> InjectScript[Inject capture-filtros.js]
  InjectScript --> Capture[Capture search & conversion events]
  Capture --> EventsBackend[/POST /api/events/track or /batch/]

  Admin[Admin user] --> Dashboard[Next.js Admin Dashboard]
  Dashboard -->|React Query hooks| InsightsAPI[/GET /api/insights/*?site=SITE_KEY/]
  InsightsAPI --> Charts[Cards, tables, charts]
```

### Fluxo de Dados do Dashboard com React Query

```mermaid
flowchart LR
  Page[Next.js App Router page\n(Server Component)] --> Hydrate[HydrationBoundary\n+ QueryClient.dehydrate]
  Hydrate --> DashboardClient[Dashboard Client Component]

  subgraph ReactQuery[React Query Layer]
    Hooks[Custom hooks\nuseSites · useOverview · useProperties]
    Cache[Query Cache]
  end

  DashboardClient --> Hooks
  Hooks --> APIClient[API client\n(fetch /api/* with credentials)]
  APIClient --> Backend[/NestJS backend /api routes/]
  Hooks --> Cache
  Cache --> DashboardClient
```

### Modelo de Banco de Dados (Prisma)

- `User`: dono da conta (raiz multi-tenant)
- `Site`: um site tenant com `siteKey`, `status`, dono (`userId`)
- `Domain`: domínios permitidos por site (enforcement de whitelist para o loader)
- `Setting`: key/value para opções por site (ex.: `consent_default`)

### Segurança & Isolamento

- Controle do loader via `allowedDomains`: previne hotlinking de origens não autorizadas.
- Conexões pooled para serverless (`DATABASE_URL`), conexão direta apenas para migrations (`DIRECT_URL`).

### Topologia de Deploy

- Vercel (Next.js): UI Admin + Rotas de API + Assets estáticos
- PostgreSQL Supabase: metadados persistentes (Prisma)

Observações:
- Para embedding local em sites HTTPS, use um túnel (ngrok/Cloudflare Tunnel) ou faça deploy na Vercel.
- Garanta que a CSP do site cliente permite a origem do Insighthouse (script-src).

## Desenvolvimento e Padrões de Código

Este projeto segue padrões rigorosos de código e arquitetura usando **Cursor AI Rules**. As regras estão localizadas em `.cursor/rules/` e garantem consistência, manutenibilidade e qualidade do código.

### Regras Principais

- **Arquitetura** (`architecture.mdc`) - Estrutura do projeto, convenções de nomenclatura, princípios Clean Code
- **Componentes React** (`react-components.mdc`) - Padrões para Server e Client Components
- **API Routes** (`api-routes.mdc`) - Convenções para endpoints, validação, autenticação
- **Database/Prisma** (`database-prisma.mdc`) - Schema design, queries, performance
- **Autenticação** (`authentication-security.mdc`) - Segurança, sessões, proteção de rotas
- **TypeScript** (`typescript-utilities.mdc`) - Type safety, utilities, padrões
- **Testing** (`testing.mdc`) - Testes unitários, integração e E2E
- **Templates** - Templates reutilizáveis para componentes e APIs

### Convenções de Nomenclatura

- **Componentes**: `PascalCase.tsx` (ex: `UserCard.tsx`)
- **Páginas**: `page.tsx` no diretório apropriado
- **API Routes**: `route.ts` no diretório apropriado
- **Utilities**: `camelCase.ts` (ex: `formatDate.ts`)
- **Constantes**: `UPPER_SNAKE_CASE`

### Estrutura de Código

**Ordem de Imports**:
1. React/Next.js
2. Bibliotecas de terceiros
3. Componentes/utilitários internos (`@ui/`, `@/lib/`)
4. Types
5. Imports relativos

**Estrutura de Componentes**:
1. Imports
2. Definições de tipos
3. Constantes
4. Função do componente
5. Display name (Client Components)
6. Exports

### Validação e Type Safety

- Sempre use **Zod** para validação de inputs
- **TypeScript strict mode** habilitado
- Sem tipos `any` (use `unknown` se necessário)
- Interfaces para todas as props de componentes

### Segurança

- Sempre verificar sessão em rotas protegidas
- Filtrar queries do banco por `userId`
- Usar `select` para limitar campos retornados
- Nunca expor dados sensíveis (senhas, tokens)
- Validar todos os inputs do usuário

### Como Contribuir

1. Leia `CONTRIBUTING.md` para diretrizes completas
2. Consulte `.cursor/rules/` para padrões específicos
3. Use templates em `@template-component` e `@template-api-route`
4. Siga as convenções de commit (Conventional Commits)
5. Teste suas alterações antes de fazer commit

Para mais detalhes, consulte:
- `AGENTS.md` - Visão geral do projeto e arquitetura
- `CONTRIBUTING.md` - Guia de contribuição
- `.cursor/rules/README.md` - Documentação completa das regras

## Notas

- Arquivos estáticos em `public/static` podem ser cacheados e versionados
- Nenhum dado PII capturado; apenas sinais estruturais de busca/filtro e conversão
- Projeto usa **pnpm workspaces** para gerenciamento de dependências
- **Next.js 15** com App Router e React Server Components

## Troubleshooting

- Insights vazios: gere eventos e atualize; agregações podem ser cacheadas por até 60s.
- Erros de DB: alinhe mapeamento de porta (5432 vs 5433) e reinicie; para Supabase use `sslmode=require`.

## Roteiro de Apresentação (TCC)

1. Problema: instrumentar UX de busca imobiliária e surfar insights.
2. Design: app Next.js multi-tenant, loader first-party, Supabase.
3. Demo: criar Site → embedar loader → interagir → insights no dashboard.
4. Deep dive: resolução de origem do loader, controle de domínio, schema de eventos.
5. Operações: deploy (Vercel), variáveis de ambiente, rotação de chaves, allowlists de CSP.
