"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { investments, liquidity, incomes, expenses, tags, type TagKind } from "@/lib/db/schema";
import { requireUser } from "@/lib/db/queries";
import { parseSnapshotCsv, parseTransactionCsv } from "./csv";
import { parseNotionExpensesCsv } from "./notion";
import { and, eq } from "drizzle-orm";

type ImportResult = { inserted: number; errors: { line: number; message: string }[] };

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

export async function importInvestmentsCsv(csvText: string): Promise<ImportResult> {
  const userId = await requireUser();
  const { rows, errors } = parseSnapshotCsv(csvText);
  if (rows.length > 0) {
    await db.insert(investments).values(
      rows.map((r) => ({
        userId,
        monthYear: r.monthYear,
        value: r.value.toString(),
        currency: r.currency,
        tag: r.tag,
        note: r.note,
      }))
    );
    await bulkEnsureTags(userId, rows.map((r) => r.tag), "investment");
  }
  revalidatePath("/wealth");
  revalidatePath("/");
  return { inserted: rows.length, errors };
}

export async function importLiquidityCsv(csvText: string): Promise<ImportResult> {
  const userId = await requireUser();
  const { rows, errors } = parseSnapshotCsv(csvText);
  if (rows.length > 0) {
    await db.insert(liquidity).values(
      rows.map((r) => ({
        userId,
        monthYear: r.monthYear,
        value: r.value.toString(),
        currency: r.currency,
        tag: r.tag,
        note: r.note,
      }))
    );
    await bulkEnsureTags(userId, rows.map((r) => r.tag), "liquidity");
  }
  revalidatePath("/wealth");
  revalidatePath("/");
  return { inserted: rows.length, errors };
}

export async function importIncomesCsv(csvText: string): Promise<ImportResult> {
  const userId = await requireUser();
  const { rows, errors } = parseTransactionCsv(csvText);
  if (rows.length > 0) {
    await db.insert(incomes).values(
      rows.map((r) => ({
        userId,
        date: r.date,
        amount: r.amount.toString(),
        currency: r.currency,
        tag: r.tag,
        source: r.source,
        note: r.note,
      }))
    );
    await bulkEnsureTags(userId, rows.map((r) => r.tag), "income");
  }
  revalidatePath("/cashflow");
  revalidatePath("/");
  return { inserted: rows.length, errors };
}

export async function importExpensesCsv(csvText: string): Promise<ImportResult> {
  const userId = await requireUser();
  const { rows, errors } = parseTransactionCsv(csvText);
  if (rows.length > 0) {
    await db.insert(expenses).values(
      rows.map((r) => ({
        userId,
        date: r.date,
        amount: r.amount.toString(),
        currency: r.currency,
        tag: r.tag,
        source: r.source,
        note: r.note,
      }))
    );
    await bulkEnsureTags(userId, rows.map((r) => r.tag), "expense");
  }
  revalidatePath("/cashflow");
  revalidatePath("/");
  return { inserted: rows.length, errors };
}

export async function importNotionExpensesCsv(csvText: string): Promise<ImportResult> {
  const userId = await requireUser();
  const { rows, errors } = parseNotionExpensesCsv(csvText);
  if (rows.length > 0) {
    await db.insert(expenses).values(
      rows.map((r) => ({
        userId,
        date: r.date,
        amount: r.amount.toString(),
        currency: r.currency,
        tag: r.category,
        source: r.source,
        note: null,
      }))
    );
    await bulkEnsureTags(userId, rows.map((r) => r.category), "expense");
  }
  revalidatePath("/cashflow");
  revalidatePath("/");
  return { inserted: rows.length, errors };
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
