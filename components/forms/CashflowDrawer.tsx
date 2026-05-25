"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "./BottomSheet";
import { TransactionForm } from "./TransactionForm";
import { createIncome, createExpense } from "@/lib/actions";

type Kind = "income" | "expense";

export function CashflowDrawer({
  kind,
  customTags,
}: {
  kind: Kind;
  customTags: string[];
}) {
  const [open, setOpen] = useState(false);
  const action = kind === "income" ? createIncome : createExpense;
  const Icon = kind === "income" ? Plus : Minus;
  const label = kind === "income" ? "Income" : "Expense";

  return (
    <BottomSheet
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          size="sm"
          className="gap-1"
          variant={kind === "income" ? "default" : "outline"}
        >
          <Icon className="size-4" />
          {label}
        </Button>
      }
      title={kind === "income" ? "New income" : "New expense"}
    >
      <TransactionForm
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
