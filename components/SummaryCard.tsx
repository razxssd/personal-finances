import { Card, CardContent } from "@/components/ui/card";
import { formatEUR, formatPercent } from "@/lib/format";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function SummaryCard({
  label,
  value,
  delta,
  helpText,
}: {
  label: string;
  value: number;
  delta?: number;
  helpText?: string;
}) {
  const Icon = delta === undefined || delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  const tone =
    delta === undefined || delta === 0
      ? "text-muted-foreground"
      : delta > 0
      ? "text-emerald-600 dark:text-emerald-500"
      : "text-red-600 dark:text-red-500";

  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{formatEUR(value)}</p>
        {delta !== undefined ? (
          <p className={cn("mt-1 flex items-center gap-1 text-xs font-medium", tone)}>
            <Icon className="size-3.5" />
            {formatPercent(delta)}
            {helpText ? <span className="text-muted-foreground ml-1">{helpText}</span> : null}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
