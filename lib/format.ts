import { format } from "date-fns";
import { it } from "date-fns/locale";

const eurFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

const compactEurFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 1,
  notation: "compact",
});

const percentFormatter = new Intl.NumberFormat("it-IT", {
  style: "percent",
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});

export function formatEUR(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return eurFormatter.format(0);
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(n)) return eurFormatter.format(0);
  return eurFormatter.format(n);
}

export function formatEURCompact(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return compactEurFormatter.format(0);
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(n)) return compactEurFormatter.format(0);
  return compactEurFormatter.format(n);
}

export function formatPercent(delta: number): string {
  if (!Number.isFinite(delta)) return "—";
  return percentFormatter.format(delta);
}

export function formatMonthLabel(monthYear: string): string {
  const [year, month] = monthYear.split("-").map(Number);
  if (!year || !month) return monthYear;
  const d = new Date(year, month - 1, 1);
  return format(d, "LLL yyyy", { locale: it });
}

export function formatMonthLong(monthYear: string): string {
  const [year, month] = monthYear.split("-").map(Number);
  if (!year || !month) return monthYear;
  const d = new Date(year, month - 1, 1);
  return format(d, "LLLL yyyy", { locale: it });
}

export function formatDateIT(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return format(d, "dd MMM yyyy", { locale: it });
}

export function currentMonthYear(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
