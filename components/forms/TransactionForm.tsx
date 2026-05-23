"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TagCombobox } from "./TagCombobox";
import { CurrencySelect } from "./CurrencySelect";
import { MoneyInput } from "./MoneyInput";
import { mergePresetWithCustom } from "@/lib/tags";
import type { TagKind } from "@/lib/db/schema";
import { todayISO } from "@/lib/format";

type Mode = "income" | "expense";

type Initial = {
  id?: string;
  date?: string;
  amount?: string | number;
  currency?: string;
  tag?: string;
  source?: string | null;
  note?: string | null;
};

export function TransactionForm({
  mode,
  customTags,
  initial,
  onSubmit,
  onCancel,
}: {
  mode: Mode;
  customTags: string[];
  initial?: Initial;
  onSubmit: (data: {
    date: string;
    amount: number;
    currency: string;
    tag: string;
    source: string | null;
    note: string | null;
  }) => Promise<void>;
  onCancel?: () => void;
}) {
  const kind: TagKind = mode;
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [rawAmount, setRawAmount] = useState(
    initial?.amount !== undefined ? String(initial.amount) : ""
  );
  const [currency, setCurrency] = useState(initial?.currency ?? "EUR");
  const [tag, setTag] = useState(initial?.tag ?? "");
  const [source, setSource] = useState(initial?.source ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [pending, startTransition] = useTransition();

  const options = mergePresetWithCustom(kind, customTags);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = parseFloat(rawAmount.replace(",", "."));
        if (!Number.isFinite(parsed) || parsed <= 0) {
          toast.error("Inserisci un importo valido");
          return;
        }
        if (!tag.trim()) {
          toast.error("Seleziona un tag");
          return;
        }
        startTransition(async () => {
          try {
            await onSubmit({
              date,
              amount: parsed,
              currency,
              tag: tag.trim(),
              source: source.trim() || null,
              note: note.trim() || null,
            });
            toast.success("Voce salvata");
          } catch (err) {
            toast.error((err as Error).message ?? "Errore nel salvataggio");
          }
        });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="date">Data</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ fontSize: "16px" }}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Importo</Label>
        <div className="flex gap-2">
          <MoneyInput
            id="amount"
            value={rawAmount}
            onChange={(e) => setRawAmount(e.target.value)}
            required
          />
          <CurrencySelect value={currency} onChange={setCurrency} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tag</Label>
        <TagCombobox value={tag} onChange={setTag} options={options} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="source">
          {mode === "income" ? "Source (es. Datore di lavoro)" : "Source (es. Iliad, Netflix)"}
        </Label>
        <Input
          id="source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          style={{ fontSize: "16px" }}
          placeholder="opzionale"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Note (opzionale)</Label>
        <Textarea
          id="note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ fontSize: "16px" }}
        />
      </div>

      <div className="flex gap-2 pt-2">
        {onCancel ? (
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Annulla
          </Button>
        ) : null}
        <Button type="submit" className="flex-1" disabled={pending}>
          {pending ? "Salvataggio…" : "Salva"}
        </Button>
      </div>
    </form>
  );
}
