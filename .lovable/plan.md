

# Plano: Fonte Única de Dados — Correções de Consistência

## Problema atual

Existem **duas divergências** entre as abas:

1. **`getMonthSummary()` usa janela de 30 dias** (últimos 30 dias corridos), enquanto `getMonthlySummary(year, month)` usa mês calendário. Todas as abas do dashboard (Visão Geral, Movimentações, Custos, Desempenho) usam a janela de 30 dias.

2. **`getCostBreakdown()` usa `getMonthlyViewCostAmount()`** que normaliza custos com fórmula diferente da usada por `getDaySummary()`. Resultado: o custo total na aba Custos pode divergir do custo nas outras abas.

3. **Melhor/pior dia em `getMonthlySummary`** não filtra dias não-operacionais (ex: domingo para barbearia 6 dias/semana).

## Solução

### 1. `getMonthSummary()` → mês calendário

Trocar `getPeriodSummary(30)` por soma de `getDaySummary()` do dia 1 ao último dia do mês corrente. Isso alinha dashboard e relatório na mesma base.

### 2. Modularizar cálculos atômicos

Extrair funções puras:
- `getRevenueOnDate(date)` — receita do dia
- `getCostsOnDate(date)` — custo total do dia
- `getDaySummary(date)` — junta os dois (já existe, mantém)
- `getPeriodSummary(startDate, endDate)` — soma de `getDaySummary` entre duas datas
- `getCostBreakdownForPeriod(startDate, endDate)` — agrupa custos usando `getCostImpactOnDate` no período, exibindo **valor agregado por custo** (aluguel = R$3.000, não 30x R$100)

### 3. Unificar `getCostBreakdown()`

Reescrever para usar `getCostImpactOnDate` somado no período do mês calendário, em vez de `getMonthlyViewCostAmount`. Assim o total do breakdown será idêntico ao `month.totalRealCost`.

### 4. Dias fechados — regra explícita

Em `getMonthlySummary` e `getBestAndWorstDay`:
- Dias não-operacionais (`!isOperatingDay`) **não entram** em melhor/pior dia
- Dias não-operacionais **não entram** na média operacional
- Custo fixo continua rateado normalmente (impacto diário existe mesmo em dia fechado)
- Receita e custo variável = 0 em dia fechado (natural, pois não há entradas)

### 5. Eliminar `getMonthlyViewCostAmount()`

Função legada que causa a divergência. Substituir todos os usos por cálculo baseado em período.

## Arquivos a editar

| Arquivo | Mudança |
|---------|---------|
| `src/lib/store.ts` | Refatorar `getMonthSummary` para mês calendário; reescrever `getCostBreakdown` usando `getCostImpactOnDate` no período; adicionar `isOperatingDay` check em `getMonthlySummary` best/worst; remover `getMonthlyViewCostAmount` |
| `src/pages/Custos.tsx` | Ajustar para usar `month.totalRealCost` como base de percentuais (em vez de `breakdown.total`) |

## Resultado esperado

Todas as abas (Visão Geral, Movimentações, Custos, Desempenho, Relatório) mostrarão exatamente os mesmos números para o mesmo mês, porque todas derivam de `getDaySummary()` somado no mês calendário.

