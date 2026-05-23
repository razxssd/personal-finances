"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatEUR, formatEURCompact, formatMonthLabel } from "@/lib/format";

export type NetWorthPoint = {
  monthYear: string;
  investments: number;
  liquidity: number;
  total: number;
};

export function NetWorthChart({ data }: { data: NetWorthPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Nessun dato — aggiungi il primo snapshot
      </div>
    );
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gInv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gLiq" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="monthYear"
            tickFormatter={formatMonthLabel}
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tickFormatter={formatEURCompact}
            tick={{ fontSize: 11 }}
            width={50}
          />
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
          <Area
            type="monotone"
            dataKey="investments"
            stackId="1"
            stroke="#6366f1"
            fill="url(#gInv)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="liquidity"
            stackId="1"
            stroke="#22c55e"
            fill="url(#gLiq)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
