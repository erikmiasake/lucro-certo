import { BusinessType } from './business-config';

export interface Entry {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  createdAt: number;
  description?: string;
  category?: string;
}

export interface Cost {
  id: string;
  amount: number;
  type: 'product' | 'business';
  spreadDays: number;
  date: string;
  createdAt: number;
  description?: string;
  category?: string;
}

export interface AppState {
  businessType: BusinessType | null;
  entries: Entry[];
  costs: Cost[];
  averageSales?: number;
  mainCosts?: string[];
}

const STORAGE_KEY = 'lucro-real-data';

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { businessType: null, entries: [], costs: [] };
}

function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();
let listeners: (() => void)[] = [];

function notify() {
  saveState(state);
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function getState(): AppState {
  return state;
}

export function setBusinessType(type: BusinessType) {
  state = { ...state, businessType: type };
  notify();
}

export function setOnboardingData(data: { averageSales?: number; mainCosts?: string[] }) {
  state = { ...state, ...data };
  notify();
}

export function addEntry(amount: number, description?: string, category?: string) {
  const today = new Date().toISOString().split('T')[0];
  const entry: Entry = {
    id: crypto.randomUUID(),
    amount,
    date: today,
    createdAt: Date.now(),
    description,
    category,
  };
  state = { ...state, entries: [...state.entries, entry] };
  notify();
}

export function addCost(amount: number, type: 'product' | 'business', spreadDays: number = 1, description?: string, category?: string) {
  const today = new Date().toISOString().split('T')[0];
  const cost: Cost = {
    id: crypto.randomUUID(),
    amount,
    type,
    spreadDays: type === 'business' ? 1 : spreadDays,
    date: today,
    createdAt: Date.now(),
    description,
    category,
  };
  state = { ...state, costs: [...state.costs, cost] };
  notify();
}

export function deleteEntry(id: string) {
  state = { ...state, entries: state.entries.filter((e) => e.id !== id) };
  notify();
}

export function deleteCost(id: string) {
  state = { ...state, costs: state.costs.filter((c) => c.id !== id) };
  notify();
}

export function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

function getCostImpactOnDate(cost: Cost, targetDate: string): number {
  const costDate = new Date(cost.date + 'T00:00:00');
  const target = new Date(targetDate + 'T00:00:00');
  const diffDays = Math.floor((target.getTime() - costDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0 || diffDays >= cost.spreadDays) return 0;
  return cost.amount / cost.spreadDays;
}

export function getDaySummary(date: string = getDateString()) {
  const dayEntries = state.entries.filter((e) => e.date === date);
  const totalRevenue = dayEntries.reduce((sum, e) => sum + e.amount, 0);
  const totalRealCost = state.costs.reduce(
    (sum, c) => sum + getCostImpactOnDate(c, date),
    0
  );
  const profit = totalRevenue - totalRealCost;
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
  const ticketMedio = dayEntries.length > 0 ? totalRevenue / dayEntries.length : 0;
  const custoMedioPorVenda = dayEntries.length > 0 ? totalRealCost / dayEntries.length : 0;
  const entryCount = dayEntries.length;
  return { totalRevenue, totalRealCost, profit, margin, ticketMedio, custoMedioPorVenda, entryCount };
}

function getDateRange(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(getDateString(d));
  }
  return dates;
}

export function getWeekSummary() {
  const dates = getDateRange(7);
  let totalRevenue = 0;
  let totalRealCost = 0;
  let totalEntries = 0;
  for (const date of dates) {
    const s = getDaySummary(date);
    totalRevenue += s.totalRevenue;
    totalRealCost += s.totalRealCost;
    totalEntries += s.entryCount;
  }
  const profit = totalRevenue - totalRealCost;
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
  const ticketMedio = totalEntries > 0 ? totalRevenue / totalEntries : 0;
  return { totalRevenue, totalRealCost, profit, margin, ticketMedio, totalEntries };
}

export function getMonthSummary() {
  const dates = getDateRange(30);
  let totalRevenue = 0;
  let totalRealCost = 0;
  let totalEntries = 0;
  for (const date of dates) {
    const s = getDaySummary(date);
    totalRevenue += s.totalRevenue;
    totalRealCost += s.totalRealCost;
    totalEntries += s.entryCount;
  }
  const profit = totalRevenue - totalRealCost;
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
  const ticketMedio = totalEntries > 0 ? totalRevenue / totalEntries : 0;
  return { totalRevenue, totalRealCost, profit, margin, ticketMedio, totalEntries };
}

export function getPreviousDaySummary() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getDaySummary(getDateString(yesterday));
}

