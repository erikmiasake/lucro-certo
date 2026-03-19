import { BusinessType } from './business-config';

export interface Entry {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export interface Cost {
  id: string;
  amount: number;
  type: 'product' | 'business';
  spreadDays: number; // 1 for business, 3-7 for product
  date: string; // YYYY-MM-DD (date it was registered)
  createdAt: number;
}

export interface AppState {
  businessType: BusinessType | null;
  entries: Entry[];
  costs: Cost[];
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

export function addEntry(amount: number) {
  const today = new Date().toISOString().split('T')[0];
  const entry: Entry = {
    id: crypto.randomUUID(),
    amount,
    date: today,
    createdAt: Date.now(),
  };
  state = { ...state, entries: [...state.entries, entry] };
  notify();
}

export function addCost(amount: number, type: 'product' | 'business', spreadDays: number = 1) {
  const today = new Date().toISOString().split('T')[0];
  const cost: Cost = {
    id: crypto.randomUUID(),
    amount,
    type,
    spreadDays: type === 'business' ? 1 : spreadDays,
    date: today,
    createdAt: Date.now(),
  };
  state = { ...state, costs: [...state.costs, cost] };
  notify();
}

export function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

/** Calculate the real cost impact of a cost entry on a specific date */
function getCostImpactOnDate(cost: Cost, targetDate: string): number {
  const costDate = new Date(cost.date + 'T00:00:00');
  const target = new Date(targetDate + 'T00:00:00');
  const diffDays = Math.floor((target.getTime() - costDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0 || diffDays >= cost.spreadDays) return 0;
  return cost.amount / cost.spreadDays;
}

export function getDaySummary(date: string = getDateString()) {
  const totalRevenue = state.entries
    .filter((e) => e.date === date)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalRealCost = state.costs.reduce(
    (sum, c) => sum + getCostImpactOnDate(c, date),
    0
  );

  const profit = totalRevenue - totalRealCost;

  return { totalRevenue, totalRealCost, profit };
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

export function resetAll() {
  state = { businessType: null, entries: [], costs: [] };
  notify();
}
