## Problema

Na tela "Suas finanças estão prontas" (após preencher o onboarding no modo Finanças Pessoais), o campo **Renda mensal** mostra um valor muito menor que o digitado. Exemplo: você informou ~R$ 3.810/mês e aparece **R$ 127**.

### Causa

Em `src/components/OnboardingDetails.tsx` (handleFinish, modo pessoal), a renda mensal é dividida por 30 para virar uma média diária antes de ser enviada para a confirmação:

```ts
const dailyAvg = monthlyVal > 0 ? Math.round(monthlyVal / 30) : 0;
onFinish({ avgSales: dailyAvg.toLocaleString('pt-BR'), ... })
```

Já a `OnboardingConfirmation` exibe esse mesmo `avgSales` com o rótulo **"Renda mensal"** — ou seja, um valor diário rotulado como mensal. As categorias e o tipo de negócio já batem; só a renda está errada.

## Correção

1. **`OnboardingFinishData`** (em `OnboardingDetails.tsx`): adicionar campo opcional `monthlyIncome?: number` para guardar o valor mensal original informado pelo usuário no modo pessoal.

2. **`handleFinish` (modo pessoal)**: continuar enviando `avgSales` como média diária (necessário para o cálculo interno de receita), mas também enviar `monthlyIncome: monthlyVal`.

3. **`Onboarding.tsx`**: repassar `monthlyIncome` para `OnboardingConfirmation` via nova prop opcional.

4. **`OnboardingConfirmation.tsx`**:
   - Aceitar nova prop `monthlyIncome?: number`.
   - No modo pessoal, exibir `R$ {monthlyIncome formatado em pt-BR}` no card "Renda mensal" em vez de `avgSales`.
   - Manter comportamento atual para modo negócio (continua mostrando "Vendas/dia" com `avgSales`).

5. **Sem mudanças** em store, business-config ou lógica de cálculo: a média diária derivada continua sendo persistida normalmente.

## Verificação

- Após implementar, abrir o onboarding em modo Pessoal, informar uma renda mensal (ex: R$ 3.000) e confirmar que a tela final mostra **R$ 3.000** sob "Renda mensal".
- Confirmar que o modo Negócio segue mostrando "Vendas/dia" inalterado.
