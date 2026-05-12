// ─────────────────────────────────────────────────────────────────────
// finance/ — Camada central de cálculo financeiro.
// REGRA: Toda métrica numérica (receita, custos, lucro, margem,
// projeções, médias) DEVE ser obtida daqui. Nenhuma página ou
// componente pode recalcular números próprios.
//
// Implementação atual: re-exports do store. A lógica matemática
// permanece em store.ts (fonte única) e é exposta aqui sob namespace
// estável para evitar imports diretos do store em UI.
// ─────────────────────────────────────────────────────────────────────

export {
  // dia / período
  getDaySummary,
  getWeekSummary,
  getMonthSummary,
  getPreviousDaySummary,
  getPreviousWeekSummary,
  getWeekDailyData,
  getBestAndWorstDay,
  // custos
  getCostBreakdown,
  getCostAnalysisAmount,
  // projeções e tendências
  getMarginTrend,
  getMonthlyProjection,
  // metas
  getGoalsProgress,
  // sumário consolidado para IA / relatórios
  getFinancialSummary,
  type FinancialSummary,
  // transações unificadas
  getAllTransactions,
  getTransactionsByDate,
  getTransactionTotals,
  // utilidades
  isOperatingDay,
  getOperatingDaysInRange,
  getRevenueStats,
  getMonthlySummary,
  type MonthlySummary,
} from '@/lib/store';
