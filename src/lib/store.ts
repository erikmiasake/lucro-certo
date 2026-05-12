import { BusinessType, businessConfigs } from './business-config';
import { safeGetItem, safeSetItem } from './safe-storage';

export type EntrySource = 'manual' | 'estimated' | 'distributed' | 'onboarding';

export interface Entry {
  id: string;
  amount: number;
  date: string;
  createdAt: number;
  description?: string;
  category?: string;
  source?: EntrySource;
}

// ─── Unified Transaction Model ────────────────────────────────────
export type TransactionType = 'entrada' | 'saida';

export interface Transaction {
  id: string;
  tipo: TransactionType;
  valor: number;
  data: string;
  categoria?: string;
  descricao?: string;
  createdAt: number;
  /** Original source for entries */
  source?: EntrySource;
  /** For costs: classification */
  classification?: CostClassification;
  /** For costs: spread days */
  spreadDays?: number;
  /** Whether it comes from the cost map */
  fromCostMap?: boolean;
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
  createdAt?: number; // timestamp for persistent date reference
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
    const raw = safeGetItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const loaded = { goals: { monthlyProfit: null, monthlyMargin: null }, businessProfile: defaultProfile, costMap: [], onboardingComplete: false, ...parsed };
      if (!loaded.businessProfile.operatingWeekdays) {
        loaded.businessProfile.operatingWeekdays = [1, 2, 3, 4, 5, 6];
      }
      loaded.costMap = (loaded.costMap || []).map((item: any) => ({
        ...item,
        spreadDays: item.spreadDays ?? (item.classification === 'fixed' ? 30 : 7),
        createdAt: item.createdAt ?? Date.now(),
      }));
      return loaded;
    }
  } catch {}
  return { businessType: null, onboardingComplete: false, entries: [], costs: [], costMap: [], goals: { monthlyProfit: null, monthlyMargin: null }, businessProfile: defaultProfile };
}

function saveState(s: AppState) {
  safeSetItem(STORAGE_KEY, JSON.stringify(s));
}

let state = loadState();
// Sync costMap items into costs on startup
syncCostMapToCosts();
let listeners: (() => void)[] = [];

let _dbSyncTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleDBSync() {
  if (_dbSyncTimer) clearTimeout(_dbSyncTimer);
  _dbSyncTimer = setTimeout(async () => {
    try {
      const { saveAllEntriesToDB, saveAllCostsToDB } = await import('@/lib/financial-sync');
      const { saveProfileToDB } = await import('@/lib/profile-sync');
      await Promise.all([
        saveAllEntriesToDB(state.entries),
        saveAllCostsToDB(state.costs),
        saveProfileToDB(state),
      ]);
    } catch (e) {
      console.error('DB sync error:', e);
    }
  }, 1500);
}

