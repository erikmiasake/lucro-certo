## Objetivo

Reorganizar a base do LucroReal para que **toda** a plataforma derive de duas estruturas (Movimentações e Gastos) através de **uma única camada de cálculo**, e para que **Negócio** e **Uso Pessoal** compartilhem essa arquitetura sem nunca se misturarem na experiência.

Não há novas funcionalidades — apenas consolidação, padronização e isolamento por modo.

---

## Diagnóstico do que existe hoje

- `src/lib/store.ts` (1419 linhas) já concentra a maior parte dos cálculos (`getDaySummary`, `getMonthSummary`, `getCostBreakdown`, `getFinancialSummary`, `getProactiveAlerts`, `getSmartInsights`, etc.), mas mistura: modelo de dados, persistência, sync com DB, regras de negócio e geradores de texto.
- `src/lib/business-config.ts` já distingue `pessoal` vs negócio via `isPersonalMode` e `getAdaptedLabels`, mas:
  - Labels são consultadas em ~20 arquivos de forma ad-hoc.
  - Vários componentes (Dashboard, Movimentações, Custos, AIInsightsPanel, Relatorio, alertas proativos do `store.ts`) ainda têm strings hardcoded em "negócio" (ex.: "Lucro caiu", "Margem muito baixa", "Negocie com fornecedores").
  - Categorias sugeridas e placeholders vivem espalhados em `EntryModal`, `CostModal`, `OnboardingPage`.
- `getProactiveAlerts` e `getSmartInsights` produzem **texto pronto** dentro do store — quebra a regra "linguagem própria por modo" e impede reuso.
- A edge function `ai-insights` recebe `businessType` mas o prompt usa termos misturados ("faturamento" + "movimentações"); não há ramo dedicado para modo pessoal.

---

## Arquitetura alvo

```text
┌──────────────────────────────────────────────────────┐
│                  DADOS (fonte única)                 │
│   entries[]  +  costs[]  +  costMap[] (deriva costs) │
│           profile.mode = 'business' | 'personal'     │
└──────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│        finance/  (camada central de cálculo)          │
│  computeDay / computeRange / computeMonth             │
│  computeCostBreakdown / computeProjection             │
│  computeTrends / computeGoals / buildSummary          │
│      → independente de modo, devolve NÚMEROS          │
└──────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
│ modes/       │ │ insights/    │ │ ai/              │
│ business.ts  │ │ rules.ts     │ │ promptBuilder.ts │
│ personal.ts  │ │ (gera alerts │ │ (escolhe persona │
│ (labels,     │ │  por modo a  │ │  + glossário do  │
│  categorias, │ │  partir dos  │ │  modo)           │
│  glossário)  │ │  números)    │ │                  │
└──────────────┘ └──────────────┘ └──────────────────┘
                         │
                         ▼
       Páginas e componentes só consomem isto.
```

Princípio: **páginas nunca calculam, nunca escolhem texto baseado em `businessType` localmente.** Elas pedem dados a `finance/` e textos a `modes/<modoAtual>`.

---

## Etapas

### 1. Consolidar tipo de modo
- Adicionar `mode: 'business' | 'personal'` derivado de `businessType` em um único helper `getMode()` no store.
- Garantir que `costs` e `entries` carreguem implicitamente o modo via owner (profile) — não precisa coluna nova; a separação é por usuário.

### 2. Extrair `src/lib/finance/`
Mover de `store.ts` (sem mudar fórmulas) para módulos puros, recebendo `entries` e `costs` por parâmetro:
- `finance/period.ts` — `computeDay`, `computeRange`, `computeMonth`, `computeWeek`, `computePreviousWeek`.
- `finance/costs.ts` — `costImpactOnDate`, `costImpactInMonth`, `computeCostBreakdown`.
- `finance/projection.ts` — `computeMonthlyProjection`, `computeMarginTrend`.
- `finance/goals.ts` — `computeGoalsProgress`.
- `finance/summary.ts` — `buildFinancialSummary` (consumido por dashboard, relatórios e IA).
- `store.ts` mantém apenas estado, mutators e re-exporta wrappers finos para compatibilidade temporária.

