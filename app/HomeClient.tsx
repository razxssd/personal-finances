"use client";

import Link from "next/link";
import { SummaryCard } from "@/components/SummaryCard";
import { ExcludeInvestmentsToggle } from "@/components/ExcludeInvestmentsToggle";
import { NetWorthChart, type NetWorthPoint } from "@/components/charts/NetWorthChart";
import { CashflowBars, type CashflowPoint } from "@/components/charts/CashflowBars";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMonthLong } from "@/lib/format";
import { useExcludeInvestments } from "@/lib/hooks/useExcludeInvestments";

export function HomeClient({
  netWorth,
  cashflow,
  cashflowNoInvestments,
  initialExcludeInvestments,
}: {
  netWorth: NetWorthPoint[];
  cashflow: CashflowPoint[];
  cashflowNoInvestments: CashflowPoint[];
  initialExcludeInvestments: boolean;
}) {
  const [excludeInvestments, setExcludeInvestments] = useExcludeInvestments(
    initialExcludeInvestments
  );

  const series = excludeInvestments ? cashflowNoInvestments : cashflow;

  const latest = netWorth[netWorth.length - 1];
  const previous = netWorth[netWorth.length - 2];
  const totalNetWorth = latest?.total ?? 0;
  const deltaPct =
    previous && previous.total > 0
      ? (latest.total - previous.total) / previous.total
      : undefined;

  const latestCashflow = series[series.length - 1];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <div className="col-span-2 lg:col-span-4">
          <SummaryCard
            label={
              latest
                ? `Net worth · ${formatMonthLong(latest.monthYear)}`
                : "Net worth"
            }
            value={totalNetWorth}
            delta={deltaPct}
            helpText={previous ? "vs previous month" : undefined}
          />
        </div>
        <SummaryCard label="Investments" value={latest?.investments ?? 0} />
        <SummaryCard label="Liquidity" value={latest?.liquidity ?? 0} />
        {latestCashflow ? (
          <>
            <SummaryCard
              label={`Income · ${formatMonthLong(latestCashflow.monthYear)}`}
              value={latestCashflow.income}
            />
            <SummaryCard
              label={`Expenses · ${formatMonthLong(latestCashflow.monthYear)}`}
              value={latestCashflow.expense}
              note={excludeInvestments ? "excluding “Investments”" : undefined}
            />
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">Trend</CardTitle>
            <Link
              href="/wealth"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 text-xs h-7")}
            >
              Details <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <NetWorthChart data={netWorth} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 space-y-0">
            <div className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Recent cashflow</CardTitle>
              <Link
                href="/cashflow"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 text-xs h-7")}
              >
                Details <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <ExcludeInvestmentsToggle
              checked={excludeInvestments}
              onChange={setExcludeInvestments}
            />
          </CardHeader>
          <CardContent>
            <CashflowBars data={series.slice(-6)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
