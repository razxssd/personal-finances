"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
// Note: Button is still used for non-asChild buttons in this file
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, Upload } from "lucide-react";
import {
  importInvestmentsCsv,
  importLiquidityCsv,
  importIncomesCsv,
  importExpensesCsv,
  importNotionExpensesCsv,
  exportAllAsJson,
} from "@/lib/import/actions";

type ImportFn = (csv: string) => Promise<{ inserted: number; errors: { line: number; message: string }[] }>;

function ImportCard({
  title,
  description,
  templateUrl,
  importFn,
  acceptLabel = "Carica CSV",
}: {
  title: string;
  description: string;
  templateUrl?: string;
  importFn: ImportFn;
  acceptLabel?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<{ line: number; message: string }[]>([]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      startTransition(async () => {
        try {
          const res = await importFn(text);
          setErrors(res.errors);
          if (res.inserted > 0) {
            toast.success(`Importate ${res.inserted} righe`);
          }
          if (res.errors.length > 0) {
            toast.warning(`${res.errors.length} righe scartate — vedi dettagli`);
          }
          if (res.inserted === 0 && res.errors.length === 0) {
            toast.info("Nessuna riga da importare");
          }
        } catch (err) {
          toast.error((err as Error).message);
        } finally {
          e.target.value = "";
        }
      });
    };
    reader.readAsText(file);
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          {templateUrl ? (
            <a
              href={templateUrl}
              download
              className="inline-flex items-center justify-center gap-2 h-7 px-2.5 rounded-md border border-input bg-background text-[0.8rem] font-medium hover:bg-accent transition-colors"
            >
              <Download className="size-4" />
              Template CSV
            </a>
          ) : null}
          <label className="flex-1">
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFile}
              disabled={pending}
            />
            <span
              className="inline-flex w-full items-center justify-center gap-2 h-9 px-4 rounded-md border border-input bg-background text-sm font-medium cursor-pointer hover:bg-accent transition-colors"
            >
              <Upload className="size-4" />
              {pending ? "Importazione…" : acceptLabel}
            </span>
          </label>
        </div>
        {errors.length > 0 ? (
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground">
              {errors.length} righe scartate
            </summary>
            <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto rounded bg-muted/40 p-2">
              {errors.slice(0, 50).map((e, idx) => (
                <li key={idx} className="text-muted-foreground">
                  Riga {e.line}: {e.message}
                </li>
              ))}
              {errors.length > 50 ? <li>…e altre {errors.length - 50}</li> : null}
            </ul>
          </details>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function ImportClient() {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const json = await exportAllAsJson();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `personal-finances-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Export scaricato");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-dashed">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="font-medium text-sm">Backup completo</p>
            <p className="text-xs text-muted-foreground">
              Scarica tutti i tuoi dati come JSON.
            </p>
          </div>
          <Button onClick={handleExport} disabled={exporting} size="sm" className="gap-2">
            <Download className="size-4" />
            {exporting ? "Export…" : "Esporta JSON"}
          </Button>
        </CardContent>
      </Card>

      <ImportCard
        title="Notion — Expenses"
        description="Carica direttamente l'export del database Expenses da Notion (colonne: Source, Amount, Category, Date, Month). Lo $ viene strippato, gli importi sono salvati come EUR."
        importFn={importNotionExpensesCsv}
        acceptLabel="Carica Notion CSV"
      />

      <ImportCard
        title="Investimenti — snapshot mensili"
        description="CSV con colonne: month (YYYY-MM), value, currency, tag, note"
        templateUrl="/templates/investments.csv"
        importFn={importInvestmentsCsv}
      />

      <ImportCard
        title="Liquidità — snapshot mensili"
        description="CSV con colonne: month (YYYY-MM), value, currency, tag, note"
        templateUrl="/templates/liquidity.csv"
        importFn={importLiquidityCsv}
      />

      <ImportCard
        title="Entrate — transazioni"
        description="CSV con colonne: date (YYYY-MM-DD), amount, currency, tag, source, note"
        templateUrl="/templates/income.csv"
        importFn={importIncomesCsv}
      />

      <ImportCard
        title="Uscite — transazioni"
        description="CSV con colonne: date (YYYY-MM-DD), amount, currency, tag, source, note"
        templateUrl="/templates/expenses.csv"
        importFn={importExpensesCsv}
      />
    </div>
  );
}
