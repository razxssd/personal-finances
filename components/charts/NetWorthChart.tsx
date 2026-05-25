"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
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
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gInv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gLiq" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="monthYear"
            tickFormatter={(l) => formatMonthLabel(String(l))}
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tickFormatter={(v) => formatEURCompact(Number(v))}
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
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
            iconType="circle"
            iconSize={8}
          />
          <Area
            type="monotone"
            dataKey="investments"
            name="Investimenti"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#gInv)"
          />
          <Area
            type="monotone"
            dataKey="liquidity"
            name="Liquidità"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#gLiq)"
          />
          <Line
            type="monotone"
            dataKey="total"
            name="Totale"
            stroke="#64748b"
            strokeWidth={2}
            strokeDasharray="4 3"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
