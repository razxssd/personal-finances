import "server-only";
import { convertToEUR } from "@/lib/fx";
import type { Investment, Liquidity, Income, Expense } from "@/lib/db/schema";

type Row = { monthYear?: string; date?: string; value?: string; amount?: string; currency: string; tag: string };

async function rowToEUR(value: string, currency: string): Promise<number> {
  const n = parseFloat(value);
  if (!Number.isFinite(n)) return 0;
  return convertToEUR(n, currency);
}

export async function aggregateNetWorthByMonth(
  investments: Investment[],
  liquidity: Liquidity[]
) {
  const months = new Set<string>();
  investments.forEach((i) => months.add(i.monthYear));
  liquidity.forEach((l) => months.add(l.monthYear));

  const result: { monthYear: string; investments: number; liquidity: number; total: number }[] = [];
  for (const my of [...months].sort()) {
    let inv = 0;
    let liq = 0;
    for (const i of investments.filter((x) => x.monthYear === my)) {
      inv += await rowToEUR(i.value, i.currency);
    }
    for (const l of liquidity.filter((x) => x.monthYear === my)) {
      liq += await rowToEUR(l.value, l.currency);
    }
    result.push({ monthYear: my, investments: inv, liquidity: liq, total: inv + liq });
  }
  return result;
}

export async function aggregateBreakdown(rows: (Investment | Liquidity)[]) {
  if (rows.length === 0) return [] as { tag: string; value: number }[];

  // Use latest month's snapshot per tag
  const latestByTag = new Map<string, { monthYear: string; value: string; currency: string }>();
  for (const r of rows) {
    const prev = latestByTag.get(r.tag);
    if (!prev || r.monthYear > prev.monthYear) {
      latestByTag.set(r.tag, { monthYear: r.monthYear, value: r.value, currency: r.currency });
    }
  }
  const result: { tag: string; value: number }[] = [];
  for (const [tag, r] of latestByTag) {
    result.push({ tag, value: await rowToEUR(r.value, r.currency) });
  }
  return result.sort((a, b) => b.value - a.value);
}

export { momDelta } from "./momDelta";

function monthOf(iso: string) {
  return iso.slice(0, 7);
}

export async function aggregateCashflowByMonth(incomes: Income[], expenses: Expense[], opts?: { excludeInvestmentsFromExpenses?: boolean }) {
  const months = new Set<string>();
  incomes.forEach((i) => months.add(monthOf(i.date)));
  expenses.forEach((e) => months.add(monthOf(e.date)));

  const result: { monthYear: string; income: number; expense: number; net: number }[] = [];
  for (const my of [...months].sort()) {
    let inc = 0;
    let exp = 0;
    for (const i of incomes.filter((x) => monthOf(x.date) === my)) {
      inc += await rowToEUR(i.amount, i.currency);
    }
    for (const e of expenses.filter((x) => monthOf(x.date) === my)) {
      if (opts?.excludeInvestmentsFromExpenses && e.tag === "Investments") continue;
      exp += await rowToEUR(e.amount, e.currency);
    }
    result.push({ monthYear: my, income: inc, expense: exp, net: inc - exp });
  }
  return result;
}

export async function aggregateExpenseBreakdown(expenses: Expense[], opts?: { excludeInvestments?: boolean }) {
  const byTag = new Map<string, number>();
  for (const e of expenses) {
    if (opts?.excludeInvestments && e.tag === "Investments") continue;
    const v = await rowToEUR(e.amount, e.currency);
    byTag.set(e.tag, (byTag.get(e.tag) ?? 0) + v);
  }
  return [...byTag.entries()]
    .map(([tag, value]) => ({ tag, value }))
    .sort((a, b) => b.value - a.value);
}

export async function aggregateIncomeBreakdown(incomes: Income[]) {
  const byTag = new Map<string, number>();
  for (const i of incomes) {
    const v = await rowToEUR(i.amount, i.currency);
    byTag.set(i.tag, (byTag.get(i.tag) ?? 0) + v);
  }
  return [...byTag.entries()]
    .map(([tag, value]) => ({ tag, value }))
    .sort((a, b) => b.value - a.value);
}

void undefined as unknown as Row;
