// ─────────────────────────────────────────────────────────────────────
// MODES — Dicionário de copy por modo da plataforma.
// REGRA: Toda string visível ao usuário relacionada a finanças DEVE
// vir daqui. Nenhum componente pode hardcodar "Receita", "Lucro",
// "Quanto sobrou" etc. baseado em businessType.
// ─────────────────────────────────────────────────────────────────────

export type AppMode = 'business' | 'personal';

export interface ModeGlossary {
  inflow: string;
  inflowSingular: string;
  outflow: string;
  outflowSingular: string;
  result: string;
  resultDay: string;
  margin: string;
  addInflow: string;
  addOutflow: string;
  aiPersona: string;
  // Expanded fields (Fase 2)
  contextLabel: string;
  marginLabel: string;
  marginLongLabel: string;
  performanceTitle: string;
  performanceSubtitle: string;
  revenueOfLabel: string;
  profitRealLabel: string;
  profitPerDay: string;
  costPerDay: string;
  weekSummaryLabel: string;
  weeklySummaryProfit: string;
  costsPageTitle: string;
  costsPageSubtitle: string;
  costOperationalLabel: string;
  costRealLabel: string;
  costOperationalDesc: string;
  costRealDesc: string;
  costAlertTitle: string;
  costRankingTitle: string;
  noCostsLabel: string;
  costFeedback: string;
  costModalButton: string;
  navCosts: string;
  navPerformance: string;
}

export interface ModeAlerts {
  costsRisingTitle: string;
  costsRisingMsg: string;
  costsRisingHint: string;
  resultDroppingTitle: string;
  resultDroppingMsg: string;
  lossProjectionTitle: string;
  lossProjectionMsg: (loss: string) => string;
  lossProjectionHint: string;
  growthTitle: string;
  growthMsg: (proj: string) => string;
  lowMarginTitle: string;
  lowMarginMsg: (pct: string) => string;
  lowMarginHint: string;
  topCostHint: string;
  goalReachedTitle: string;
  goalReachedMsg: (target: string) => string;
  goalAtRiskTitle: string;
  goalAtRiskMsg: (progress: string, expected: string) => string;
  goalAtRiskHint: string;
  bestDayTitle: (day: string) => string;
  bestDayMsg: (avgProfit: string, day: string) => string;
}

export interface ModeCopy {
  glossary: ModeGlossary;
  alerts: ModeAlerts;
  /** Sugestões de categorias para entradas */
  inflowCategories: string[];
  /** Sugestões de categorias para saídas */
  outflowCategoriesVariable: string[];
  outflowCategoriesFixed: string[];
}
