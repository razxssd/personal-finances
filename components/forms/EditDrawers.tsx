"use client";

import { BottomSheet } from "./BottomSheet";
import { SnapshotForm } from "./SnapshotForm";
import { TransactionForm } from "./TransactionForm";
import {
  updateInvestment,
  updateLiquidity,
  updateIncome,
  updateExpense,
} from "@/lib/actions";

type SnapshotRow = {
  id: string;
  monthYear: string;
  value: string;
  currency: string;
  tag: string;
  note: string | null;
};

type TransactionRow = {
  id: string;
  date: string;
  amount: string;
  currency: string;
  tag: string;
  source: string | null;
  note: string | null;
};

export function EditInvestmentDrawer({
  row,
  customTags,
  onClose,
}: {
  row: SnapshotRow;
  customTags: string[];
  onClose: () => void;
}) {
  return (
    <BottomSheet
      open
      onOpenChange={(v) => !v && onClose()}
      title="Modifica investimento"
      description="Aggiorna importo, tag o nota."
    >
      <SnapshotForm
        mode="investment"
        customTags={customTags}
        initial={{
          monthYear: row.monthYear,
          value: row.value,
          currency: row.currency,
          tag: row.tag,
          note: row.note,
        }}
        onSubmit={async (data) => {
          await updateInvestment(row.id, data);
          onClose();
        }}
        onCancel={onClose}
      />
    </BottomSheet>
  );
}

export function EditLiquidityDrawer({
  row,
  customTags,
  onClose,
}: {
  row: SnapshotRow;
  customTags: string[];
  onClose: () => void;
}) {
  return (
    <BottomSheet
      open
      onOpenChange={(v) => !v && onClose()}
      title="Modifica liquidità"
      description="Aggiorna importo, tag o nota."
    >
      <SnapshotForm
        mode="liquidity"
        customTags={customTags}
        initial={{
          monthYear: row.monthYear,
          value: row.value,
          currency: row.currency,
          tag: row.tag,
          note: row.note,
        }}
        onSubmit={async (data) => {
          await updateLiquidity(row.id, data);
          onClose();
        }}
        onCancel={onClose}
      />
    </BottomSheet>
  );
}

export function EditIncomeDrawer({
  row,
  customTags,
  onClose,
}: {
  row: TransactionRow;
  customTags: string[];
  onClose: () => void;
}) {
  return (
    <BottomSheet
      open
      onOpenChange={(v) => !v && onClose()}
      title="Modifica entrata"
    >
      <TransactionForm
        mode="income"
        customTags={customTags}
        initial={{
          date: row.date,
          amount: row.amount,
          currency: row.currency,
          tag: row.tag,
          source: row.source,
          note: row.note,
        }}
        onSubmit={async (data) => {
          await updateIncome(row.id, data);
          onClose();
        }}
        onCancel={onClose}
      />
    </BottomSheet>
  );
}

export function EditExpenseDrawer({
  row,
  customTags,
  onClose,
}: {
  row: TransactionRow;
  customTags: string[];
  onClose: () => void;
}) {
  return (
    <BottomSheet
      open
      onOpenChange={(v) => !v && onClose()}
      title="Modifica uscita"
    >
      <TransactionForm
        mode="expense"
        customTags={customTags}
        initial={{
          date: row.date,
          amount: row.amount,
          currency: row.currency,
          tag: row.tag,
          source: row.source,
          note: row.note,
        }}
        onSubmit={async (data) => {
          await updateExpense(row.id, data);
          onClose();
        }}
        onCancel={onClose}
      />
    </BottomSheet>
  );
}
