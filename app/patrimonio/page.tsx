import { AppShell } from "@/components/layout/AppShell";
import { PatrimonioClient } from "./PatrimonioClient";
import {
  listInvestments,
  listLiquidity,
  listTags,
} from "@/lib/db/queries";
import {
  aggregateNetWorthByMonth,
  aggregateBreakdown,
} from "@/lib/calc";

export const dynamic = "force-dynamic";

export default async function PatrimonioPage() {
  const [investments, liquidity, invTags, liqTags] = await Promise.all([
    listInvestments(),
    listLiquidity(),
    listTags("investment"),
    listTags("liquidity"),
  ]);

  const [netWorth, invBreakdown, liqBreakdown] = await Promise.all([
    aggregateNetWorthByMonth(investments, liquidity),
    aggregateBreakdown(investments),
    aggregateBreakdown(liquidity),
  ]);

  return (
    <AppShell title="Patrimonio">
      <PatrimonioClient
        investments={investments.map((i) => ({
          id: i.id,
          monthYear: i.monthYear,
          value: i.value,
          currency: i.currency,
          tag: i.tag,
          note: i.note,
        }))}
        liquidity={liquidity.map((l) => ({
          id: l.id,
          monthYear: l.monthYear,
          value: l.value,
          currency: l.currency,
          tag: l.tag,
          note: l.note,
        }))}
        netWorth={netWorth}
        invBreakdown={invBreakdown}
        liqBreakdown={liqBreakdown}
        customInvTags={invTags.map((t) => t.name)}
        customLiqTags={liqTags.map((t) => t.name)}
      />
    </AppShell>
  );
}
