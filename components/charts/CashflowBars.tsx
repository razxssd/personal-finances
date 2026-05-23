"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatEUR, formatEURCompact, formatMonthLabel } from "@/lib/format";

export type CashflowPoint = {
  monthYear: string;
  income: number;
  expense: number;
  net: number;
};

export function CashflowBars({ data }: { data: CashflowPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Nessun dato — aggiungi entrate o uscite
      </div>
    );
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="monthYear"
            tickFormatter={formatMonthLabel}
            tick={{ fontSize: 11 }}
            minTickGap={24}
          />
          <YAxis tickFormatter={formatEURCompact} tick={{ fontSize: 11 }} width={50} />
          <Tooltip
            formatter={(v) => formatEUR(Number(v))}
            labelFormatter={(l) => formatMonthLabel(String(l))}
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="income" name="Entrate" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Uscite" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
