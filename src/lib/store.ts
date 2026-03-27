import { BusinessType, businessConfigs } from './business-config';

export type EntrySource = 'manual' | 'estimated' | 'distributed';

export interface Entry {
  id: string;
  amount: number;
  date: string;
  createdAt: number;
  description?: string;
  category?: string;
  source?: EntrySource;
}

export type CostClassification = 'fixed' | 'variable';

export interface Cost {
  id: string;
  amount: number;
  type: 'product' | 'business';
  classification: CostClassification;
  spreadDays: number;
  date: string;
  createdAt: number;
  description?: string;
  category?: string;
  subcategory?: string;
}

export interface Goals {
  monthlyProfit: number | null;
  monthlyMargin: number | null;
}

export interface BusinessProfile {
  name: string;
  city: string;
  operatingDays: number;
  employeeCount: number;
  objective: 'increase_profit' | 'reduce_costs' | 'organize' | '';
  operatingWeekdays: number[]; // 0=Dom, 1=Seg, ..., 6=Sáb
}

export interface CostMapItem {
  id: string;
  name: string;
  classification: CostClassification;
  value: number;
  spreadDays: number; // variable: user-defined (e.g. 5, 7, 15, 30); fixed: always 30
}

export interface AppState {
  businessType: BusinessType | null;
  onboardingComplete: boolean;
  entries: Entry[];
  costs: Cost[];
  costMap: CostMapItem[];
  averageSales?: number;
  mainCosts?: string[];
  goals: Goals;
  businessProfile: BusinessProfile;
}

const STORAGE_KEY = 'lucro-real-data';

const defaultProfile: BusinessProfile = { name: '', city: '', operatingDays: 6, employeeCount: 0, objective: '', operatingWeekdays: [1, 2, 3, 4, 5, 6] };

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const loaded = { goals: { monthlyProfit: null, monthlyMargin: null }, businessProfile: defaultProfile, costMap: [], onboardingComplete: false, ...parsed };
      // Ensure operatingWeekdays exists for older data
      if (!loaded.businessProfile.operatingWeekdays) {
        loaded.businessProfile.operatingWeekdays = [1, 2, 3, 4, 5, 6];
      }
      return loaded;
    }
  } catch {}
  return { businessType: null, onboardingComplete: false, entries: [], costs: [], costMap: [], goals: { monthlyProfit: null, monthlyMargin: null }, businessProfile: defaultProfile };
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

export function mergeState(partial: Partial<AppState>) {
  state = { ...state, ...partial };
  notify();
}

export function setBusinessType(type: BusinessType) {
  state = { ...state, businessType: type };
  notify();
}

export function setOnboardingComplete(complete: boolean) {
  state = { ...state, onboardingComplete: complete };
  notify();
}

export function setOnboardingData(data: { averageSales?: number; mainCosts?: string[] }) {
  state = { ...state, ...data };
  notify();
}

export function setGoals(goals: Partial<Goals>) {
  state = { ...state, goals: { ...state.goals, ...goals } };
  notify();
}

export function setBusinessProfile(profile: Partial<BusinessProfile>) {
  state = { ...state, businessProfile: { ...state.businessProfile, ...profile } };
  notify();
}

export function addEntry(amount: number, description?: string, category?: string, source: EntrySource = 'manual') {
  const today = new Date().toISOString().split('T')[0];
  const entry: Entry = {
    id: crypto.randomUUID(),
    amount,
    date: today,
    createdAt: Date.now(),
    description,
    category,
    source,
  };
  state = { ...state, entries: [...state.entries, entry] };
  notify();
}

export function setDayRevenue(date: string, amount: number, source: EntrySource = 'manual') {
  const otherEntries = state.entries.filter((e) => e.date !== date);
  const entry: Entry = {
    id: crypto.randomUUID(),
    amount,
    date,
    createdAt: Date.now(),
    description: source === 'distributed' ? 'Distribuído automaticamente' : source === 'estimated' ? 'Estimativa automática' : 'Total do dia',
    category: 'Receita diária',
    source,
  };
  state = { ...state, entries: [...otherEntries, entry] };
  notify();
}

