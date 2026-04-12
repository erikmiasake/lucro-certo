

# Plano: Relatório Mensal Inteligente

## Resumo

Implementar geração de relatório mensal em PDF com análise da IA, acessível por uma nova aba "Relatório" no menu lateral. O relatório consolida dados financeiros do mês, passa pela IA para gerar diagnóstico e recomendações, e gera um PDF baixável.

## Arquitetura

```text
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ store.ts    │────▶│ Edge Function    │────▶│ PDF Generation  │
│ getMonthlySummary │ monthly-report   │     │ (html-to-pdf)   │
│ (dados validados) │ (IA estruturada) │     │ client-side     │
└─────────────┘     └──────────────────┘     └─────────────────┘
```

## Fases de implementação

### Fase 1-2: Dados + Validação — `src/lib/store.ts`

Criar `getMonthlySummary(year, month)` que consolida dados de um mês específico (não apenas os últimos 30 dias):
- Receita total, custos totais, lucro, margem (%)
- Custo percentual sobre receita
- Média diária (baseada apenas em dias com movimentação)
- Dias operacionais com movimento
- Melhor dia e pior dia (lucro)
- Breakdown de custos fixos vs variáveis
- Validação: mínimo 7 dias operacionais com dados, senão bloqueia

### Fase 3: IA — Nova Edge Function `monthly-report`

Nova edge function `supabase/functions/monthly-report/index.ts`:
- Recebe o `monthlySummary` estruturado
- Prompt restrito: gerar apenas resumo, diagnóstico, até 3 problemas, até 3 recomendações, conclusão
- Mesmo padrão de segurança do `ai-insights` (não inventar dados, usar apenas números fornecidos)
- Retorna JSON estruturado com seções do relatório

### Fase 4-5: Layout + PDF — `src/pages/Relatorio.tsx`

Criar página com:
- Seletor de mês (dropdown dos últimos 6 meses)
- Botão "Gerar Relatório" com loading state
- Preview do relatório em HTML com seções: Capa, Resumo, Visão Operacional, Receita, Custos, Lucro, Problemas, Recomendações, Conclusão
- Botão "Baixar PDF" usando biblioteca `html2pdf.js` (client-side, sem servidor)
- Validação visual: se dados insuficientes, mostra mensagem e bloqueia

### Fase 6: UX — Integração no menu

- Adicionar link "Relatório" no sidebar (`AceternitySidebar.tsx`)
- Adicionar rota `/relatorio` no `App.tsx` e `Index.tsx`
- Fluxo: selecionar mês → gerar → preview → download

## Arquivos a criar/editar

| Arquivo | Ação |
|---------|------|
| `src/lib/store.ts` | Adicionar `getMonthlySummary(year, month)` |
| `supabase/functions/monthly-report/index.ts` | Nova edge function para IA do relatório |
| `src/pages/Relatorio.tsx` | Nova página com preview + PDF |
| `src/components/AceternitySidebar.tsx` | Adicionar link "Relatório" |
| `src/pages/Index.tsx` | Adicionar rota `/relatorio` |
| `src/App.tsx` | Adicionar rota protegida `/relatorio` |
| `package.json` | Adicionar `html2pdf.js` |

## Detalhes técnicos

- **PDF client-side**: Usar `html2pdf.js` para converter o HTML renderizado diretamente no browser, sem necessidade de servidor. Leve, funcional no mobile.
- **Prompt da IA**: Restrito a usar apenas os números do `monthlySummary`. Saída limitada a: `summary`, `diagnosis`, `problems[]` (max 3), `recommendations[]` (max 3), `conclusion`.
- **Validação**: `getMonthlySummary` retorna flag `isValid: boolean` — se false, UI bloqueia geração.

