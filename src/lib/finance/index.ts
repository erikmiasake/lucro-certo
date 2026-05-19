// ─────────────────────────────────────────────────────────────────────
// finance/ — Camada central de cálculo financeiro.
// REGRA: Toda métrica numérica (receita, custos, lucro, margem,
// projeções, médias) DEVE ser obtida daqui. Nenhuma página ou
// componente pode recalcular números próprios, nem importar
// diretamente de '@/lib/store'.
//
// Implementação atual: re-exports do store. A lógica matemática
// permanece em store.ts (fonte única) e é exposta aqui sob namespace
// estável.
// ─────────────────────────────────────────────────────────────────────

export * from '@/lib/store';
