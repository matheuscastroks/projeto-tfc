# Reorganização da Estrutura de Pastas - Frontend

## Resumo das Mudanças

A estrutura de pastas foi reorganizada para seguir os padrões arquiteturais do projeto, movendo utilitários para dentro de `lib/` e organizando-os em módulos específicos.

## Mudanças Realizadas

### 1. Estrutura de Utilitários

**Antes:**
```
src/
  utils/
    utils.ts  (contém cn e formatDateToISO)
```

**Depois:**
```
src/
  lib/
    utils/
      cn.ts          (utilitários de classes CSS)
      date.ts         (utilitários de data)
      index.ts        (exportações centralizadas)
```

### 2. Path Aliases Atualizados

Adicionado novo alias no `tsconfig.json`:
```json
"@/utils/*": ["src/lib/utils/*"]
```

Agora você pode importar utilitários usando:
```typescript
import { cn, formatDateToISO } from '@/lib/utils'
```

### 3. Organização Modular

Os utilitários foram organizados em módulos específicos:

- **`cn.ts`**: Função para combinar classes Tailwind CSS
- **`date.ts`**: Funções relacionadas a datas (formatDateToISO, formatDate, timeAgo, addDays, isSameDay)

### 4. Imports Atualizados

Todos os imports foram atualizados de:
```typescript
import { cn } from 'src/utils/utils'
import { formatDateToISO } from 'src/utils/utils'
```

Para:
```typescript
import { cn, formatDateToISO } from '@/lib/utils'
```

## Nova Estrutura Completa

```
front/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (admin)/           # Admin routes
│   │   ├── (auth)/            # Auth routes
│   │   └── page.tsx           # Landing page
│   ├── assets/                # Static assets
│   ├── lib/                   # Core libraries
│   │   ├── api.ts             # API client
│   │   ├── getQueryClient.ts  # React Query client
│   │   ├── components/        # Shared components
│   │   │   ├── dashboard/    # Dashboard components
│   │   │   ├── insights/     # Insights components
│   │   │   └── ui/           # UI primitives (shadcn/ui)
│   │   ├── hooks/            # React Query hooks
│   │   │   ├── index.ts
│   │   │   ├── queryKeys.ts
│   │   │   ├── useAuth.ts
│   │   │   ├── useSites.ts
│   │   │   └── ...
│   │   ├── providers/        # React providers
│   │   │   ├── QueryProvider.tsx
│   │   │   └── SiteProvider.tsx
│   │   ├── types/            # TypeScript types
│   │   │   ├── index.ts
│   │   │   ├── insights.ts
│   │   │   └── sites.ts
│   │   └── utils/            # Utility functions ✨ NOVO
│   │       ├── cn.ts         # CSS class utilities
│   │       ├── date.ts       # Date utilities
│   │       └── index.ts     # Centralized exports
│   ├── middleware.ts         # Next.js middleware
│   └── utils/                # ❌ REMOVIDO (movido para lib/utils/)
└── ...
```

## Benefícios da Nova Estrutura

1. **Organização Clara**: Utilitários agora estão dentro de `lib/`, seguindo a arquitetura do projeto
2. **Modularidade**: Utilitários organizados por funcionalidade (cn, date, etc.)
3. **Path Aliases**: Uso consistente de aliases (`@/lib/utils`) em vez de caminhos relativos
4. **Escalabilidade**: Fácil adicionar novos módulos de utilitários (string.ts, array.ts, etc.)
5. **Type Safety**: Melhor suporte do TypeScript com estrutura organizada
6. **Documentação**: Funções documentadas com JSDoc seguindo os padrões do projeto

## Próximos Passos Sugeridos

Se necessário, você pode expandir a estrutura de utilitários adicionando:

```
lib/utils/
  ├── cn.ts           ✅ Criado
  ├── date.ts         ✅ Criado
  ├── string.ts       📝 Sugerido (truncate, slugify, capitalize)
  ├── array.ts        📝 Sugerido (unique, groupBy, chunk)
  ├── object.ts       📝 Sugerido (pick, omit, deepClone)
  ├── validation.ts   📝 Sugerido (isValidEmail, isValidUrl)
  └── index.ts        ✅ Criado
```

## Arquivos Modificados

- ✅ `src/lib/utils/cn.ts` (novo)
- ✅ `src/lib/utils/date.ts` (novo)
- ✅ `src/lib/utils/index.ts` (novo)
- ✅ `tsconfig.json` (path aliases atualizados)
- ✅ `src/lib/components/ui/tabs.tsx` (import atualizado)
- ✅ `src/lib/components/ui/scroll-area.tsx` (import atualizado)
- ✅ `src/lib/components/dashboard/EnhancedMetricCard.tsx` (import atualizado)
- ✅ `src/app/(admin)/admin/insights/page.tsx` (import atualizado)
- ✅ `src/app/(admin)/admin/insights/conversion/page.tsx` (import atualizado)
- ✅ `src/app/(admin)/admin/insights/search/page.tsx` (import atualizado)
- ✅ `src/app/(admin)/admin/insights/properties/page.tsx` (import atualizado)
- ❌ `src/utils/utils.ts` (removido)

## Verificação

Execute os seguintes comandos para verificar se tudo está funcionando:

```bash
# Verificar erros de TypeScript
pnpm tsc --noEmit

# Verificar linter
pnpm lint

# Verificar se os imports estão corretos
grep -r "src/utils/utils" src/
```

Se não houver resultados no último comando, todos os imports foram atualizados corretamente! ✅