export function getDayRevenueSource(date: string): EntrySource {
  const dayEntries = state.entries.filter((e) => e.date === date);
  if (dayEntries.length === 0) return 'estimated';
  // If any entry is manual, the day is manual
  if (dayEntries.some(e => e.source === 'manual' || !e.source)) return 'manual';
  if (dayEntries.some(e => e.source === 'distributed')) return 'distributed';
  return 'estimated';
}

export function getDayRevenue(date: string): number {
  return state.entries
    .filter((e) => e.date === date)
    .reduce((sum, e) => sum + e.amount, 0);
}

export function addCost(
  amount: number,
  type: 'product' | 'business',
  spreadDays: number = 1,
  description?: string,
  category?: string,
  subcategory?: string,
  classification?: CostClassification
) {
  const today = new Date().toISOString().split('T')[0];
  const inferredClassification = classification || (type === 'business' ? 'fixed' : 'variable');
  const cost: Cost = {
    id: crypto.randomUUID(),
    amount,
    type,
    classification: inferredClassification,
    spreadDays: type === 'business' ? 1 : spreadDays,
    date: today,
    createdAt: Date.now(),
    description,
    category,
    subcategory,
  };
  state = { ...state, costs: [...state.costs, cost] };
  
  // Sync to cost map
  const mapName = category || description || (type === 'product' ? 'Produto' : 'Negócio');
  const existingMapItem = state.costMap.find(
    i => i.name.toLowerCase() === mapName.toLowerCase()
  );
  if (existingMapItem) {
    // Update existing map item value (sum all costs with same category)
    const totalForCategory = state.costs
      .filter(c => (c.category || c.description || (c.type === 'product' ? 'Produto' : 'Negócio')).toLowerCase() === mapName.toLowerCase())
      .reduce((s, c) => s + c.amount, 0);
    state = {
      ...state,
      costMap: state.costMap.map(i =>
        i.id === existingMapItem.id ? { ...i, value: totalForCategory } : i
      ),
    };
  } else {
    // Create new map item
    const newItem: CostMapItem = {
      id: crypto.randomUUID(),
      name: mapName,
      classification: inferredClassification,
      value: amount,
      spreadDays: inferredClassification === 'fixed' ? 30 : 7,
    };
    state = { ...state, costMap: [...state.costMap, newItem] };
  }
  
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

export function isOperatingDay(dateStr: string): boolean {
  const weekdays = state.businessProfile?.operatingWeekdays ?? [1, 2, 3, 4, 5, 6];
  const d = new Date(dateStr + 'T00:00:00');
  return weekdays.includes(d.getDay());
}

export function getOperatingDaysInRange(days: number): string[] {
  const weekdays = state.businessProfile?.operatingWeekdays ?? [1, 2, 3, 4, 5, 6];
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (weekdays.includes(d.getDay())) {
      dates.push(getDateString(d));
    }
  }
  return dates;
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
  const fixedCosts = state.costs.filter(c => c.classification === 'fixed' || c.type === 'business');
  const variableCosts = state.costs.filter(c => c.classification === 'variable' || (!c.classification && c.type === 'product'));
  const totalProduct = productCosts.reduce((s, c) => s + c.amount, 0);
  const totalBusiness = businessCosts.reduce((s, c) => s + c.amount, 0);
  const totalFixed = fixedCosts.reduce((s, c) => s + c.amount, 0);
  const totalVariable = variableCosts.reduce((s, c) => s + c.amount, 0);
  const total = totalProduct + totalBusiness;

  const categoryMap = new Map<string, { amount: number; items: Cost[] }>();
  state.costs.forEach(c => {
    const key = c.category || (c.type === 'product' ? 'Produto' : 'Negócio');
    const existing = categoryMap.get(key) || { amount: 0, items: [] };
    existing.amount += c.amount;
    existing.items.push(c);
    categoryMap.set(key, existing);
  });

  const categories = Array.from(categoryMap.entries())
    .map(([name, data]) => ({
      name,
      amount: data.amount,
      count: data.items.length,
      percentage: total > 0 ? (data.amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const subcategoryMap = new Map<string, number>();
  state.costs.forEach(c => {
    if (c.subcategory) {
      subcategoryMap.set(c.subcategory, (subcategoryMap.get(c.subcategory) || 0) + c.amount);
    }
  });
  const subcategories = Array.from(subcategoryMap.entries())
    .map(([name, amount]) => ({ name, amount, percentage: total > 0 ? (amount / total) * 100 : 0 }))
    .sort((a, b) => b.amount - a.amount);

  const week = getWeekSummary();
  const profitImpact = categories.map(cat => ({
    name: cat.name,
    amount: cat.amount,
    profitImpactPercent: week.totalRevenue > 0 ? (cat.amount / week.totalRevenue) * 100 : 0,
  }));

  return {
    totalProduct,
    totalBusiness,
    totalFixed,
    totalVariable,
    total,
    productPercentage: total > 0 ? (totalProduct / total) * 100 : 0,
    businessPercentage: total > 0 ? (totalBusiness / total) * 100 : 0,
    fixedPercentage: total > 0 ? (totalFixed / total) * 100 : 0,
    variablePercentage: total > 0 ? (totalVariable / total) * 100 : 0,
    categories,
    subcategories,
    profitImpact,
    isHighCost: (() => {
      return week.totalRevenue > 0 && week.totalRealCost > week.totalRevenue * 0.7;
    })(),
    topCost: categories.length > 0 ? categories[0] : null,
  };
}

// ─── Trend Detection ───────────────────────────────────────────────

function getLastNDaysSummaries(n: number) {
  const results: { date: string; revenue: number; cost: number; profit: number; margin: number }[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getDateString(d);
    const s = getDaySummary(dateStr);
    results.push({ date: dateStr, revenue: s.totalRevenue, cost: s.totalRealCost, profit: s.profit, margin: s.margin });
  }
  return results;
}

export interface ProactiveAlert {
  type: 'danger' | 'warning' | 'success' | 'info';
  icon: string;
  title: string;
  message: string;
  actionHint?: string;
}

export function getProactiveAlerts(): ProactiveAlert[] {
  const alerts: ProactiveAlert[] = [];
  const last7 = getLastNDaysSummaries(7);
  const last3 = last7.slice(0, 3);
  const week = getWeekSummary();
  const month = getMonthSummary();
  const costBreakdown = getCostBreakdown();

  const activeDays = last7.filter(d => d.revenue > 0 || d.cost > 0);
  if (activeDays.length < 2) return alerts;

  // 1. Cost trending up last 3 days
  const costDays = last3.filter(d => d.cost > 0);
  if (costDays.length >= 3 && costDays[0].cost > costDays[1].cost && costDays[1].cost > costDays[2].cost) {
    alerts.push({
      type: 'warning',
      icon: 'trend-up',
      title: 'Custos em alta',
      message: `Seu custo aumentou nos últimos 3 dias. Sua margem pode cair.`,
      actionHint: 'Revise seus custos variáveis',
    });
  }

  // 2. Profit trending down
  const profitDays = last3.filter(d => d.revenue > 0);
  if (profitDays.length >= 3 && profitDays[0].profit < profitDays[1].profit && profitDays[1].profit < profitDays[2].profit) {
    alerts.push({
      type: 'danger',
      icon: 'trend-down',
      title: 'Lucro em queda',
      message: `Seu lucro caiu 3 dias seguidos. Se continuar assim, pode ter prejuízo.`,
    });
  }

  // 3. Week projection
  if (week.totalEntries > 0) {
    const daysElapsed = activeDays.length || 1;
    const avgDailyProfit = week.profit / daysElapsed;
    const remaining = 7 - daysElapsed;
    const projected = week.profit + avgDailyProfit * remaining;
    if (projected < 0) {
      alerts.push({
        type: 'danger',
        icon: 'alert',
        title: 'Previsão de prejuízo',
        message: `Se continuar assim, você terminará a semana com prejuízo de ${formatCurrencySimple(Math.abs(projected))}.`,
        actionHint: 'Aumente as vendas ou reduza custos',
      });
    } else if (avgDailyProfit > 0 && projected > week.profit) {
      alerts.push({
        type: 'success',
        icon: 'rocket',
        title: 'Lucro crescendo',
        message: `Se manter esse ritmo, seu lucro semanal pode chegar a ${formatCurrencySimple(projected)}.`,
      });
    }
  }

  // 4. Low margin
  if (week.totalRevenue > 0 && week.margin < 15 && week.margin >= 0) {
    alerts.push({
      type: 'warning',
      icon: 'zap',
      title: 'Margem muito baixa',
      message: `Sua margem está em ${week.margin.toFixed(0)}%. Ideal é acima de 20%.`,
      actionHint: 'Revise seus preços ou custos',
    });
  }

  // 5. Top cost impact
  if (costBreakdown.topCost && costBreakdown.topCost.percentage > 35) {
    const top = costBreakdown.topCost;
    const potentialSaving = top.amount * 0.1;
    alerts.push({
      type: 'info',
      icon: 'lightbulb',
      title: `${top.name}: ${top.percentage.toFixed(0)}% dos custos`,
      message: `Reduzir esse custo em 10% economizaria ${formatCurrencySimple(potentialSaving)}.`,
      actionHint: 'Negocie com fornecedores',
    });
  }

  // 6. Goal progress
  if (state.goals.monthlyProfit && state.goals.monthlyProfit > 0) {
    const progress = (month.profit / state.goals.monthlyProfit) * 100;
    const dayOfMonth = new Date().getDate();
    const expectedProgress = (dayOfMonth / 30) * 100;
    if (progress >= 100) {
      alerts.push({
        type: 'success',
        icon: 'trophy',
        title: 'Meta atingida!',
        message: `Você já atingiu sua meta de lucro mensal de ${formatCurrencySimple(state.goals.monthlyProfit)}!`,
      });
    } else if (progress < expectedProgress * 0.7 && dayOfMonth > 7) {
      alerts.push({
        type: 'warning',
        icon: 'target',
        title: 'Meta em risco',
        message: `Você atingiu ${progress.toFixed(0)}% da meta, mas deveria estar em ${expectedProgress.toFixed(0)}%.`,
        actionHint: 'Intensifique as vendas',
      });
    }
  }

  // 7. Best day
  const bestDay = getBestDayOfWeek();
  if (bestDay) {
    alerts.push({
      type: 'info',
      icon: 'chart',
      title: `Melhor dia: ${bestDay.day}`,
      message: `Lucro médio de ${formatCurrencySimple(bestDay.avgProfit)} às ${bestDay.day}s. Foque mais vendas nesse dia.`,
    });
  }

  return alerts.slice(0, 4);
}

function getBestDayOfWeek() {
  const weekday = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const dayProfits: { total: number; count: number }[] = Array.from({ length: 7 }, () => ({ total: 0, count: 0 }));

  const dates = getDateRange(30);
  for (const date of dates) {
    const s = getDaySummary(date);
    if (s.totalRevenue === 0) continue;
    const d = new Date(date + 'T00:00:00');
    const dow = d.getDay();
    dayProfits[dow].total += s.profit;
    dayProfits[dow].count++;
  }

  let bestIdx = -1;
  let bestAvg = -Infinity;
  for (let i = 0; i < 7; i++) {
    if (dayProfits[i].count >= 2) {
      const avg = dayProfits[i].total / dayProfits[i].count;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestIdx = i;
      }
    }
  }

  if (bestIdx === -1) return null;
  return { day: weekday[bestIdx], avgProfit: bestAvg };
}

function formatCurrencySimple(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ─── Goals Progress ────────────────────────────────────────────────

export function getGoalsProgress() {
  const month = getMonthSummary();
  const goals = state.goals;
  const dayOfMonth = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const monthProgress = (dayOfMonth / daysInMonth) * 100;

  return {
    profit: {
      target: goals.monthlyProfit,
      current: month.profit,
      progress: goals.monthlyProfit ? Math.min((month.profit / goals.monthlyProfit) * 100, 100) : 0,
      onTrack: goals.monthlyProfit ? (month.profit / goals.monthlyProfit) * 100 >= monthProgress * 0.8 : true,
    },
    margin: {
      target: goals.monthlyMargin,
      current: month.margin,
      progress: goals.monthlyMargin ? Math.min((month.margin / goals.monthlyMargin) * 100, 100) : 0,
      onTrack: goals.monthlyMargin ? month.margin >= goals.monthlyMargin * 0.8 : true,
    },
    monthProgress,
    daysRemaining: daysInMonth - dayOfMonth,
  };
}

// ─── Margin Trend ──────────────────────────────────────────────────

export function getMarginTrend(): { direction: 'up' | 'down' | 'stable'; values: number[] } {
  const last7 = getLastNDaysSummaries(7);
  const margins = last7.filter(d => d.revenue > 0).map(d => d.margin);
  if (margins.length < 2) return { direction: 'stable', values: margins };
  const recent = margins.slice(0, Math.min(3, margins.length));
  const avgRecent = recent.reduce((s, v) => s + v, 0) / recent.length;
  const older = margins.slice(Math.min(3, margins.length));
  if (older.length === 0) return { direction: 'stable', values: margins };
  const avgOlder = older.reduce((s, v) => s + v, 0) / older.length;
  const diff = avgRecent - avgOlder;
  return {
    direction: diff > 3 ? 'up' : diff < -3 ? 'down' : 'stable',
    values: margins,
  };
}

export function getMonthlyProjection(): { revenue: number; cost: number; profit: number; margin: number } {
  const month = getMonthSummary();
  const dayOfMonth = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  if (dayOfMonth === 0 || month.totalRevenue === 0) return { revenue: 0, cost: 0, profit: 0, margin: 0 };
  const factor = daysInMonth / dayOfMonth;
  const revenue = month.totalRevenue * factor;
  const cost = month.totalRealCost * factor;
  const profit = revenue - cost;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  return { revenue, cost, profit, margin };
}

export function getCostPerSale(): number {
  const week = getWeekSummary();
  return week.totalEntries > 0 ? week.totalRealCost / week.totalEntries : 0;
}

export function getProfitPerSale(): number {
  const week = getWeekSummary();
  return week.totalEntries > 0 ? week.profit / week.totalEntries : 0;
}

// ─── Enhanced Smart Insights ───────────────────────────────────────

export function getSmartInsights(): string[] {
  const insights: string[] = [];
  const today = getDaySummary();
  const yesterday = getPreviousDaySummary();
  const week = getWeekSummary();
  const prevWeek = getPreviousWeekSummary();
  const costBreakdown = getCostBreakdown();
  const month = getMonthSummary();

  if (yesterday.totalRevenue > 0 && today.totalRevenue > 0) {
    const diff = today.profit - yesterday.profit;
    if (diff > 0) {
      insights.push(`Lucro subiu R$ ${Math.round(diff)} vs ontem — continue assim`);
    } else if (diff < -10) {
      insights.push(`Lucro caiu R$ ${Math.round(Math.abs(diff))} vs ontem — verifique seus custos`);
    }
  }

  if (prevWeek.totalRevenue > 0 && week.totalRevenue > 0) {
    const diff = week.profit - prevWeek.profit;
    if (diff > 0) {
      insights.push(`Semana ${formatCurrencySimple(Math.abs(diff))} melhor que a anterior`);
    } else if (diff < 0) {
      insights.push(`Semana ${formatCurrencySimple(Math.abs(diff))} pior que a anterior — hora de agir`);
    }
  }

  if (costBreakdown.isHighCost && week.totalRevenue > 0) {
    const excess = week.totalRealCost - week.totalRevenue * 0.6;
    insights.push(`Custos altos — reduzir ${formatCurrencySimple(excess)} colocaria margem em 40%`);
  }

  if (costBreakdown.categories.length > 0 && costBreakdown.total > 0) {
    const top = costBreakdown.categories[0];
    if (top.percentage > 30) {
      const saving10 = top.amount * 0.1;
      insights.push(`${top.name} = ${top.percentage.toFixed(0)}% dos custos. Reduzir 10% = +${formatCurrencySimple(saving10)} de lucro`);
    }
  }

  if (today.totalRevenue > 0 && today.margin < 15) {
    const neededRevenue = today.totalRealCost / 0.8;
    const extra = neededRevenue - today.totalRevenue;
    insights.push(`Margem baixa (${today.margin.toFixed(0)}%) — mais ${formatCurrencySimple(extra)} em vendas hoje daria 20%`);
  }

  if (week.totalEntries > 0) {
    const avgDailyProfit = week.profit / 7;
    const projected30 = avgDailyProfit * 30;
    if (projected30 > 0) {
      insights.push(`Projeção mensal: ${formatCurrencySimple(projected30)} de lucro mantendo esse ritmo`);
    } else if (projected30 < 0) {
      insights.push(`Projeção: prejuízo de ${formatCurrencySimple(Math.abs(projected30))} no mês se continuar assim`);
    }
  }

  if (state.goals.monthlyProfit && month.profit > 0) {
    const pct = (month.profit / state.goals.monthlyProfit) * 100;
    insights.push(`Meta mensal: ${pct.toFixed(0)}% atingida (${formatCurrencySimple(month.profit)} de ${formatCurrencySimple(state.goals.monthlyProfit)})`);
  }

  if (today.profit > 0 && today.margin > 30) {
    insights.push('Margem excelente hoje — dia lucrativo');
  }

  if (insights.length === 0 && today.totalRevenue === 0 && today.totalRealCost === 0) {
    insights.push('Registre suas vendas e custos para receber insights personalizados');
  }

  return insights.slice(0, 5);
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
  if (profit > 0) return 'Bom trabalho! Continue assim.';
  return null;
}

export function suggestCategory(description: string, businessType: BusinessType): { type: 'product' | 'business'; category: string } | null {
  const desc = description.toLowerCase();
  const config = businessConfigs[businessType];

  for (const cat of config.costCategories.product) {
    if (desc.includes(cat.toLowerCase())) return { type: 'product', category: cat };
  }
  for (const cat of config.costCategories.business) {
    if (desc.includes(cat.toLowerCase())) return { type: 'business', category: cat };
  }

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

// ─── Cost Map ──────────────────────────────────────────────────────

const VARIABLE_COST_NAMES = ['Ingredientes', 'Bebidas', 'Embalagens', 'Descartáveis', 'Produtos', 'Tintas', 'Cremes', 'Lâminas', 'Ração', 'Produtos pet', 'Medicamentos', 'Acessórios', 'Mercadoria', 'Estoque', 'Equipamentos', 'Suplementos', 'Manutenção', 'Limpeza', 'Materiais', 'Insumos'];
const FIXED_COST_NAMES = ['Aluguel', 'Energia', 'Água', 'Gás', 'Sistema/Software', 'Contas', 'Internet', 'Folha de pagamento'];

export function classifyCostName(name: string): CostClassification {
  if (FIXED_COST_NAMES.some(f => name.toLowerCase() === f.toLowerCase())) return 'fixed';
  if (VARIABLE_COST_NAMES.some(v => name.toLowerCase() === v.toLowerCase())) return 'variable';
  return 'variable';
}

export function initCostMapFromOnboarding(selectedCosts: string[]) {
  const items: CostMapItem[] = selectedCosts.map(name => {
    const classification = classifyCostName(name);
    return {
      id: crypto.randomUUID(),
      name,
      classification,
      value: 0,
      spreadDays: classification === 'fixed' ? 30 : 7,
    };
  });
  state = { ...state, costMap: items };
  notify();
}

export function updateCostMapItem(id: string, updates: Partial<Pick<CostMapItem, 'name' | 'classification' | 'value' | 'spreadDays'>>) {
  state = {
    ...state,
    costMap: state.costMap.map(item => item.id === id ? { ...item, ...updates } : item),
  };
  notify();
}

export function deleteCostMapItem(id: string) {
  state = { ...state, costMap: state.costMap.filter(item => item.id !== id) };
  notify();
}

export function addCostMapItem(name: string, classification: CostClassification, value: number = 0) {
  const item: CostMapItem = {
    id: crypto.randomUUID(),
    name,
    classification,
    value,
    spreadDays: classification === 'fixed' ? 30 : 7,
  };
  state = { ...state, costMap: [...state.costMap, item] };
  notify();
}

/** Get the monthly equivalent of a cost map item */
export function getMonthlyEquivalent(item: CostMapItem): number {
  if (item.value <= 0) return 0;
  if (item.classification === 'fixed') return item.value; // already monthly
  const days = item.spreadDays || 7;
  return (item.value / days) * 30;
}

export function getCostMap() {
  const fixed = state.costMap.filter(i => i.classification === 'fixed');
  const variable = state.costMap.filter(i => i.classification === 'variable');
  const totalFixed = fixed.reduce((s, i) => s + i.value, 0);
  const totalVariable = variable.reduce((s, i) => s + i.value, 0);
  const totalMonthly = state.costMap.reduce((s, i) => s + getMonthlyEquivalent(i), 0);
  return { fixed, variable, totalFixed, totalVariable, total: totalFixed + totalVariable, totalMonthly };
}

export function resetAll() {
  state = { businessType: null, onboardingComplete: false, entries: [], costs: [], costMap: [], goals: { monthlyProfit: null, monthlyMargin: null }, businessProfile: defaultProfile };
  notify();
}
