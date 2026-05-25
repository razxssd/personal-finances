"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { formatEUR, formatEURCompact, formatMonthLabel } from "@/lib/format";

export type MoMPoint = { monthYear: string; delta: number };

export function MoMBar({ data }: { data: MoMPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Need at least 2 months of data
      </div>
    );
  }
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="monthYear"
            tickFormatter={formatMonthLabel}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            minTickGap={24}
          />
          <YAxis tickFormatter={formatEURCompact} tick={{ fontSize: 11, fill: "#94a3b8" }} width={50} />
          <ReferenceLine y={0} stroke="var(--border)" />
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
          <Bar dataKey="delta" radius={[6, 6, 0, 0]}>
            {data.map((d) => (
              <Cell
                key={d.monthYear}
                fill={d.delta >= 0 ? "#22c55e" : "#ef4444"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
