import Link from "next/link";
import { cookies } from "next/headers";
import { AppShell } from "@/components/layout/AppShell";
import { HomeClient } from "./HomeClient";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
import {
  EXCLUDE_INVESTMENTS_COOKIE,
  parseExcludeInvestments,
} from "@/lib/prefs";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cookieStore = await cookies();
  const excludeInvestments = parseExcludeInvestments(
    cookieStore.get(EXCLUDE_INVESTMENTS_COOKIE)?.value
  );

  const [investments, liquidity, incomes, expenses] = await Promise.all([
    listInvestments(),
    listLiquidity(),
    listIncomes(),
    listExpenses(),
  ]);

  const [netWorth, cashflow, cashflowNoInvestments] = await Promise.all([
    aggregateNetWorthByMonth(investments, liquidity),
    aggregateCashflowByMonth(incomes, expenses),
    aggregateCashflowByMonth(incomes, expenses, { excludeInvestmentsFromExpenses: true }),
  ]);

  return (
    <AppShell title="Finances">
      <div className="space-y-6">
        <HomeClient
          netWorth={netWorth}
          cashflow={cashflow}
          cashflowNoInvestments={cashflowNoInvestments}
          initialExcludeInvestments={excludeInvestments}
        />

        {netWorth.length === 0 && incomes.length === 0 && expenses.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-4 text-sm text-muted-foreground text-center space-y-2">
              <p>
                No data yet. Import your history from Notion or add your first
                snapshots manually.
              </p>
              <Link
                href="/import"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Go to Import
              </Link>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
