"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { colorForTag } from "@/lib/tags";
import { formatEUR, formatMonthLabel, formatDateIT } from "@/lib/format";

type Entry = {
  id: string;
  primary: string; // monthYear or date
  primaryKind: "month" | "date";
  amount: string;
  currency: string;
  tag: string;
  note?: string | null;
  source?: string | null;
};

export function EntryList({
  entries,
  onDelete,
  empty,
}: {
  entries: Entry[];
  onDelete: (id: string) => Promise<void>;
  empty?: string;
}) {
  const [pending, startTransition] = useTransition();

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        {empty ?? "Nessuna voce ancora."}
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {entries.map((e) => (
        <li key={e.id}>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{ backgroundColor: `${colorForTag(e.tag)}1f`, color: colorForTag(e.tag) }}
                    >
                      {e.tag}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {e.primaryKind === "month"
                        ? formatMonthLabel(e.primary)
                        : formatDateIT(e.primary)}
                    </span>
                  </div>
                  {e.source ? (
                    <p className="mt-1 text-sm font-medium truncate">{e.source}</p>
                  ) : null}
                  {e.note ? (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{e.note}</p>
                  ) : null}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold tabular-nums">
                    {e.currency === "EUR" ? formatEUR(e.amount) : `${e.amount} ${e.currency}`}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-muted-foreground hover:text-destructive"
                    disabled={pending}
                    onClick={() => {
                      if (!confirm("Eliminare questa voce?")) return;
                      startTransition(async () => {
                        try {
                          await onDelete(e.id);
                          toast.success("Eliminato");
                        } catch (err) {
                          toast.error((err as Error).message);
                        }
                      });
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
