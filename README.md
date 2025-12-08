# InsightHouse Analytics

Plataforma full‑stack de analytics web multi‑tenant construída com Next.js (App Router) e NestJS. Suporta acesso administrativo baseado em sessão, ingestão de eventos via SDK JavaScript e insights sobre PostgreSQL (Prisma ORM) com agregações SQL/JSONB.

## Estrutura do Monorepo

```
projeto-tfc/
├─ back/                  # NestJS 11, Prisma, PostgreSQL, Swagger
│  ├─ src/
│  │  ├─ auth/           # Autenticação (login/register/me/logout)
│  │  ├─ sites/          # Sites e domínios (multi‑tenancy)
│  │  ├─ events/         # Ingestão de eventos (lote/único)
│  │  ├─ insights/       # Módulos de analytics (overview/search/property/conversion/journey)
│  │  │  └─ categories/  # Classificação de tipos de eventos
│  │  ├─ sdk/            # Loader do SDK JS e configuração por site
│  │  ├─ health/         # Health checks
│  │  ├─ prisma/         # Serviço do Prisma (ciclo de vida da conexão)
│  │  ├─ common/         # guards, interceptors, decorators, utils
│  │  ├─ app.module.ts   # Módulo raiz
│  │  └─ main.ts         # Bootstrap + middlewares globais + Swagger
│  ├─ prisma/            # schema.prisma + migrações
│  └─ package.json
└─ front/                 # Next.js 15.1 (React 19), Tailwind, Radix UI, TanStack Query
   ├─ src/
   │  ├─ app/            # App Router (RSC + componentes client)
   │  ├─ lib/            # Cliente de API, hooks, tipos, providers, componentes
   │  └─ middleware.ts   # Auth: valida cookie de sessão em rotas protegidas
   └─ package.json
```

## Como Funciona (Arquitetura Lógica)

- Backend (NestJS)
  - Middlewares globais: Helmet, CORS, Compression, Cookie Parser, ValidationPipe, Throttler
  - Camada de segurança: guard unificado valida o cookie de sessão JWT (`admin_session`) e o tenant via `X-Site-Key`
  - Módulos de negócio: `auth`, `sites`, `events`, `insights` (com sub-módulos), `sdk`, `health`
  - Persistência: Prisma client (PostgreSQL), migrações em `back/prisma/migrations`
  - Documentação: Swagger UI em `/api/docs`

- Frontend (Next.js)
  - App Router com RSC por padrão; componentes client para interatividade
  - Middleware de auth valida o cookie de sessão antes de rotas protegidas
  - Busca/cache de dados via hooks do TanStack Query
  - Tailwind CSS + Radix UI para o design system

## Fluxos e Detalhes Técnicos

Para documentação detalhada sobre fluxos de autenticação, ingestão de eventos, especificações da API, modelo de banco de dados e requisitos, consulte o arquivo **[ESPECIFICACOES.md](./ESPECIFICACOES.md)**.

## Diagrama de Arquitetura (Alto Nível)

```mermaid
flowchart TB
  subgraph client[Cliente]
    Browser[Navegador]
    SDK[Loader do SDK JS]
  end
  subgraph frontend[Frontend Next.js]
    AppRouter["App Router (RSC + Client)"]
    Middleware[Middleware de Autenticação]
    Query[Cache do React Query]
  end
  subgraph backend[Backend NestJS]
    Main[Bootstrap main.ts]
    AppModule[AppModule]
    Middlewares[Middlewares Globais]
    Guards["Guard Unificado (JWT + X-Site-Key)"]
    Controllers[Controladores HTTP]
    Services[Serviços de Domínio\nAuth · Sites · Events · Insights · SDK · Health]
    Prisma["PrismaService (PostgreSQL)"]
  end
  DB[(PostgreSQL)]

  Browser --> SDK
  Browser --> AppRouter
  AppRouter --> Middleware
  AppRouter --> Controllers
  SDK --> Controllers
  Controllers --> Guards
  Controllers --> Services
  Services --> Prisma --> DB
  Main --> AppModule --> Middlewares --> Controllers
```

## Diagramas de Sequência (Fluxos Principais)

### Fluxo Completo do Sistema (Visão Geral)

