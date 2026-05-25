import { AppShell } from "@/components/layout/AppShell";
import { CashflowClient } from "./CashflowClient";
import { listIncomes, listExpenses, listTags } from "@/lib/db/queries";
import { aggregateCashflowByMonth } from "@/lib/calc";
import { convertToEUR } from "@/lib/fx";

export const dynamic = "force-dynamic";

async function withEUR<T extends { amount: string; currency: string }>(rows: T[]) {
  return Promise.all(
    rows.map(async (r) => ({
      ...r,
      amountEUR: await convertToEUR(parseFloat(r.amount) || 0, r.currency),
    }))
  );
}

export default async function CashflowPage() {
  const [incomes, expenses, incTags, expTags] = await Promise.all([
    listIncomes(),
    listExpenses(),
    listTags("income"),
    listTags("expense"),
  ]);

  const [monthly, monthlyNoInv, incomesEUR, expensesEUR] = await Promise.all([
    aggregateCashflowByMonth(incomes, expenses),
    aggregateCashflowByMonth(incomes, expenses, { excludeInvestmentsFromExpenses: true }),
    withEUR(incomes),
    withEUR(expenses),
  ]);

  return (
    <AppShell title="Cashflow">
      <CashflowClient
        incomes={incomesEUR.map((i) => ({
          id: i.id,
          date: i.date,
          amount: i.amount,
          amountEUR: i.amountEUR,
          currency: i.currency,
          tag: i.tag,
          source: i.source,
          note: i.note,
        }))}
        expenses={expensesEUR.map((e) => ({
          id: e.id,
          date: e.date,
          amount: e.amount,
          amountEUR: e.amountEUR,
          currency: e.currency,
          tag: e.tag,
          source: e.source,
          note: e.note,
        }))}
        monthly={monthly}
        monthlyNoInvestments={monthlyNoInv}
        customIncomeTags={incTags.map((t) => t.name)}
        customExpenseTags={expTags.map((t) => t.name)}
      />
    </AppShell>
  );
}
