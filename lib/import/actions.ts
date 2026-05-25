"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { investments, liquidity, incomes, expenses, tags, type TagKind } from "@/lib/db/schema";
import { requireUser } from "@/lib/db/queries";
import { parseSnapshotCsv, parseTransactionCsv } from "./csv";
import { parseNotionExpensesCsv } from "./notion";
import { and, eq } from "drizzle-orm";

export type ImportResult = {
  inserted: number;
  skipped: number;
  errors: { line: number; message: string }[];
};

async function bulkEnsureTags(userId: string, names: string[], kind: TagKind) {
  const unique = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  if (unique.length === 0) return;
  const existing = await db
    .select({ name: tags.name })
    .from(tags)
    .where(and(eq(tags.userId, userId), eq(tags.kind, kind)));
  const existingSet = new Set(existing.map((e) => e.name));
  const toInsert = unique
    .filter((n) => !existingSet.has(n))
    .map((n) => ({ userId, name: n, kind }));
  if (toInsert.length > 0) {
    await db.insert(tags).values(toInsert);
  }
}

// Normalize a numeric string so equality compares stably across "100" / "100.00"
function nAmount(v: string | number): string {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

function snapshotKey(monthYear: string, tag: string, value: string | number, currency: string) {
  return `${monthYear}|${tag}|${nAmount(value)}|${currency.toUpperCase()}`;
}

function transactionKey(date: string, amount: string | number, tag: string, source: string | null) {
  return `${date}|${nAmount(amount)}|${tag}|${(source ?? "").trim().toLowerCase()}`;
}

async function existingSnapshotKeys(table: typeof investments | typeof liquidity, userId: string) {
  const rows = await db
    .select({
      monthYear: table.monthYear,
      tag: table.tag,
      value: table.value,
      currency: table.currency,
    })
    .from(table)
    .where(eq(table.userId, userId));
  return new Set(rows.map((r) => snapshotKey(r.monthYear, r.tag, r.value, r.currency)));
}

async function existingTransactionKeys(table: typeof incomes | typeof expenses, userId: string) {
  const rows = await db
    .select({
      date: table.date,
      amount: table.amount,
      tag: table.tag,
      source: table.source,
    })
    .from(table)
    .where(eq(table.userId, userId));
  return new Set(rows.map((r) => transactionKey(r.date, r.amount, r.tag, r.source)));
}

export async function importInvestmentsCsv(csvText: string): Promise<ImportResult> {
  const userId = await requireUser();
  const { rows, errors } = parseSnapshotCsv(csvText);
  const existing = await existingSnapshotKeys(investments, userId);
  const seen = new Set<string>();
  const toInsert: typeof rows = [];
  let skipped = 0;
  for (const r of rows) {
    const k = snapshotKey(r.monthYear, r.tag, r.value, r.currency);
    if (existing.has(k) || seen.has(k)) {
      skipped++;
      continue;
    }
    seen.add(k);
    toInsert.push(r);
  }
  if (toInsert.length > 0) {
    await db.insert(investments).values(
      toInsert.map((r) => ({
        userId,
        monthYear: r.monthYear,
        value: r.value.toString(),
        currency: r.currency,
        tag: r.tag,
        note: r.note,
      }))
    );
    await bulkEnsureTags(userId, toInsert.map((r) => r.tag), "investment");
  }
  revalidatePath("/wealth");
  revalidatePath("/");
  return { inserted: toInsert.length, skipped, errors };
}

export async function importLiquidityCsv(csvText: string): Promise<ImportResult> {
  const userId = await requireUser();
  const { rows, errors } = parseSnapshotCsv(csvText);
  const existing = await existingSnapshotKeys(liquidity, userId);
  const seen = new Set<string>();
  const toInsert: typeof rows = [];
  let skipped = 0;
  for (const r of rows) {
    const k = snapshotKey(r.monthYear, r.tag, r.value, r.currency);
    if (existing.has(k) || seen.has(k)) {
      skipped++;
      continue;
    }
    seen.add(k);
    toInsert.push(r);
  }
  if (toInsert.length > 0) {
    await db.insert(liquidity).values(
      toInsert.map((r) => ({
        userId,
        monthYear: r.monthYear,
        value: r.value.toString(),
        currency: r.currency,
        tag: r.tag,
        note: r.note,
      }))
    );
    await bulkEnsureTags(userId, toInsert.map((r) => r.tag), "liquidity");
  }
  revalidatePath("/wealth");
  revalidatePath("/");
  return { inserted: toInsert.length, skipped, errors };
}

export async function importIncomesCsv(csvText: string): Promise<ImportResult> {
  const userId = await requireUser();
  const { rows, errors } = parseTransactionCsv(csvText);
  const existing = await existingTransactionKeys(incomes, userId);
  const seen = new Set<string>();
  const toInsert: typeof rows = [];
  let skipped = 0;
  for (const r of rows) {
    const k = transactionKey(r.date, r.amount, r.tag, r.source);
    if (existing.has(k) || seen.has(k)) {
      skipped++;
      continue;
    }
    seen.add(k);
    toInsert.push(r);
  }
  if (toInsert.length > 0) {
    await db.insert(incomes).values(
      toInsert.map((r) => ({
        userId,
        date: r.date,
        amount: r.amount.toString(),
        currency: r.currency,
        tag: r.tag,
        source: r.source,
        note: r.note,
      }))
    );
    await bulkEnsureTags(userId, toInsert.map((r) => r.tag), "income");
  }
  revalidatePath("/cashflow");
  revalidatePath("/");
  return { inserted: toInsert.length, skipped, errors };
}

export async function importExpensesCsv(csvText: string): Promise<ImportResult> {
  const userId = await requireUser();
  const { rows, errors } = parseTransactionCsv(csvText);
  const existing = await existingTransactionKeys(expenses, userId);
  const seen = new Set<string>();
  const toInsert: typeof rows = [];
  let skipped = 0;
  for (const r of rows) {
    const k = transactionKey(r.date, r.amount, r.tag, r.source);
    if (existing.has(k) || seen.has(k)) {
      skipped++;
      continue;
    }
    seen.add(k);
    toInsert.push(r);
  }
  if (toInsert.length > 0) {
    await db.insert(expenses).values(
      toInsert.map((r) => ({
        userId,
        date: r.date,
        amount: r.amount.toString(),
        currency: r.currency,
        tag: r.tag,
        source: r.source,
        note: r.note,
      }))
    );
    await bulkEnsureTags(userId, toInsert.map((r) => r.tag), "expense");
  }
  revalidatePath("/cashflow");
  revalidatePath("/");
  return { inserted: toInsert.length, skipped, errors };
}

export async function importNotionExpensesCsv(csvText: string): Promise<ImportResult> {
  const userId = await requireUser();
  const { rows, errors } = parseNotionExpensesCsv(csvText);
  const existing = await existingTransactionKeys(expenses, userId);
  const seen = new Set<string>();
  const toInsert: typeof rows = [];
  let skipped = 0;
  for (const r of rows) {
    const k = transactionKey(r.date, r.amount, r.category, r.source);
    if (existing.has(k) || seen.has(k)) {
      skipped++;
      continue;
    }
    seen.add(k);
    toInsert.push(r);
  }
  if (toInsert.length > 0) {
    await db.insert(expenses).values(
      toInsert.map((r) => ({
        userId,
        date: r.date,
        amount: r.amount.toString(),
        currency: r.currency,
        tag: r.category,
        source: r.source,
        note: null,
      }))
    );
    await bulkEnsureTags(userId, toInsert.map((r) => r.category), "expense");
  }
  revalidatePath("/cashflow");
  revalidatePath("/");
  return { inserted: toInsert.length, skipped, errors };
}

export async function exportAllAsJson(): Promise<string> {
  const userId = await requireUser();
  const [inv, liq, inc, exp, tg] = await Promise.all([
    db.select().from(investments).where(eq(investments.userId, userId)),
    db.select().from(liquidity).where(eq(liquidity.userId, userId)),
    db.select().from(incomes).where(eq(incomes.userId, userId)),
    db.select().from(expenses).where(eq(expenses.userId, userId)),
    db.select().from(tags).where(eq(tags.userId, userId)),
  ]);
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      version: 1,
      data: { investments: inv, liquidity: liq, incomes: inc, expenses: exp, tags: tg },
    },
    null,
    2
  );
}