```mermaid
sequenceDiagram
    participant User as Usuário Admin
    participant Browser as Navegador
    participant Frontend as Next.js Frontend
    participant Backend as NestJS Backend
    participant DB as PostgreSQL

    Note over User,DB: 1. Autenticação e Acesso ao Dashboard
    User->>Browser: Acessa /login
    Browser->>Frontend: GET /login
    Frontend-->>Browser: Página de login
    User->>Browser: Preenche email/password
    Browser->>Backend: POST /api/auth/login
    Backend->>DB: Verificar credenciais (scrypt)
    DB-->>Backend: User válido
    Backend->>Backend: Emitir JWT
    Backend-->>Browser: 200 OK + Set-Cookie (admin_session)
    Browser->>Frontend: GET /admin/dashboard (com cookie)
    Frontend->>Backend: GET /api/auth/me (com cookie)
    Backend->>Backend: Validar JWT do cookie
    Backend-->>Frontend: Dados do usuário
    Frontend-->>Browser: Dashboard renderizado

    Note over User,DB: 2. Consulta de Insights
    User->>Browser: Visualiza métricas
    Browser->>Frontend: Componente Client (React Query)
    Frontend->>Backend: GET /api/insights/overview?site=SITE_KEY
    Backend->>Backend: Guard: validar cookie + resolver tenant
    Backend->>DB: Agregações SQL/JSONB (Event table)
    DB-->>Backend: KPIs agregados
    Backend-->>Frontend: JSON com métricas
    Frontend->>Frontend: Cache no React Query
    Frontend-->>Browser: Cards e gráficos atualizados
```

### Fluxo de Ingestão de Eventos (SDK → Backend)

```mermaid
sequenceDiagram
    participant Site as Site Imobiliário
    participant SDK as SDK JavaScript
    participant Backend as NestJS Backend
    participant Guard as Unified Guard
    participant EventsService as EventsService
    participant DB as PostgreSQL

    Note over Site,DB: 1. Carregamento do SDK
    Site->>Backend: GET /api/sdk/loader?site=SITE_KEY
    Backend->>DB: Verificar site e domínios permitidos
    DB-->>Backend: Site config
    Backend-->>Site: Script loader (JavaScript)
    Site->>SDK: Executar loader no navegador
    SDK->>Backend: GET /api/sdk/site-config?site=SITE_KEY
    Backend-->>SDK: Config (allowedDomains, options)
    SDK->>SDK: Validar location.hostname
    SDK->>Backend: GET /api/sdk/tracker.js
    Backend-->>SDK: Script de rastreamento

    Note over Site,DB: 2. Captura e Envio de Eventos
    Site->>SDK: Usuário interage (busca, clica, converte)
    SDK->>SDK: Capturar evento (search_submit, view_property, etc.)
    SDK->>SDK: Construir payload JSON
    SDK->>Backend: POST /api/events/track/batch<br/>Header: X-Site-Key<br/>Body: { events: [...] }
    Backend->>Guard: Validar X-Site-Key
    Guard->>DB: Verificar site existe e está ativo
    DB-->>Guard: Site válido
    Guard-->>Backend: Tenant resolvido
    Backend->>EventsService: Processar eventos
    EventsService->>EventsService: Enriquecer (timestamp, UA, IP anonimizado)
    EventsService->>EventsService: Dividir em chunks (batch)
    EventsService->>DB: Prisma.createMany (Event table)
    DB-->>EventsService: Eventos inseridos
    EventsService-->>SDK: { success: true, count: N }
    SDK->>SDK: Limpar fila de eventos
```

### Fluxo de Consulta de Insights (Dashboard → Analytics)