export function getPreviousWeekSummary() {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 7; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(getDateString(d));
  }
  let totalRevenue = 0;
  let totalRealCost = 0;
  for (const date of dates) {
    const s = getDaySummary(date);
    totalRevenue += s.totalRevenue;
    totalRealCost += s.totalRealCost;
  }
  return { totalRevenue, totalRealCost, profit: totalRevenue - totalRealCost };
}

export function getWeekDailyData() {
  const weekday = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const days: { label: string; date: string; profit: number; revenue: number; cost: number; margin: number }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = getDateString(d);
    const s = getDaySummary(dateStr);
    days.push({
      label: weekday[d.getDay()],
      date: dateStr,
      profit: s.profit,
      revenue: s.totalRevenue,
      cost: s.totalRealCost,
      margin: s.margin,
    });
  }
  return days;
}

export function getBestAndWorstDay(days: number = 30) {
  const dates = getDateRange(days);
  let best = { date: '', profit: -Infinity };
  let worst = { date: '', profit: Infinity };
  for (const date of dates) {
    const s = getDaySummary(date);
    if (s.totalRevenue === 0 && s.totalRealCost === 0) continue;
    if (s.profit > best.profit) best = { date, profit: s.profit };
    if (s.profit < worst.profit) worst = { date, profit: s.profit };
  }
  if (best.profit === -Infinity) return null;
  return { best, worst };
}

export function getCostBreakdown() {
  const productCosts = state.costs.filter(c => c.type === 'product');
  const businessCosts = state.costs.filter(c => c.type === 'business');
  const totalProduct = productCosts.reduce((s, c) => s + c.amount, 0);
  const totalBusiness = businessCosts.reduce((s, c) => s + c.amount, 0);
  const total = totalProduct + totalBusiness;

  // Group by category
  const categoryMap = new Map<string, number>();
  state.costs.forEach(c => {
    const key = c.category || (c.type === 'product' ? 'Produto' : 'Negócio');
    categoryMap.set(key, (categoryMap.get(key) || 0) + c.amount);
  });

  const categories = Array.from(categoryMap.entries())
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    totalProduct,
    totalBusiness,
    total,
    productPercentage: total > 0 ? (totalProduct / total) * 100 : 0,
    businessPercentage: total > 0 ? (totalBusiness / total) * 100 : 0,
    categories,
    isHighCost: (() => {
      const week = getWeekSummary();
      return week.totalRevenue > 0 && week.totalRealCost > week.totalRevenue * 0.7;
    })(),
  };
}

