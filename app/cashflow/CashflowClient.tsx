"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { CashflowDrawer } from "@/components/forms/CashflowDrawer";
import { EntryList } from "@/components/EntryList";
import { CashflowBars, type CashflowPoint } from "@/components/charts/CashflowBars";
import { BreakdownPie, type BreakdownEntry } from "@/components/charts/BreakdownPie";
import { deleteIncome, deleteExpense } from "@/lib/actions";

type IRow = {
  id: string;
  date: string;
  amount: string;
  amountEUR: number;
  currency: string;
  tag: string;
  source: string | null;
  note: string | null;
};

function buildBreakdown(rows: IRow[], opts?: { excludeInvestments?: boolean }): BreakdownEntry[] {
  const byTag = new Map<string, number>();
  for (const r of rows) {
    if (opts?.excludeInvestments && r.tag === "Investments") continue;
    byTag.set(r.tag, (byTag.get(r.tag) ?? 0) + r.amountEUR);
  }
  return [...byTag.entries()]
    .map(([tag, value]) => ({ tag, value }))
    .sort((a, b) => b.value - a.value);
}

export function CashflowClient({
  incomes,
  expenses,
  monthly,
  monthlyNoInvestments,
  customIncomeTags,
  customExpenseTags,
}: {
  incomes: IRow[];
  expenses: IRow[];
  monthly: CashflowPoint[];
  monthlyNoInvestments: CashflowPoint[];
  customIncomeTags: string[];
  customExpenseTags: string[];
}) {
  const [excludeInvestments, setExcludeInvestments] = useState(false);
  const [tab, setTab] = useState<"expense" | "income">("expense");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const months = useMemo(() => {
    const set = new Set<string>();
    incomes.forEach((i) => set.add(i.date.slice(0, 7)));
    expenses.forEach((e) => set.add(e.date.slice(0, 7)));
    return [...set].sort().reverse();
  }, [incomes, expenses]);

  const filteredIncomes = useMemo(
    () =>
      selectedMonth === "all"
        ? incomes
        : incomes.filter((i) => i.date.slice(0, 7) === selectedMonth),
    [incomes, selectedMonth]
  );
  const filteredExpenses = useMemo(
    () =>
      selectedMonth === "all"
        ? expenses
        : expenses.filter((e) => e.date.slice(0, 7) === selectedMonth),
    [expenses, selectedMonth]
  );

  const chartData = excludeInvestments ? monthlyNoInvestments : monthly;
  const expenseBreakdown = useMemo(
    () => buildBreakdown(filteredExpenses, { excludeInvestments }),
    [filteredExpenses, excludeInvestments]
  );
  const incomeBreakdown = useMemo(
    () => buildBreakdown(filteredIncomes),
    [filteredIncomes]
  );

  const breakdownLabel =
    selectedMonth === "all" ? "tutti i mesi" : selectedMonth;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm">Entrate vs Uscite</CardTitle>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              className="size-3.5 accent-foreground"
              checked={excludeInvestments}
              onChange={(e) => setExcludeInvestments(e.target.checked)}
            />
            Escludi “Investments”
          </label>
        </CardHeader>
        <CardContent>
          <CashflowBars data={chartData} />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-2">
        <div className="space-y-1">
          <Label htmlFor="month-filter" className="text-xs">
            Filtra per mese
          </Label>
          <select
            id="month-filter"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            style={{ fontSize: "16px" }}
          >
            <option value="all">Tutti i mesi</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <CashflowDrawer kind="income" customTags={customIncomeTags} />
          <CashflowDrawer kind="expense" customTags={customExpenseTags} />
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="w-full">
          <TabsTrigger value="expense" className="flex-1">
            Uscite ({filteredExpenses.length})
          </TabsTrigger>
          <TabsTrigger value="income" className="flex-1">
            Entrate ({filteredIncomes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expense" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                Breakdown uscite · {breakdownLabel}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BreakdownPie data={expenseBreakdown} />
            </CardContent>
          </Card>
          <EntryList
            entries={filteredExpenses.map((e) => ({
              id: e.id,
              primary: e.date,
              primaryKind: "date" as const,
              amount: e.amount,
              currency: e.currency,
              tag: e.tag,
              source: e.source,
              note: e.note,
            }))}
            onDelete={deleteExpense}
            empty="Nessuna uscita nel periodo"
          />
        </TabsContent>

        <TabsContent value="income" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                Breakdown entrate · {breakdownLabel}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BreakdownPie data={incomeBreakdown} />
            </CardContent>
          </Card>
          <EntryList
            entries={filteredIncomes.map((i) => ({
              id: i.id,
              primary: i.date,
              primaryKind: "date" as const,
              amount: i.amount,
              currency: i.currency,
              tag: i.tag,
              source: i.source,
              note: i.note,
            }))}
            onDelete={deleteIncome}
            empty="Nessuna entrata nel periodo"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
