import Papa from "papaparse";

export type CsvSnapshotRow = {
  monthYear: string;
  value: number;
  currency: string;
  tag: string;
  note: string | null;
};

function num(v: string): number | null {
  const n = parseFloat((v ?? "").trim().replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function parseSnapshotCsv(csvText: string): {
  rows: CsvSnapshotRow[];
  errors: { line: number; message: string }[];
} {
  const errors: { line: number; message: string }[] = [];
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  const rows: CsvSnapshotRow[] = [];
  parsed.data.forEach((r, idx) => {
    const lineNo = idx + 2;
    const monthYear = (r.month ?? "").trim();
    const value = num(r.value ?? "");
    const currency = (r.currency ?? "EUR").trim() || "EUR";
    const tag = (r.tag ?? "").trim();
    const note = (r.note ?? "").trim() || null;
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(monthYear)) {
      errors.push({ line: lineNo, message: "month deve essere YYYY-MM" });
      return;
    }
    if (value === null || value <= 0) {
      errors.push({ line: lineNo, message: "value non valido" });
      return;
    }
    if (!tag) {
      errors.push({ line: lineNo, message: "tag obbligatorio" });
      return;
    }
    rows.push({ monthYear, value, currency, tag, note });
  });
  return { rows, errors };
}
