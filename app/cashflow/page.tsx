import { AppShell } from "@/components/layout/AppShell";
import { CashflowClient } from "./CashflowClient";
import { listIncomes, listExpenses, listTags } from "@/lib/db/queries";
import {
  aggregateCashflowByMonth,
  aggregateExpenseBreakdown,
  aggregateIncomeBreakdown,
} from "@/lib/calc";

export const dynamic = "force-dynamic";

export default async function CashflowPage() {
  const [incomes, expenses, incTags, expTags] = await Promise.all([
    listIncomes(),
    listExpenses(),
    listTags("income"),
    listTags("expense"),
  ]);

  const [monthly, monthlyNoInv, expBreakdown, expBreakdownNoInv, incBreakdown] =
    await Promise.all([
      aggregateCashflowByMonth(incomes, expenses),
      aggregateCashflowByMonth(incomes, expenses, { excludeInvestmentsFromExpenses: true }),
      aggregateExpenseBreakdown(expenses),
      aggregateExpenseBreakdown(expenses, { excludeInvestments: true }),
      aggregateIncomeBreakdown(incomes),
    ]);

  return (
    <AppShell title="Cashflow">
      <CashflowClient
        incomes={incomes.map((i) => ({
          id: i.id,
          date: i.date,
          amount: i.amount,
          currency: i.currency,
          tag: i.tag,
          source: i.source,
          note: i.note,
        }))}
        expenses={expenses.map((e) => ({
          id: e.id,
          date: e.date,
          amount: e.amount,
          currency: e.currency,
          tag: e.tag,
          source: e.source,
          note: e.note,
        }))}
        monthly={monthly}
        monthlyNoInvestments={monthlyNoInv}
        expenseBreakdown={expBreakdown}
        expenseBreakdownNoInvestments={expBreakdownNoInv}
        incomeBreakdown={incBreakdown}
        customIncomeTags={incTags.map((t) => t.name)}
        customExpenseTags={expTags.map((t) => t.name)}
      />
    </AppShell>
  );
}
