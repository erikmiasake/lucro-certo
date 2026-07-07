import { describe, it, expect, beforeEach } from 'vitest';
import {
  addCostMapItem,
  updateCostMapItem,
  clearLocalState,
  getDaySummary,
  getMonthlyEquivalent,
  getState,
} from '@/lib/store';

/**
 * Sum getDaySummary(date).totalRealCost for every day of the given month.
 * This exercises the same code path (getCostImpactOnDate) used by the app,
 * without importing the private helper.
 */
function sumDailyCostsForMonth(year: number, monthIdx0: number): number {
  const daysInMonth = new Date(year, monthIdx0 + 1, 0).getDate();
  let total = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(monthIdx0 + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    total += getDaySummary(dateStr).totalRealCost;
  }
  return total;
}

/**
 * Months chosen to cover every possible length in the Gregorian calendar:
 *  - Feb 2025 → 28 days
 *  - Feb 2024 → 29 days (leap year)
 *  - Apr 2025 → 30 days
 *  - Jan 2025 → 31 days
 */
const MONTH_CASES: Array<{ label: string; year: number; monthIdx0: number; days: number }> = [
  { label: 'Feb 2025 (28d)', year: 2025, monthIdx0: 1, days: 28 },
  { label: 'Feb 2024 (29d)', year: 2024, monthIdx0: 1, days: 29 },
  { label: 'Apr 2025 (30d)', year: 2025, monthIdx0: 3, days: 30 },
  { label: 'Jan 2025 (31d)', year: 2025, monthIdx0: 0, days: 31 },
];

describe('Derived cost consistency: daily impact sum === cost-map monthly equivalent', () => {
  beforeEach(() => {
    clearLocalState();
  });

  describe('Variable derived cost', () => {
    // Reproduces the reported bug: R$ 700 with 30-day spread must sum to
    // R$ 700 in every calendar month (not R$ 723 in 31-day months).
    const VARIABLE_CASES = [
      { value: 700, spreadDays: 30 },
      { value: 700, spreadDays: 7 },
      { value: 1000, spreadDays: 15 },
      { value: 250, spreadDays: 5 },
      { value: 90, spreadDays: 3 },
    ];

    for (const { value, spreadDays } of VARIABLE_CASES) {
      for (const { label, year, monthIdx0 } of MONTH_CASES) {
        it(`R$ ${value} / ${spreadDays}d → monthly equivalent matches in ${label}`, () => {
          const item = addCostMapItem('Test variable', 'variable', value);
          updateCostMapItem(item.id, { spreadDays });

          const monthlyEquivalent = getMonthlyEquivalent(
            getState().costMap.find((i) => i.id === item.id)!,
          );
          const dailySum = sumDailyCostsForMonth(year, monthIdx0);

          // Allow tiny floating-point noise from per-day division.
          expect(dailySum).toBeCloseTo(monthlyEquivalent, 6);
          expect(monthlyEquivalent).toBeCloseTo((value / spreadDays) * 30, 6);
        });
      }
    }
  });

  describe('Fixed derived cost', () => {
    for (const { label, year, monthIdx0 } of MONTH_CASES) {
      it(`fixed R$ 6000/mês → daily sum equals monthly value in ${label}`, () => {
        const item = addCostMapItem('Aluguel', 'fixed', 6000);

        // Fixed costs anchor to the 1st of the CURRENT month in the store.
        // For arbitrary months, we still expect the per-day formula
        // (amount / daysInMonth) to sum back to the full amount.
        const daysInMonth = new Date(year, monthIdx0 + 1, 0).getDate();
        let manualSum = 0;
        for (let d = 1; d <= daysInMonth; d++) {
          const dateStr = `${year}-${String(monthIdx0 + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          manualSum += getDaySummary(dateStr).totalRealCost;
        }

        const monthlyEquivalent = getMonthlyEquivalent(
          getState().costMap.find((i) => i.id === item.id)!,
        );

        expect(monthlyEquivalent).toBe(6000);
        expect(manualSum).toBeCloseTo(6000, 6);
      });
    }
  });

  describe('"Sem prazo" (spreadDays = 0)', () => {
    it('registers only on creation date and equals the full amount', () => {
      const item = addCostMapItem('Relógio', 'variable', 1200);
      updateCostMapItem(item.id, { spreadDays: 0 });

      const monthlyEquivalent = getMonthlyEquivalent(
        getState().costMap.find((i) => i.id === item.id)!,
      );
      expect(monthlyEquivalent).toBe(1200);

      // Sum across the current month must equal 1200 (single-day hit).
      const now = new Date();
      const dailySum = sumDailyCostsForMonth(now.getFullYear(), now.getMonth());
      expect(dailySum).toBeCloseTo(1200, 6);
    });
  });

  describe('Multiple derived costs stacked', () => {
    it('total daily sum equals sum of monthly equivalents across 28/30/31-day months', () => {
      const a = addCostMapItem('Chocolate', 'variable', 700);
      updateCostMapItem(a.id, { spreadDays: 30 });

      const b = addCostMapItem('Ingredientes', 'variable', 350);
      updateCostMapItem(b.id, { spreadDays: 7 });

      addCostMapItem('Aluguel', 'fixed', 3000);

      const cases = MONTH_CASES.filter((c) => [28, 30, 31].includes(c.days));
      for (const { year, monthIdx0 } of cases) {
        const dailySum = sumDailyCostsForMonth(year, monthIdx0);
        const expected = getState().costMap.reduce(
          (s, item) => s + getMonthlyEquivalent(item),
          0,
        );
        expect(dailySum).toBeCloseTo(expected, 6);
      }
    });
  });
});
