"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "./BottomSheet";
import { SnapshotForm } from "./SnapshotForm";
import { createInvestment, createLiquidity } from "@/lib/actions";

type Kind = "investment" | "liquidity";

export function PatrimonioDrawer({
  kind,
  customTags,
  triggerLabel,
}: {
  kind: Kind;
  customTags: string[];
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const action = kind === "investment" ? createInvestment : createLiquidity;

  return (
    <BottomSheet
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button size="sm" className="gap-1">
          <Plus className="size-4" />
          {triggerLabel ?? "Aggiungi"}
        </Button>
      }
      title={kind === "investment" ? "Snapshot investimento" : "Snapshot liquidità"}
      description="Inserisci il valore di questo asset per il mese selezionato."
    >
      <SnapshotForm
        mode={kind}
        customTags={customTags}
        onSubmit={async (data) => {
          await action(data);
          setOpen(false);
        }}
        onCancel={() => setOpen(false)}
      />
    </BottomSheet>
  );
}
