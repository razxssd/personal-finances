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
import { currentMonthYear } from "@/lib/format";

type Mode = "investment" | "liquidity";

type Initial = {
  id?: string;
  monthYear?: string;
  value?: string | number;
  currency?: string;
  tag?: string;
  note?: string | null;
};

export function SnapshotForm({
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
    monthYear: string;
    value: number;
    currency: string;
    tag: string;
    note: string | null;
  }) => Promise<void>;
  onCancel?: () => void;
}) {
  const kind: TagKind = mode;
  const [monthYear, setMonthYear] = useState(initial?.monthYear ?? currentMonthYear());
  const [rawValue, setRawValue] = useState(
    initial?.value !== undefined ? String(initial.value) : ""
  );
  const [currency, setCurrency] = useState(initial?.currency ?? "EUR");
  const [tag, setTag] = useState(initial?.tag ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [pending, startTransition] = useTransition();

  const options = mergePresetWithCustom(kind, customTags);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = parseFloat(rawValue.replace(",", "."));
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
              monthYear,
              value: parsed,
              currency,
              tag: tag.trim(),
              note: note.trim() || null,
            });
            toast.success("Snapshot salvato");
          } catch (err) {
            toast.error((err as Error).message ?? "Errore nel salvataggio");
          }
        });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="month">Mese</Label>
        <Input
          id="month"
          type="month"
          value={monthYear}
          onChange={(e) => setMonthYear(e.target.value)}
          style={{ fontSize: "16px" }}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Valore</Label>
        <div className="flex gap-2">
          <MoneyInput
            id="amount"
            value={rawValue}
            onChange={(e) => setRawValue(e.target.value)}
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
        <Label htmlFor="note">Note (opzionale)</Label>
        <Textarea
          id="note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ fontSize: "16px" }}
          placeholder="es. VWCE su Directa"
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