function notify() {
  saveState(state);
  listeners.forEach((l) => l());
  scheduleDBSync();
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
  syncCostMapToCosts();
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

export function addEntry(amount: number, description?: string, category?: string, source: EntrySource = 'manual', date?: string) {
  const entryDate = date || new Date().toISOString().split('T')[0];
  const entry: Entry = {
    id: crypto.randomUUID(),
    amount,
    date: entryDate,
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
  if (dayEntries.some(e => e.source === 'manual' || !e.source)) return 'manual';
  if (dayEntries.some(e => e.source === 'distributed')) return 'distributed';
  return 'estimated';
}

export function getDayRevenue(date: string): number {
  return state.entries
    .filter((e) => e.date === date)
    .reduce((sum, e) => sum + e.amount, 0);
}

// ─── COSTS ─────────────────────────────────────────────────────────
// addCost: only adds manual costs. Does NOT touch costMap.
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
  notify();
}

export function deleteEntry(id: string) {
  state = { ...state, entries: state.entries.filter((e) => e.id !== id) };
  notify();
}

export function deleteCost(id: string) {
  if (id.startsWith('costmap-')) {
    const mapId = id.replace('costmap-', '');
    state = { ...state, costMap: state.costMap.filter(item => item.id !== mapId) };
    syncCostMapToCosts();
  } else {
    state = { ...state, costs: state.costs.filter((c) => c.id !== id) };
  }
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

/** Count operating days in the current month up to today */
function getOperatingDaysInMonthSoFar(): number {
  const weekdays = state.businessProfile?.operatingWeekdays ?? [1, 2, 3, 4, 5, 6];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  let count = 0;
  for (let day = 1; day <= now.getDate(); day++) {
    const d = new Date(year, month, day);
    if (weekdays.includes(d.getDay())) count++;
  }
  return count;
}

/** Count total operating days in the current month */
function getTotalOperatingDaysInMonth(): number {
  const weekdays = state.businessProfile?.operatingWeekdays ?? [1, 2, 3, 4, 5, 6];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let count = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    if (weekdays.includes(d.getDay())) count++;
  }
  return count;
}

// ─── Cost Impact ───────────────────────────────────────────────────

function getCostImpactOnDate(cost: Cost, targetDate: string): number {
  if (isDerivedCost(cost)) {
    if (cost.classification === 'fixed') {
      return cost.amount / 30;
    }

    const spreadDays = Math.max(cost.spreadDays || 1, 1);
    return cost.amount / spreadDays;
  }

  const costDate = new Date(cost.date + 'T00:00:00');
  const target = new Date(targetDate + 'T00:00:00');
  const diffDays = Math.floor((target.getTime() - costDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0 || diffDays >= cost.spreadDays) return 0;
  return cost.amount / cost.spreadDays;
}

function getCostImpactInRange(cost: Cost, dates: string[]): number {
  return dates.reduce((sum, date) => sum + getCostImpactOnDate(cost, date), 0);
}

function isDerivedCost(cost: Cost): boolean {
  return cost.id.startsWith('costmap-');
}

/** Get the cost impact aggregated over the current calendar month */
function getCostImpactForCurrentMonth(cost: Cost): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let total = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    total += getCostImpactOnDate(cost, dateStr);
  }
  return total;
}

export function getCostAnalysisAmount(cost: Cost): number {
  return getCostImpactForCurrentMonth(cost);
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
  const entryCount = dayEntries.length;
  return { totalRevenue, totalRealCost, profit, margin, entryCount };
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

/** Get date strings for the current calendar month (1st to last day) */
function getCurrentMonthDates(): string[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dates: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    dates.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }
  return dates;
}

function getDateRangeSummary(dates: string[]) {
  let totalRevenue = 0;
  let totalRealCost = 0;
  let totalEntries = 0;

  for (const date of dates) {
    const summary = getDaySummary(date);
    totalRevenue += summary.totalRevenue;
    totalRealCost += summary.totalRealCost;
    totalEntries += summary.entryCount;
  }

  const profit = totalRevenue - totalRealCost;
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  return { totalRevenue, totalRealCost, profit, margin, totalEntries };
}

function getPeriodSummary(days: number) {
  const dates = getDateRange(days);
  return getDateRangeSummary(dates);
}

export function getWeekSummary() {
  return getPeriodSummary(7);
}

export function getMonthSummary() {
  return getDateRangeSummary(getCurrentMonthDates());
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

export function getWeekDailyData(filterNonOperating = false) {
  const weekday = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const days: { label: string; date: string; profit: number; revenue: number; cost: number; margin: number; operating: boolean }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = getDateString(d);
    const operating = isOperatingDay(dateStr);
    const s = getDaySummary(dateStr);
    days.push({
      label: weekday[d.getDay()],
      date: dateStr,
      profit: s.profit,
      revenue: s.totalRevenue,
      cost: s.totalRealCost,
      margin: s.margin,
      operating,
    });
  }
  if (filterNonOperating) {
    return days.filter(d => d.operating || d.revenue > 0 || d.cost > 0);
  }
  return days;
}

