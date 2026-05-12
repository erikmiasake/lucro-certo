// ─────────────────────────────────────────────────────────────────────
// MODES — Dicionário de copy por modo da plataforma.
// REGRA: Toda string visível ao usuário relacionada a finanças DEVE
// vir daqui. Nenhum componente pode hardcodar "Receita", "Lucro",
// "Quanto sobrou" etc. baseado em businessType.
// ─────────────────────────────────────────────────────────────────────

export type AppMode = 'business' | 'personal';

export interface ModeGlossary {
  /** Substantivo para entradas de dinheiro (ex: "Receita" / "Entradas") */
  inflow: string;
  inflowSingular: string;
  /** Substantivo para saídas de dinheiro */
  outflow: string;
  outflowSingular: string;
  /** Resultado final (ex: "Lucro" / "Quanto sobrou") */
  result: string;
  resultDay: string;
  /** Margem (ex: "Margem" / "Economia") */
  margin: string;
  /** Verbo de criação */
  addInflow: string;
  addOutflow: string;
  /** Tom da IA */
  aiPersona: string;
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
