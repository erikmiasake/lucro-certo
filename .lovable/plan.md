

# Plano de Revisão da Lógica Financeira Central

## Problemas Identificados

### 1. Custos do CostMap com data fixa = hoje (CRÍTICO)
A função `costMapItemToCost()` (linha 870) sempre define `date: today` — ou seja, a cada reload da página, todos os custos do mapa são recriados com a data de HOJE. Isso significa:
- Custos fixos nunca impactam dias passados
- O gráfico semanal mostra custos zerados nos dias anteriores
- O lucro de dias passados fica inflado (sem custos)
- Custos se acumulam todos no dia atual

**Correção**: Custos fixos do CostMap devem ser tratados como custos contínuos — impactam todos os dias do mês. Custos variáveis devem distribuir pelo `spreadDays` a partir de uma data de referência persistente.

### 2. Dupla contagem de custos (CRÍTICO)
Quando o usuário adiciona um custo via `addCost()`, a função (linha 208-262) simultaneamente:
- Adiciona à lista `costs`
- Tenta sincronizar com `costMap` (criando ou atualizando item)

Depois, `syncCostMapToCosts()` recria custos `costmap-*` a partir do costMap. Resultado: o mesmo custo pode aparecer duas vezes — uma como custo manual e outra como `costmap-*`.

**Correção**: Separar as fontes. `addCost()` NÃO deve mexer no `costMap`. O CostMap é a fonte estrutural; custos manuais avulsos são separados.

### 3. Projeção mensal ignora dias de funcionamento
`getMonthlyProjection()` (linha 717) divide linearmente por `dayOfMonth` — não considera `operatingWeekdays`. Se o negócio opera 5 dias/semana, a projeção fica distorcida.

**Correção**: Calcular baseado em dias operacionais transcorridos e dias operacionais restantes no mês.

### 4. Lucro/venda e Custo/venda usam `totalEntries` (contagem de registros, não de vendas)
Se o usuário registra receita como valor total do dia (1 entry = R$5000), o "lucro por venda" mostra R$5000, o que não faz sentido.

**Correção**: Documentar que essa métrica só faz sentido com registros individuais, ou ajustar para não exibir quando há poucos registros.

### 5. `getCostBreakdown()` usa `amount` absoluto em vez de impacto diário/mensal
Os totais de `getCostBreakdown()` somam `amount` bruto dos custos, sem considerar `spreadDays`. Um custo de R$1000 com spread de 30 dias é contado como R$1000, não como ~R$33/dia.

**Correção**: Usar o impacto mensal normalizado para as análises e comparações.

### 6. IA recebe dados inconsistentes
O `AIInsightsPanel` envia o `week` summary que pode ter custos inflados ou zerados conforme os bugs acima. A IA não recebe informação sobre:
- Quais dias o negócio opera
- Quantos dias dos dados são reais vs estimados
- A proporção real vs estimada das receitas

**Correção**: Enriquecer o payload da IA com essas informações.

### 7. `operatingWeekdays` não é salvo/carregado do banco
`profile-sync.ts` (linha 25) hardcoda `operatingWeekdays: [1,2,3,4,5,6]` ao carregar do DB, ignorando o valor real configurado pelo usuário. O campo nem existe na tabela `profiles`.

**Correção**: Adicionar coluna `operating_weekdays` na tabela profiles e sincronizar corretamente.

---

## Etapas de Implementação

### Etapa 1 — Migração do banco de dados
Adicionar coluna `operating_weekdays` (integer array) à tabela `profiles`, default `{1,2,3,4,5,6}`.

### Etapa 2 — Corrigir `costMapItemToCost` e `syncCostMapToCosts`
- Custos fixos do CostMap: gerar um custo com `spreadDays: 30` e data fixa (início do mês ou data de criação persistente), para que `getCostImpactOnDate()` distribua corretamente ao longo do mês.
- Custos variáveis do CostMap: usar data de criação persistente + `spreadDays` do item.
- Armazenar `createdAt` no CostMapItem para referência de data.

### Etapa 3 — Remover sincronização bidirecional em `addCost()`
- `addCost()` não deve mais criar/atualizar itens no CostMap (remover linhas 233-259).
- CostMap é gerenciado separadamente via suas próprias funções.

### Etapa 4 — Corrigir `getCostBreakdown()` para usar impacto mensal
- Normalizar valores pelo `spreadDays` para ter comparações mensais corretas.

### Etapa 5 — Corrigir projeções para respeitar dias operacionais
- `getMonthlyProjection()`: contar dias operacionais no mês e projetar proporcionalmente.
- `getWeekSummary()` / projeções semanais: considerar apenas dias operacionais.

### Etapa 6 — Sincronizar `operatingWeekdays` com o banco
- Atualizar `profile-sync.ts` para salvar e carregar `operating_weekdays`.

### Etapa 7 — Enriquecer payload da IA
- Adicionar ao corpo da requisição: dias de funcionamento, proporção de receita real vs estimada, período de dados disponíveis.
- Atualizar o system prompt para instruir a IA a considerar essas informações.

### Etapa 8 — Testes de consistência
- Verificar que dia + semana + mês são coerentes entre si.
- Garantir que custos não duplicam.
- Confirmar que dias fechados mostram custo zero e receita zero.

---

## O que NÃO será alterado
- Design/layout das telas
- Fluxo de onboarding
- Funcionalidades existentes de registro manual

