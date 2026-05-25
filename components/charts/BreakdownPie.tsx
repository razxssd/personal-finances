"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { colorForTag } from "@/lib/tags";
import { formatEUR } from "@/lib/format";

export type BreakdownEntry = { tag: string; value: number };

export function BreakdownPie({ data }: { data: BreakdownEntry[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Nessun dato per il breakdown
      </div>
    );
  }
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="tag"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              stroke="var(--background)"
              strokeWidth={2}
            >
              {data.map((d) => (
                <Cell key={d.tag} fill={colorForTag(d.tag)} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => formatEUR(Number(v))}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-1.5 text-sm self-center">
        {[...data]
          .sort((a, b) => b.value - a.value)
          .map((d) => (
            <li key={d.tag} className="flex items-center gap-2">
              <span
                className="size-3 rounded-full shrink-0"
                style={{ background: colorForTag(d.tag) }}
              />
              <span className="flex-1 truncate">{d.tag}</span>
              <span className="tabular-nums text-muted-foreground">
                {total > 0 ? Math.round((d.value / total) * 100) : 0}%
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}
