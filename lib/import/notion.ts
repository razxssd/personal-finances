import Papa from "papaparse";

export type NotionExpenseRow = {
  source: string;
  amount: number;
  category: string;
  date: string;
  monthYear: string;
  currency: "EUR";
};

const MONTHS_IT: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

function parseMonthColumn(raw: string): string | null {
  // "April - 2026 (https://www.notion.so/...)"
  const cleaned = raw.replace(/\s*\(https?:\/\/[^)]*\)\s*$/, "").trim();
  const m = cleaned.match(/^([A-Za-z]+)\s*-\s*(\d{4})$/);
  if (!m) return null;
  const month = MONTHS_IT[m[1].toLowerCase()];
  const year = parseInt(m[2], 10);
  if (!month || !year) return null;
  return `${year}-${String(month).padStart(2, "0")}`;
}

function parseDateField(raw: string): string | null {
  // "January 1, 2025"
  if (!raw || !raw.trim()) return null;
  const m = raw.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);
  if (!m) return null;
  const month = MONTHS_IT[m[1].toLowerCase()];
  const day = parseInt(m[2], 10);
  const year = parseInt(m[3], 10);
  if (!month || !day || !year) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseAmount(raw: string): number | null {
  // "$6.99" or "$2,587.00" — strip $, then handle "," as thousands separator
  const cleaned = raw.replace(/[$\s]/g, "").replace(/,/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function parseNotionExpensesCsv(csvText: string): {
  rows: NotionExpenseRow[];
  errors: { line: number; message: string }[];
} {
  const errors: { line: number; message: string }[] = [];
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  const rows: NotionExpenseRow[] = [];
  parsed.data.forEach((row, idx) => {
    const lineNo = idx + 2; // header is line 1
    const source = (row.Source ?? "").trim();
    const amount = parseAmount(row.Amount ?? "");
    const category = (row.Category ?? "").trim();
    const monthYear = parseMonthColumn(row.Month ?? "");
    if (!monthYear) {
      errors.push({ line: lineNo, message: "Mese non riconosciuto" });
      return;
    }
    if (amount === null || amount <= 0) {
      errors.push({ line: lineNo, message: "Amount non valido" });
      return;
    }
    if (!category) {
      errors.push({ line: lineNo, message: "Category vuota" });
      return;
    }
    const date =
      parseDateField(row.Date ?? "") ?? `${monthYear}-01`;
    rows.push({
      source: source || category,
      amount,
      category,
      date,
      monthYear,
      currency: "EUR",
    });
  });
  parsed.errors.forEach((e) => {
    errors.push({ line: (e.row ?? 0) + 2, message: e.message });
  });
  return { rows, errors };
}