export function getSmartInsights(): string[] {
  const insights: string[] = [];
  const today = getDaySummary();
  const yesterday = getPreviousDaySummary();
  const week = getWeekSummary();
  const prevWeek = getPreviousWeekSummary();
  const costBreakdown = getCostBreakdown();

  // Comparison with yesterday
  if (yesterday.totalRevenue > 0 && today.totalRevenue > 0) {
    const diff = today.profit - yesterday.profit;
    if (diff > 0) {
      insights.push(`📈 Seu lucro subiu R$ ${diff.toFixed(2)} comparado a ontem`);
    } else if (diff < 0) {
      insights.push(`📉 Seu lucro caiu R$ ${Math.abs(diff).toFixed(2)} comparado a ontem`);
    }
  }

  // Week over week
  if (prevWeek.totalRevenue > 0 && week.totalRevenue > 0) {
    if (week.profit > prevWeek.profit) {
      insights.push('🚀 Você está melhor que a semana passada!');
    } else if (week.profit < prevWeek.profit) {
      insights.push('⚠️ Seu desempenho esta semana está abaixo da anterior');
    }
  }

  // High cost alert
  if (costBreakdown.isHighCost) {
    insights.push('🔴 Seus custos estão acima de 70% da receita. Atenção!');
  }

  // Low margin
  if (today.totalRevenue > 0 && today.margin < 15) {
    insights.push('⚡ Sua margem hoje está muito baixa. Reveja os preços.');
  }

  // Projection
  if (week.totalEntries > 0) {
    const avgDailyProfit = week.profit / 7;
    const remainingDays = 7 - new Date().getDay();
    const projected = week.profit + avgDailyProfit * remainingDays;
    if (projected < 0) {
      insights.push('🔮 Se continuar assim, você terá prejuízo esta semana');
    }
  }

  // Top cost
  if (costBreakdown.categories.length > 0) {
    const top = costBreakdown.categories[0];
    if (top.percentage > 40) {
      insights.push(`💡 "${top.name}" representa ${top.percentage.toFixed(0)}% dos seus custos. Considere reduzir.`);
    }
  }

  // Positive reinforcement
  if (today.profit > 0 && today.margin > 30) {
    insights.push('👏 Excelente margem hoje! Continue assim.');
  }

  if (insights.length === 0 && today.totalRevenue === 0 && today.totalRealCost === 0) {
    insights.push('💡 Registre suas vendas e custos para receber insights personalizados');
  }

  return insights;
}

export function getRecentEntries(limit: number = 50): Entry[] {
  return [...state.entries].sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
}

export function getRecentCosts(limit: number = 50): Cost[] {
  return [...state.costs].sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
}

export function getInsight(date: string = getDateString()): string | null {
  const { totalRevenue, totalRealCost, profit } = getDaySummary(date);
  if (totalRevenue === 0 && totalRealCost === 0) return null;
  if (profit < 0) return 'Hoje você gastou mais do que ganhou. Fique de olho!';
  if (totalRealCost > totalRevenue * 0.8 && totalRevenue > 0)
    return 'Seu custo está alto em relação às vendas.';
  if (profit > 0 && profit < totalRevenue * 0.15 && totalRevenue > 0)
    return 'Você pode estar lucrando pouco. Reveja seus custos.';
  if (profit > 0) return '👏 Bom trabalho! Continue assim.';
  return null;
}

export function suggestCategory(description: string, businessType: BusinessType): { type: 'product' | 'business'; category: string } | null {
  const desc = description.toLowerCase();
  const { businessConfigs } = await import('./business-config') as any;
  const config = businessConfigs[businessType];

  for (const cat of config.costCategories.product) {
    if (desc.includes(cat.toLowerCase())) return { type: 'product', category: cat };
  }
  for (const cat of config.costCategories.business) {
    if (desc.includes(cat.toLowerCase())) return { type: 'business', category: cat };
  }

  // Common keywords
  const productKeywords = ['ingrediente', 'mercadoria', 'estoque', 'produto', 'insumo', 'material', 'embalagem', 'ração', 'tinta', 'creme', 'chocolate', 'carne', 'frango', 'bebida'];
  const businessKeywords = ['aluguel', 'energia', 'luz', 'água', 'internet', 'funcionário', 'salário', 'conta', 'imposto', 'taxa', 'software', 'sistema', 'gás'];

  for (const kw of productKeywords) {
    if (desc.includes(kw)) return { type: 'product', category: 'Produto' };
  }
  for (const kw of businessKeywords) {
    if (desc.includes(kw)) return { type: 'business', category: 'Negócio' };
  }

  return null;
}

export function resetAll() {
  state = { businessType: null, entries: [], costs: [] };
  notify();
}