export function getBestAndWorstDay(days: number = 30) {
  const dates = getDateRange(days);
  let best = { date: '', profit: -Infinity };
  let worst = { date: '', profit: Infinity };
  for (const date of dates) {
    // Skip non-operating days and days without actual user-recorded transactions
    if (!isOperatingDay(date)) continue;
    const hasEntries = state.entries.some(e => e.date === date);
    const hasCosts = state.costs.some(c => c.date === date);
    if (!hasEntries && !hasCosts) continue;
    const s = getDaySummary(date);
    if (s.profit > best.profit) best = { date, profit: s.profit };
    if (s.profit < worst.profit) worst = { date, profit: s.profit };
  }
  if (best.profit === -Infinity) return null;
  return { best, worst };
}

// ─── Cost Breakdown (normalized to monthly impact) ─────────────────

export function getCostBreakdown() {
  const productCosts = state.costs.filter(c => c.type === 'product');
  const businessCosts = state.costs.filter(c => c.type === 'business');
  // Use classification as primary discriminator; fall back to type only when classification is missing
  const fixedCosts = state.costs.filter(c => c.classification ? c.classification === 'fixed' : c.type === 'business');
  const variableCosts = state.costs.filter(c => c.classification ? c.classification === 'variable' : c.type === 'product');

  const totalProduct = productCosts.reduce((s, c) => s + getCostImpactForCurrentMonth(c), 0);
  const totalBusiness = businessCosts.reduce((s, c) => s + getCostImpactForCurrentMonth(c), 0);
  const totalFixed = fixedCosts.reduce((s, c) => s + getCostImpactForCurrentMonth(c), 0);
  const totalVariable = variableCosts.reduce((s, c) => s + getCostImpactForCurrentMonth(c), 0);
  const total = totalFixed + totalVariable;

  const categoryMap = new Map<string, { amount: number; items: Cost[] }>();
  state.costs.forEach(c => {
    const key = c.category || (c.type === 'product' ? 'Produto' : 'Negócio');
    const existing = categoryMap.get(key) || { amount: 0, items: [] };
    existing.amount += getCostImpactForCurrentMonth(c);
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
      subcategoryMap.set(c.subcategory, (subcategoryMap.get(c.subcategory) || 0) + getCostImpactForCurrentMonth(c));
    }
  });
  const subcategories = Array.from(subcategoryMap.entries())
    .map(([name, amount]) => ({ name, amount, percentage: total > 0 ? (amount / total) * 100 : 0 }))
    .sort((a, b) => b.amount - a.amount);

  const month = getMonthSummary();
  const profitImpact = categories.map(cat => ({
    name: cat.name,
    amount: cat.amount,
    profitImpactPercent: month.totalRevenue > 0 ? (cat.amount / month.totalRevenue) * 100 : 0,
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
      return month.totalRevenue > 0 && month.totalRealCost > month.totalRevenue * 0.7;
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

  if (last3.filter(d => d.cost > 0).length >= 3 && last3[0].cost > last3[1].cost && last3[1].cost > last3[2].cost) {
    alerts.push({
      type: 'warning',
      icon: 'trend-up',
      title: 'Custos em alta',
      message: `Seu custo aumentou nos últimos 3 dias. Sua margem pode cair.`,
      actionHint: 'Revise seus custos variáveis',
    });
  }

  const profitDays = last3.filter(d => d.revenue > 0);
  if (profitDays.length >= 3 && profitDays[0].profit < profitDays[1].profit && profitDays[1].profit < profitDays[2].profit) {
    alerts.push({
      type: 'danger',
      icon: 'trend-down',
      title: 'Lucro em queda',
      message: `Seu lucro caiu 3 dias seguidos. Se continuar assim, pode ter prejuízo.`,
    });
  }

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
        actionHint: 'Aumente as entradas ou reduza custos',
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

  if (week.totalRevenue > 0 && week.margin < 15 && week.margin >= 0) {
    alerts.push({
      type: 'warning',
      icon: 'zap',
      title: 'Margem muito baixa',
      message: `Sua margem está em ${week.margin.toFixed(0)}%. Ideal é acima de 20%.`,
      actionHint: 'Revise seus preços ou custos',
    });
  }

  if (costBreakdown.topCost && costBreakdown.topCost.percentage > 35) {
    const top = costBreakdown.topCost;
    const potentialSaving = top.amount * 0.1;
    alerts.push({
      type: 'info',
      icon: 'lightbulb',
      title: `${top.name}: ${top.percentage.toFixed(0)}% dos custos`,
      message: `Reduzir esse custo em 10% economizaria ${formatCurrencySimple(potentialSaving)}/mês.`,
      actionHint: 'Negocie com fornecedores',
    });
  }

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
        actionHint: 'Intensifique as entradas',
      });
    }
  }

  const bestDay = getBestDayOfWeek();
  if (bestDay) {
    alerts.push({
      type: 'info',
      icon: 'chart',
      title: `Melhor dia: ${bestDay.day}`,
      message: `Lucro médio de ${formatCurrencySimple(bestDay.avgProfit)} às ${bestDay.day}s. Foque mais receita nesse dia.`,
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

// ─── Monthly Projection (based on days with actual movement) ───────

export function getMonthlyProjection(): { revenue: number; cost: number; profit: number; margin: number; daysWithData: number; totalOpDays: number } {
  const month = getMonthSummary();
  const totalOpDays = getTotalOperatingDaysInMonth();

  // Count days in current month that actually had transactions
  const now = new Date();
  const year = now.getFullYear();
  const m = now.getMonth();
  const todayDay = now.getDate();
  let daysWithData = 0;

  for (let d = 1; d <= todayDay; d++) {
    const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayEntries = state.entries.filter(e => e.date === dateStr);
    const dayCosts = state.costs.filter(c => c.date === dateStr);
    if (dayEntries.length > 0 || dayCosts.length > 0) {
      daysWithData++;
    }
  }

  if (daysWithData === 0 || month.totalRevenue === 0) return { revenue: 0, cost: 0, profit: 0, margin: 0, daysWithData: 0, totalOpDays };

  // Average daily performance based only on days with actual movement
  const avgDailyRevenue = month.totalRevenue / daysWithData;
  const avgDailyCost = month.totalRealCost / daysWithData;
  const avgDailyProfit = avgDailyRevenue - avgDailyCost;

  // Project to full month using total operating days
  const revenue = avgDailyRevenue * totalOpDays;
  const cost = avgDailyCost * totalOpDays;
  const profit = avgDailyProfit * totalOpDays;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  return { revenue, cost, profit, margin, daysWithData, totalOpDays };
}

// Per-sale metrics removed — system now uses financial movements model
// Revenue = sum of all entries, Costs = sum of all exits, Profit = revenue - costs

// ─── Consolidated Financial Summary for AI ─────────────────────────

export interface FinancialSummary {
  period: string;
  revenue: number;
  costs: number;
  profit: number;
  margin: number;
  entries: number;
  avgPerEntry: number;
  operatingDaysPerWeek: number;
  operatingWeekdays: number[];
  realDataPercentage: number;
  bestDay: { date: string; profit: number } | null;
  worstDay: { date: string; profit: number } | null;
  marginTrend: 'up' | 'down' | 'stable';
  monthlyProjection: { revenue: number; cost: number; profit: number; margin: number } | null;
  topCost: { name: string; percentage: number } | null;
  totalFixed: number;
  totalVariable: number;
  goalMonthlyProfit: number | null;
  goalProgress: number;
  goalOnTrack: boolean;
  daysRemaining: number;
  monthProfit: number;
  hasSufficientData: boolean;
}

export function getFinancialSummary(period: string = 'semana'): FinancialSummary {
  const week = getWeekSummary();
  const month = getMonthSummary();
  const breakdown = getCostBreakdown();
  const bestWorst = getBestAndWorstDay();
  const trend = getMarginTrend();
  const projection = getMonthlyProjection();
  const revenueStats = getRevenueStats();
  const goalsProgress = getGoalsProgress();
  const opWeekdays = state.businessProfile?.operatingWeekdays ?? [1, 2, 3, 4, 5, 6];

  const revenue = Math.round(week.totalRevenue);
  const costs = Math.round(week.totalRealCost);
  const profit = Math.round(week.profit);
  const entries = week.totalEntries;
  const margin = revenue > 0 ? Math.round(((revenue - costs) / revenue) * 100) : 0;

  // Minimum data threshold: at least 2 entries across 2 different days
  const hasSufficientData = entries >= 2 && (revenueStats.manualDays + revenueStats.distributedDays) >= 2;

  return {
    period,
    revenue,
    costs,
    profit,
    margin,
    entries,
    avgPerEntry: entries > 0 ? Math.round(revenue / entries) : 0,
    operatingDaysPerWeek: opWeekdays.length,
    operatingWeekdays: opWeekdays,
    realDataPercentage: Math.round(revenueStats.realDataPercentage),
    bestDay: bestWorst ? { date: bestWorst.best.date, profit: Math.round(bestWorst.best.profit) } : null,
    worstDay: bestWorst ? { date: bestWorst.worst.date, profit: Math.round(bestWorst.worst.profit) } : null,
    marginTrend: trend.direction,
    monthlyProjection: projection.revenue > 0 ? {
      revenue: Math.round(projection.revenue),
      cost: Math.round(projection.cost),
      profit: Math.round(projection.profit),
      margin: Math.round(projection.margin),
    } : null,
    topCost: breakdown.topCost ? { name: breakdown.topCost.name, percentage: Math.round(breakdown.topCost.percentage) } : null,
    totalFixed: Math.round(breakdown.totalFixed),
    totalVariable: Math.round(breakdown.totalVariable),
    goalMonthlyProfit: state.goals.monthlyProfit || null,
    goalProgress: Math.round(goalsProgress.profit.progress),
    goalOnTrack: goalsProgress.profit.onTrack,
    daysRemaining: goalsProgress.daysRemaining,
    monthProfit: Math.round(month.profit),
    hasSufficientData,
  };
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

  if (costBreakdown.isHighCost && month.totalRevenue > 0) {
    const excess = month.totalRealCost - month.totalRevenue * 0.6;
    insights.push(`Custos mensais altos — reduzir ${formatCurrencySimple(excess)} colocaria margem em 40%`);
  }

  if (costBreakdown.categories.length > 0 && costBreakdown.total > 0) {
    const top = costBreakdown.categories[0];
    if (top.percentage > 30) {
      const saving10 = top.amount * 0.1;
      insights.push(`${top.name} = ${top.percentage.toFixed(0)}% dos custos. Reduzir 10% = +${formatCurrencySimple(saving10)}/mês de lucro`);
    }
  }

  if (today.totalRevenue > 0 && today.margin < 15) {
    const neededRevenue = today.totalRealCost / 0.8;
    const extra = neededRevenue - today.totalRevenue;
    insights.push(`Margem baixa (${today.margin.toFixed(0)}%) — mais ${formatCurrencySimple(extra)} em receita hoje daria 20%`);
  }

  if (week.totalEntries > 0) {
    const opDays = state.businessProfile?.operatingWeekdays?.length ?? 6;
    const avgDailyProfit = week.profit / Math.min(7, opDays);
    const opDaysInMonth = getTotalOperatingDaysInMonth();
    const projected30 = avgDailyProfit * opDaysInMonth;
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
    insights.push(`Margem de ${today.margin.toFixed(0)}% hoje — lucro de ${formatCurrencySimple(today.profit)}`);
  }

  if (insights.length === 0 && today.totalRevenue === 0 && today.totalRealCost === 0) {
    insights.push('Registre suas entradas e saídas para receber insights personalizados');
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
    return 'Seu custo está alto em relação à receita.';
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

/**
 * Generate a Cost entry from a CostMapItem.
 * Fixed costs: use 1st of current month as date with spreadDays=30 so they impact every day of the month.
 * Variable costs: use their persistent createdAt date with their spreadDays.
 */
function costMapItemToCost(item: CostMapItem): Cost {
  let date: string;
  let spreadDays = item.spreadDays;

  if (item.classification === 'fixed') {
    // Fixed costs recur monthly — anchor to 1st of current month, spread over 30 days
    const now = new Date();
    date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    spreadDays = 30;
  } else {
    // Variable costs: use persistent creation date
    if (item.createdAt) {
      date = getDateString(new Date(item.createdAt));
    } else {
      date = getDateString();
    }
  }

  return {
    id: `costmap-${item.id}`,
    amount: item.value,
    type: item.classification === 'fixed' ? 'business' : 'product',
    classification: item.classification,
    spreadDays,
    date,
    createdAt: item.createdAt || Date.now(),
    description: item.name,
    category: item.name,
    subcategory: undefined,
  };
}

/** Sync all costMap items into costs array — replaces costmap-generated costs */
function syncCostMapToCosts() {
  const manualCosts = state.costs.filter(c => !c.id.startsWith('costmap-'));
  const mapCosts = state.costMap
    .filter(item => item.value > 0)
    .map(costMapItemToCost);
  state = { ...state, costs: [...manualCosts, ...mapCosts] };
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
      createdAt: Date.now(),
    };
  });
  state = { ...state, costMap: items };
  syncCostMapToCosts();
  notify();
}

export function updateCostMapItem(id: string, updates: Partial<Pick<CostMapItem, 'name' | 'classification' | 'value' | 'spreadDays'>>) {
  state = {
    ...state,
    costMap: state.costMap.map(item => item.id === id ? { ...item, ...updates } : item),
  };
  syncCostMapToCosts();
  notify();
}

export function deleteCostMapItem(id: string) {
  state = { ...state, costMap: state.costMap.filter(item => item.id !== id) };
  syncCostMapToCosts();
  notify();
}

export function addCostMapItem(name: string, classification: CostClassification, value: number = 0) {
  const item: CostMapItem = {
    id: crypto.randomUUID(),
    name,
    classification,
    value,
    spreadDays: classification === 'fixed' ? 30 : 7,
    createdAt: Date.now(),
  };
  state = { ...state, costMap: [...state.costMap, item] };
  syncCostMapToCosts();
  notify();
  return item;
}

export function registerCost(
  amount: number,
  type: 'product' | 'business',
  spreadDays: number,
  description?: string,
  category?: string,
  _subcategory?: string,
  classification?: CostClassification,
) {
  const inferredClassification = classification || (type === 'business' ? 'fixed' : 'variable');
  const itemName = description?.trim() || category?.trim() || (type === 'product' ? 'Custo variável' : 'Custo fixo');
  const item = addCostMapItem(itemName, inferredClassification, amount);

  if (inferredClassification === 'variable' && spreadDays !== 7) {
    updateCostMapItem(item.id, { spreadDays });
  }

  return item;
}

/** Get the monthly equivalent of a cost map item */
export function getMonthlyEquivalent(item: CostMapItem): number {
  if (item.value <= 0) return 0;
  if (item.classification === 'fixed') return item.value;
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

// ─── Revenue Stats for AI ──────────────────────────────────────────

export function getRevenueStats() {
  const dates = getDateRange(30);
  let manualDays = 0;
  let estimatedDays = 0;
  let distributedDays = 0;
  let totalManualRevenue = 0;
  let totalEstimatedRevenue = 0;

  for (const date of dates) {
    const dayEntries = state.entries.filter(e => e.date === date);
    if (dayEntries.length === 0) continue;
    const source = getDayRevenueSource(date);
    const revenue = dayEntries.reduce((s, e) => s + e.amount, 0);
    if (source === 'manual') {
      manualDays++;
      totalManualRevenue += revenue;
    } else if (source === 'estimated') {
      estimatedDays++;
      totalEstimatedRevenue += revenue;
    } else {
      distributedDays++;
      totalManualRevenue += revenue; // distributed counts as user-provided
    }
  }

  const totalDays = manualDays + estimatedDays + distributedDays;
  return {
    manualDays,
    estimatedDays,
    distributedDays,
    totalManualRevenue,
    totalEstimatedRevenue,
    realDataPercentage: totalDays > 0 ? ((manualDays + distributedDays) / totalDays) * 100 : 0,
  };
}

// ─── Unified Transactions ──────────────────────────────────────────

/** Get all financial movements as a unified list of transactions */
export function getAllTransactions(limit?: number): Transaction[] {
  const entryTransactions: Transaction[] = state.entries.map(e => ({
    id: e.id,
    tipo: 'entrada' as TransactionType,
    valor: e.amount,
    data: e.date,
    categoria: e.category || 'Receita',
    descricao: e.description,
    createdAt: e.createdAt,
    source: e.source,
  }));

  const costTransactions: Transaction[] = state.costs.map(c => ({
    id: c.id,
    tipo: 'saida' as TransactionType,
    valor: c.amount,
    data: c.date,
    categoria: c.category || (c.type === 'product' ? 'Produto' : 'Negócio'),
    descricao: c.description,
    createdAt: c.createdAt,
    classification: c.classification,
    spreadDays: c.spreadDays,
    fromCostMap: c.id.startsWith('costmap-'),
  }));

  const all = [...entryTransactions, ...costTransactions]
    .sort((a, b) => b.createdAt - a.createdAt);

  return limit ? all.slice(0, limit) : all;
}

/** Get transactions for a specific date */
export function getTransactionsByDate(date: string): Transaction[] {
  return getAllTransactions().filter(t => t.data === date);
}

/** Get transaction totals */
export function getTransactionTotals(days: number = 30) {
  const dates = getDateRange(days);
  const transactions = getAllTransactions().filter(t => dates.includes(t.data));
  const entradas = transactions.filter(t => t.tipo === 'entrada');
  const saidas = transactions.filter(t => t.tipo === 'saida');
  const receita = entradas.reduce((s, t) => s + t.valor, 0);
  // For costs, use the impact-based calculation for accuracy
  const summary = getPeriodSummary(days);
  return {
    receita: summary.totalRevenue,
    custos: summary.totalRealCost,
    lucro: summary.profit,
    margem: summary.margin,
    totalEntradas: entradas.length,
    totalSaidas: saidas.length,
    totalMovimentacoes: transactions.length,
  };
}

// ─── Monthly Summary for Reports ───────────────────────────────────

export interface MonthlySummary {
  year: number;
  month: number;
  monthLabel: string;
  revenue: number;
  costs: number;
  profit: number;
  margin: number;
  costPercentage: number;
  avgDailyRevenue: number;
  avgDailyCost: number;
  avgDailyProfit: number;
  operatingDays: number;
  daysWithData: number;
  totalEntries: number;
  totalManualCosts: number;
  totalCostMapItems: number;
  bestDay: { date: string; profit: number } | null;
  worstDay: { date: string; profit: number } | null;
  totalFixed: number;
  totalVariable: number;
  fixedPercentage: number;
  variablePercentage: number;
  topCategories: { name: string; amount: number; percentage: number }[];
  goalMonthlyProfit: number | null;
  goalProgress: number;
  isValid: boolean;
  invalidReason?: string;
}

export function getMonthlySummary(year: number, month: number): MonthlySummary {
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const monthLabel = `${monthNames[month]} ${year}`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weekdays = state.businessProfile?.operatingWeekdays ?? [1, 2, 3, 4, 5, 6];

  // Count operating days in the month
  let operatingDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month, d);
    if (weekdays.includes(dt.getDay())) operatingDays++;
  }

  // Build all date strings for the month
  const monthDates: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    monthDates.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }

  // Use getDaySummary (same as dashboard) for EVERY day — single source of truth
  let totalRevenue = 0;
  let totalCost = 0;
  let daysWithData = 0;
  let totalEntries = 0;
  let bestDay: { date: string; profit: number } | null = null;
  let worstDay: { date: string; profit: number } | null = null;

  for (const dateStr of monthDates) {
    const daySummary = getDaySummary(dateStr);
    totalRevenue += daySummary.totalRevenue;
    totalCost += daySummary.totalRealCost;
    totalEntries += daySummary.entryCount;

    // A day "has data" if user recorded entries or manual costs on it
    const hasManualEntries = state.entries.some(e => e.date === dateStr);
    const hasManualCosts = state.costs.some(c => c.date === dateStr && !isDerivedCost(c));
    if (hasManualEntries || hasManualCosts) {
      daysWithData++;
      // Only operating days qualify for best/worst performance
      if (isOperatingDay(dateStr)) {
        const dayProfit = daySummary.totalRevenue - daySummary.totalRealCost;
        if (!bestDay || dayProfit > bestDay.profit) bestDay = { date: dateStr, profit: Math.round(dayProfit) };
        if (!worstDay || dayProfit < worstDay.profit) worstDay = { date: dateStr, profit: Math.round(dayProfit) };
      }
    }
  }

  const profit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
  const costPercentage = totalRevenue > 0 ? (totalCost / totalRevenue) * 100 : 0;
  const avgDailyRevenue = daysWithData > 0 ? totalRevenue / daysWithData : 0;
  const avgDailyCost = daysWithData > 0 ? totalCost / daysWithData : 0;
  const avgDailyProfit = avgDailyRevenue - avgDailyCost;

  // Cost breakdown — use same getCostImpactOnDate across month dates
  const fixedCosts = state.costs.filter(c => c.classification === 'fixed');
  const variableCosts = state.costs.filter(c => c.classification === 'variable');
  const totalFixed = fixedCosts.reduce((s, c) => monthDates.reduce((acc, d) => acc + getCostImpactOnDate(c, d), s), 0);
  const totalVariable = variableCosts.reduce((s, c) => monthDates.reduce((acc, d) => acc + getCostImpactOnDate(c, d), s), 0);
  const totalCostCalc = totalFixed + totalVariable || totalCost;

  // Categories
  const catMap = new Map<string, number>();
  state.costs.forEach(c => {
    const key = c.category || (c.type === 'product' ? 'Produto' : 'Negócio');
    const impact = monthDates.reduce((acc, d) => acc + getCostImpactOnDate(c, d), 0);
    if (impact > 0) catMap.set(key, (catMap.get(key) || 0) + impact);
  });
  const topCategories = Array.from(catMap.entries())
    .map(([name, amount]) => ({ name, amount: Math.round(amount), percentage: totalCostCalc > 0 ? Math.round((amount / totalCostCalc) * 100) : 0 }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Verification counts
  const totalManualCosts = state.costs.filter(c => !isDerivedCost(c) && monthDates.includes(c.date)).length;
  const totalCostMapItems = state.costMap.filter(i => i.value > 0).length;

  // Validation: min 7 days with real user data
  const isValid = daysWithData >= 7;
  const invalidReason = !isValid ? `Dados insuficientes: apenas ${daysWithData} dia(s) com movimentação registrada. Mínimo: 7 dias.` : undefined;

  // Goals
  const goalMonthlyProfit = state.goals.monthlyProfit || null;
  const goalProgress = goalMonthlyProfit ? Math.round((profit / goalMonthlyProfit) * 100) : 0;

  return {
    year, month, monthLabel,
    revenue: Math.round(totalRevenue),
    costs: Math.round(totalCost),
    profit: Math.round(profit),
    margin: Math.round(margin),
    costPercentage: Math.round(costPercentage),
    avgDailyRevenue: Math.round(avgDailyRevenue),
    avgDailyCost: Math.round(avgDailyCost),
    avgDailyProfit: Math.round(avgDailyProfit),
    operatingDays, daysWithData, totalEntries, totalManualCosts, totalCostMapItems,
    bestDay, worstDay,
    totalFixed: Math.round(totalFixed),
    totalVariable: Math.round(totalVariable),
    fixedPercentage: totalCostCalc > 0 ? Math.round((totalFixed / totalCostCalc) * 100) : 0,
    variablePercentage: totalCostCalc > 0 ? Math.round((totalVariable / totalCostCalc) * 100) : 0,
    topCategories,
    goalMonthlyProfit, goalProgress,
    isValid, invalidReason,
  };
}

export function resetAll() {
  state = { businessType: null, onboardingComplete: false, entries: [], costs: [], costMap: [], goals: { monthlyProfit: null, monthlyMargin: null }, businessProfile: defaultProfile };
  notify();
}
