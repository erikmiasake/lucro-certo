

# Plano: Corrigir Insights, IA e Projeção Mensal

## Problemas identificados no documento

1. **Insights locais (`getSmartInsights`) com números genéricos** — frases como "Margem excelente hoje — dia lucrativo" sem valor financeiro concreto
2. **IA (Copiloto) menciona "clientes" e "vendas"** — o modelo de dados é baseado em movimentações, não clientes. O prompt ainda referencia "clientes" e "valor por cliente"
3. **Projeção mensal com valores inflados** — a projeção está aparecendo na IA com números muito altos
4. **Gráfico "Últimos 7 dias" ainda visível em alguma tela** — precisa confirmar se já foi removido de todas as telas

## Mudanças planejadas

### 1. Corrigir `getSmartInsights()` em `src/lib/store.ts`
- Remover insight genérico "Margem excelente hoje — dia lucrativo" (linha 876) — substituir por versão com valor: `"Margem de X% hoje — lucro de R$ Y"`
- Garantir que todos os insights tenham base matemática com valores em R$ ou %
- Ajustar projeção mensal no insight (linhas 858-868) para usar `getMonthlyProjection()` ao invés de cálculo duplicado

### 2. Corrigir prompt da IA em `supabase/functions/ai-insights/index.ts`
- Substituir todas as referências a "cliente" por "movimentação/entrada"
- Trocar "valor médio por cliente" por "valor médio por entrada" 
- Trocar `avgPerClient` por `avgPerEntry` na nomenclatura
- Remover instrução que menciona "clientes" no ponto 7 do prompt
- Ajustar exemplos no prompt para usar linguagem de movimentações financeiras

### 3. Corrigir dados enviados do `AIInsightsPanel.tsx` para a IA
- O campo `summary.totalEntries` representa número de registros de entrada, não "clientes" — garantir que o prompt trate como "entradas registradas" (já está correto no userPrompt, mas o systemPrompt mistura terminologia)

### 4. Validar remoção completa de gráficos
- Confirmar que `VisaoGeral.tsx` e `Desempenho.tsx` não têm mais gráficos de barras (já confirmado no código atual)

## Arquivos a editar

| Arquivo | Mudança |
|---------|---------|
| `src/lib/store.ts` | Corrigir `getSmartInsights()` — todos os insights com base matemática |
| `supabase/functions/ai-insights/index.ts` | Remover referências a "clientes", usar "movimentações/entradas" |