### 3. Extrair `src/lib/modes/`
- `modes/types.ts` — interface `ModeCopy` (labels, categorias, placeholders, alertas, insights, IA persona).
- `modes/business.ts` — termos: Receita, Custos, Lucro, Margem, Vendas, Faturamento; categorias de gasto comerciais; placeholders de entrada (vendas, serviços); persona da IA "consultor de negócio".
- `modes/personal.ts` — termos: Entradas, Gastos, Quanto sobrou, Saldo; categorias pessoais (alimentação, transporte, lazer, contas); persona da IA "organizador financeiro pessoal".
- `modes/index.ts` — `useMode()` hook + `getModeCopy(mode)` puro. Substitui `getAdaptedLabels`.

### 4. Mover alertas e insights para regras puras
- `insights/rules.ts` recebe `summary` (números) + `mode` e devolve uma lista estruturada `{ kind, severity, params }`.
- `insights/render.ts` traduz cada `kind` usando `modes/<mode>` (sem strings hardcoded em outro lugar).
- Remover `getProactiveAlerts` e `getSmartInsights` "com texto pronto" do `store.ts`.

### 5. Refatorar páginas e componentes para consumir a camada
Tocar apenas para trocar fontes (sem novos recursos) em:
- `Dashboard.tsx`, `VisaoGeral.tsx`, `Desempenho.tsx`, `Custos.tsx`, `Movimentacoes.tsx`, `Relatorio.tsx`, `Summary.tsx`, `Configuracoes.tsx`, `Tutorial.tsx`.
- `EntryModal.tsx`, `CostModal.tsx`, `AIInsightsPanel.tsx`, `ProactiveAlerts.tsx`, `GoalsProgress.tsx`, `OnboardingPage.tsx`, `OnboardingConfirmation.tsx`, `OnboardingDetails.tsx`, `AppSidebar.tsx`, `AceternitySidebar.tsx`.

Regra: **zero literal de "Receita/Lucro/Gasto/Sobrou"** nesses arquivos — sempre via `modeCopy`.

### 6. Edge function `ai-insights`
- Aceitar `mode: 'business' | 'personal'` explícito (além do `businessType`).
- Dois prompts (um por modo) com glossário fechado; nada de "faturamento" no modo pessoal nem "quanto sobrou" no de negócio.
- Continuar consumindo o mesmo `FinancialSummary` (números vindos da camada central) — IA nunca recalcula.

### 7. Onboarding
- Único ponto que cria movimentações/gastos iniciais; já é o caso, manter.
- Garantir que escreve `mode` no profile e que as categorias semeadas vêm de `modes/<mode>.seedCategories`.

### 8. Limpeza e guardrails
- Remover funções duplicadas/órfãs do `store.ts` após migração.
- Adicionar comentário-cabeçalho em `finance/` e `modes/` proibindo lógica fora dali.
- Atualizar memórias do projeto: nova localização da camada central e regra "páginas não calculam, não escolhem labels".

---

## Detalhes técnicos

- Não há mudança de schema no Supabase. `entries` e `costs` continuam como hoje (não precisam coluna `modo`, pois o usuário já tem um único modo no profile).
- Persistência (`profile-sync`, `financial-sync`) e `safe-storage` permanecem inalterados.
- Refator é incremental: `store.ts` re-exporta wrappers para `finance/*` durante a transição, evitando quebrar imports em massa; ao final, imports são apontados para `@/lib/finance` e wrappers são removidos.
- Sem mudanças visuais intencionais; qualquer diferença de texto vem de aplicar corretamente o glossário do modo já existente.
- Risco principal: textos de alerta/insight hoje hardcoded em modo negócio — serão movidos para `modes/business.ts` (preservados) e novos equivalentes pessoais entram em `modes/personal.ts`.

---

## Resultado

- Uma única fonte de cálculo (`finance/`) consumida por dashboard, gráficos, alertas, relatórios e IA.
- Dois dicionários de experiência (`modes/business`, `modes/personal`) que nunca se cruzam.
- Páginas e componentes ficam "burros": pedem números + copy, renderizam.
- Base estável para futuras features sem retrabalho.
