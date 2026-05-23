import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { SummaryCard } from "@/components/SummaryCard";
import { NetWorthChart } from "@/components/charts/NetWorthChart";
import { CashflowBars } from "@/components/charts/CashflowBars";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import {
  listInvestments,
  listLiquidity,
  listIncomes,
  listExpenses,
} from "@/lib/db/queries";
import {
  aggregateNetWorthByMonth,
  aggregateCashflowByMonth,
} from "@/lib/calc";
import { formatMonthLong } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [investments, liquidity, incomes, expenses] = await Promise.all([
    listInvestments(),
    listLiquidity(),
    listIncomes(),
    listExpenses(),
  ]);

  const [netWorth, cashflow] = await Promise.all([
    aggregateNetWorthByMonth(investments, liquidity),
    aggregateCashflowByMonth(incomes, expenses, { excludeInvestmentsFromExpenses: true }),
  ]);

  const latest = netWorth[netWorth.length - 1];
  const previous = netWorth[netWorth.length - 2];
  const totalNetWorth = latest?.total ?? 0;
  const deltaPct =
    previous && previous.total > 0
      ? (latest.total - previous.total) / previous.total
      : undefined;

  const latestCashflow = cashflow[cashflow.length - 1];

  return (
    <AppShell
      title="Finanze"
      action={
        <UserButton
          appearance={{ elements: { avatarBox: "size-8" } }}
        />
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-3">
          <SummaryCard
            label={
              latest
                ? `Patrimonio · ${formatMonthLong(latest.monthYear)}`
                : "Patrimonio"
            }
            value={totalNetWorth}
            delta={deltaPct}
            helpText={previous ? "vs mese precedente" : undefined}
          />
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard label="Investimenti" value={latest?.investments ?? 0} />
            <SummaryCard label="Liquidità" value={latest?.liquidity ?? 0} />
          </div>
          {latestCashflow ? (
            <div className="grid grid-cols-2 gap-3">
              <SummaryCard
                label={`Entrate · ${formatMonthLong(latestCashflow.monthYear)}`}
                value={latestCashflow.income}
              />
              <SummaryCard
                label={`Uscite · ${formatMonthLong(latestCashflow.monthYear)}`}
                value={latestCashflow.expense}
              />
            </div>
          ) : null}
        </div>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">Andamento</CardTitle>
            <Link
              href="/patrimonio"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 text-xs h-7")}
            >
              Dettagli <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <NetWorthChart data={netWorth} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">Cashflow recente</CardTitle>
            <Link
              href="/cashflow"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 text-xs h-7")}
            >
              Dettagli <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <CashflowBars data={cashflow.slice(-6)} />
          </CardContent>
        </Card>

        {netWorth.length === 0 && incomes.length === 0 && expenses.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-4 text-sm text-muted-foreground text-center space-y-2">
              <p>
                Non hai ancora dati. Importa il tuo storico dal Notion o aggiungi
                manualmente i primi snapshot.
              </p>
              <Link
                href="/import"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Vai a Import
              </Link>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
