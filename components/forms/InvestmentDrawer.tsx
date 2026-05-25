"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "./BottomSheet";
import { SnapshotForm } from "./SnapshotForm";
import { createInvestment, createLiquidity } from "@/lib/actions";

type Kind = "investment" | "liquidity";

export function WealthDrawer({
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
          {triggerLabel ?? "Add"}
        </Button>
      }
      title={kind === "investment" ? "Investment snapshot" : "Liquidity snapshot"}
      description="Enter the value of this asset for the selected month."
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
