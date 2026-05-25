"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WealthDrawer } from "@/components/forms/InvestmentDrawer";
import { EntryList } from "@/components/EntryList";
import { NetWorthChart, type NetWorthPoint } from "@/components/charts/NetWorthChart";
import { BreakdownPie, type BreakdownEntry } from "@/components/charts/BreakdownPie";
import { MoMBar } from "@/components/charts/MoMBar";
import { deleteInvestment, deleteLiquidity } from "@/lib/actions";
import { momDelta } from "@/lib/momDelta";
import {
  EditInvestmentDrawer,
  EditLiquidityDrawer,
} from "@/components/forms/EditDrawers";

type Row = {
  id: string;
  monthYear: string;
  value: string;
  currency: string;
  tag: string;
  note: string | null;
};

export function WealthClient({
  investments,
  liquidity,
  netWorth,
  invBreakdown,
  liqBreakdown,
  customInvTags,
  customLiqTags,
}: {
  investments: Row[];
  liquidity: Row[];
  netWorth: NetWorthPoint[];
  invBreakdown: BreakdownEntry[];
  liqBreakdown: BreakdownEntry[];
  customInvTags: string[];
  customLiqTags: string[];
}) {
  const [tab, setTab] = useState<"investment" | "liquidity">("investment");
  const [editingInvestmentId, setEditingInvestmentId] = useState<string | null>(null);
  const [editingLiquidityId, setEditingLiquidityId] = useState<string | null>(null);
  const mom = momDelta(netWorth.map((n) => ({ monthYear: n.monthYear, total: n.total })));

  const editingInvestment = investments.find((i) => i.id === editingInvestmentId) ?? null;
  const editingLiquidity = liquidity.find((l) => l.id === editingLiquidityId) ?? null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Net worth trend</CardTitle>
          </CardHeader>
          <CardContent>
            <NetWorthChart data={netWorth} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Month over month</CardTitle>
          </CardHeader>
          <CardContent>
            <MoMBar data={mom} />
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <div className="flex items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="investment">Investments</TabsTrigger>
            <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
          </TabsList>
          <WealthDrawer
            kind={tab}
            customTags={tab === "investment" ? customInvTags : customLiqTags}
          />
        </div>

        <TabsContent value="investment" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Investments breakdown (latest snapshot per tag)</CardTitle>
              </CardHeader>
              <CardContent>
                <BreakdownPie data={invBreakdown} />
              </CardContent>
            </Card>
            <EntryList
              entries={investments.map((i) => ({
                id: i.id,
                primary: i.monthYear,
                primaryKind: "month" as const,
                amount: i.value,
                currency: i.currency,
                tag: i.tag,
                note: i.note,
              }))}
              onDelete={deleteInvestment}
              onEdit={setEditingInvestmentId}
              empty="No investments yet — add your first snapshot"
            />
          </div>
        </TabsContent>

        <TabsContent value="liquidity" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Liquidity breakdown (latest snapshot per tag)</CardTitle>
              </CardHeader>
              <CardContent>
                <BreakdownPie data={liqBreakdown} />
              </CardContent>
            </Card>
            <EntryList
              entries={liquidity.map((l) => ({
                id: l.id,
                primary: l.monthYear,
                primaryKind: "month" as const,
                amount: l.value,
                currency: l.currency,
                tag: l.tag,
                note: l.note,
              }))}
              onDelete={deleteLiquidity}
              onEdit={setEditingLiquidityId}
              empty="No liquidity records yet"
            />
          </div>
        </TabsContent>
      </Tabs>

      {editingInvestment ? (
        <EditInvestmentDrawer
          row={editingInvestment}
          customTags={customInvTags}
          onClose={() => setEditingInvestmentId(null)}
        />
      ) : null}
      {editingLiquidity ? (
        <EditLiquidityDrawer
          row={editingLiquidity}
          customTags={customLiqTags}
          onClose={() => setEditingLiquidityId(null)}
        />
      ) : null}
    </div>
  );
}