```mermaid
sequenceDiagram
    participant Admin as Admin User
    participant Dashboard as Dashboard Next.js
    participant ReactQuery as React Query Cache
    participant Backend as NestJS Backend
    participant InsightsService as Insights Services
    participant DB as PostgreSQL

    Note over Admin,DB: 1. Prefetch no Server Component
    Admin->>Dashboard: Navega para /admin/insights
    Dashboard->>Backend: Server Component prefetch<br/>GET /api/insights/overview?site=SITE_KEY
    Backend->>Backend: Guard: validar cookie + siteKey
    Backend->>InsightsService: OverviewService.getOverview()
    InsightsService->>DB: Query SQL com agregações JSONB<br/>(COUNT, GROUP BY, properties->>'field')
    DB-->>InsightsService: Dados agregados
    InsightsService-->>Backend: KPIs (visitantes, leads, taxa conversão)
    Backend-->>Dashboard: JSON response
    Dashboard->>ReactQuery: HydrationBoundary (dehydrate)
    Dashboard-->>Admin: Página renderizada (SSR)

    Note over Admin,DB: 2. Interação e Refetch
    Admin->>Dashboard: Filtra por período
    Dashboard->>ReactQuery: useOverview(siteKey, filters)
    ReactQuery->>Backend: GET /api/insights/overview?site=KEY&startDate=...
    Backend->>InsightsService: Recalcular com filtros
    InsightsService->>DB: Query com WHERE ts BETWEEN ...
    DB-->>InsightsService: Dados filtrados
    InsightsService-->>Backend: KPIs atualizados
    Backend-->>ReactQuery: Nova resposta
    ReactQuery->>ReactQuery: Atualizar cache
    ReactQuery-->>Dashboard: Re-render com novos dados
    Dashboard-->>Admin: Gráficos atualizados
```

### Fluxo de Multi-Tenancy (Criação de Site)

```mermaid
sequenceDiagram
    participant Admin as Admin User
    participant Frontend as Next.js Admin UI
    participant Backend as NestJS Backend
    participant SitesService as SitesService
    participant DB as PostgreSQL

    Note over Admin,DB: Criação de Site e Configuração
    Admin->>Frontend: Acessa /admin/sites/new
    Frontend->>Backend: GET /api/auth/me (validar sessão)
    Backend-->>Frontend: User data
    Admin->>Frontend: Preenche formulário (nome, domínios)
    Frontend->>Backend: POST /api/sites<br/>Body: { name, domains: [...] }
    Backend->>Backend: Guard: validar cookie JWT
    Backend->>SitesService: createSite(userId, data)
    SitesService->>DB: Criar Site (gerar siteKey único)
    SitesService->>DB: Criar Domain records
    DB-->>SitesService: Site criado
    SitesService-->>Backend: Site + siteKey
    Backend-->>Frontend: { id, siteKey, loaderUrl }
    Frontend->>Frontend: Exibir snippet de instalação
    Frontend-->>Admin: Snippet HTML para copiar
```



## Desenvolvimento Local

### Pré-requisitos
- Node.js 20+ (imagem Docker do backend usa Node 22), pnpm 9+
- PostgreSQL 15+

1) Backend

```bash
cd back
pnpm install
cp .env.example .env
pnpm prisma migrate dev
pnpm prisma generate
pnpm start:dev
```

2) Frontend

```bash
cd front
pnpm install
cp .env.example .env # se existir
pnpm dev
```

Variáveis de ambiente comuns

- Backend
  - `DATABASE_URL` (obrigatória)
  - `DIRECT_URL` (exigida para migrações do Prisma)
  - `PORT` (padrão 3001)
  - `NODE_ENV` (development | production)
  - `FRONTEND_URL` (origem autorizada no CORS)
  - `NEXTAUTH_SECRET` (segredo HMAC para assinar o cookie de sessão)
  - `API_BASE_URL`

- Frontend
  - `SITE_URL` (URL base pública, usada em fetches)
  - `NEXTAUTH_SECRET` (deve coincidir com o backend se a validação local for necessária no middleware)

## Testes

- Backend: Jest configurado (`pnpm test`, `pnpm test:watch`, `pnpm test:cov`).
- Frontend: adicionar testes conforme a stack preferida (React Testing Library, Vitest/Jest).


## Referências (Docs)

- Next.js: `/vercel/next.js` (Context7)
- NestJS: `/nestjs/docs.nestjs.com` e `/nestjs/nest` (Context7)
- Prisma: `/prisma/docs` e `/prisma/prisma` (Context7)
- TanStack Query: `/websites/tanstack_query_v5` (Context7)
- Tailwind CSS: `/tailwindlabs/tailwindcss.com` (Context7)

