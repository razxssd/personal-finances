"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { investments, liquidity, incomes, expenses, tags, type TagKind } from "@/lib/db/schema";
import {
  investmentSchema,
  liquiditySchema,
  incomeSchema,
  expenseSchema,
  tagSchema,
  type InvestmentInput,
  type LiquidityInput,
  type IncomeInput,
  type ExpenseInput,
} from "@/lib/schemas";
import { requireUser } from "@/lib/db/queries";
import { TAG_KINDS } from "@/lib/tags";

async function ensureTag(userId: string, name: string, kind: TagKind) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const existing = await db
    .select()
    .from(tags)
    .where(and(eq(tags.userId, userId), eq(tags.kind, kind), eq(tags.name, trimmed)))
    .limit(1);
  if (existing[0]) return;
  await db.insert(tags).values({ userId, name: trimmed, kind });
}

export async function createInvestment(input: InvestmentInput) {
  const userId = await requireUser();
  const data = investmentSchema.parse(input);
  await db.insert(investments).values({
    userId,
    monthYear: data.monthYear,
    value: data.value.toString(),
    currency: data.currency,
    tag: data.tag,
    note: data.note ?? null,
  });
  await ensureTag(userId, data.tag, "investment");
  revalidatePath("/wealth");
  revalidatePath("/");
}

export async function updateInvestment(id: string, input: InvestmentInput) {
  const userId = await requireUser();
  const data = investmentSchema.parse(input);
  await db
    .update(investments)
    .set({
      monthYear: data.monthYear,
      value: data.value.toString(),
      currency: data.currency,
      tag: data.tag,
      note: data.note ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(investments.id, id), eq(investments.userId, userId)));
  await ensureTag(userId, data.tag, "investment");
  revalidatePath("/wealth");
  revalidatePath("/");
}

export async function deleteInvestment(id: string) {
  const userId = await requireUser();
  await db.delete(investments).where(and(eq(investments.id, id), eq(investments.userId, userId)));
  revalidatePath("/wealth");
  revalidatePath("/");
}

export async function createLiquidity(input: LiquidityInput) {
  const userId = await requireUser();
  const data = liquiditySchema.parse(input);
  await db.insert(liquidity).values({
    userId,
    monthYear: data.monthYear,
    value: data.value.toString(),
    currency: data.currency,
    tag: data.tag,
    note: data.note ?? null,
  });
  await ensureTag(userId, data.tag, "liquidity");
  revalidatePath("/wealth");
  revalidatePath("/");
}

export async function updateLiquidity(id: string, input: LiquidityInput) {
  const userId = await requireUser();
  const data = liquiditySchema.parse(input);
  await db
    .update(liquidity)
    .set({
      monthYear: data.monthYear,
      value: data.value.toString(),
      currency: data.currency,
      tag: data.tag,
      note: data.note ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(liquidity.id, id), eq(liquidity.userId, userId)));
  await ensureTag(userId, data.tag, "liquidity");
  revalidatePath("/wealth");
  revalidatePath("/");
}

export async function deleteLiquidity(id: string) {
  const userId = await requireUser();
  await db.delete(liquidity).where(and(eq(liquidity.id, id), eq(liquidity.userId, userId)));
  revalidatePath("/wealth");
  revalidatePath("/");
}

export async function createIncome(input: IncomeInput) {
  const userId = await requireUser();
  const data = incomeSchema.parse(input);
  await db.insert(incomes).values({
    userId,
    date: data.date,
    amount: data.amount.toString(),
    currency: data.currency,
    tag: data.tag,
    source: data.source ?? null,
    note: data.note ?? null,
  });
  await ensureTag(userId, data.tag, "income");
  revalidatePath("/cashflow");
  revalidatePath("/");
}

export async function updateIncome(id: string, input: IncomeInput) {
  const userId = await requireUser();
  const data = incomeSchema.parse(input);
  await db
    .update(incomes)
    .set({
      date: data.date,
      amount: data.amount.toString(),
      currency: data.currency,
      tag: data.tag,
      source: data.source ?? null,
      note: data.note ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(incomes.id, id), eq(incomes.userId, userId)));
  await ensureTag(userId, data.tag, "income");
  revalidatePath("/cashflow");
  revalidatePath("/");
}

export async function deleteIncome(id: string) {
  const userId = await requireUser();
  await db.delete(incomes).where(and(eq(incomes.id, id), eq(incomes.userId, userId)));
  revalidatePath("/cashflow");
  revalidatePath("/");
}

export async function createExpense(input: ExpenseInput) {
  const userId = await requireUser();
  const data = expenseSchema.parse(input);
  await db.insert(expenses).values({
    userId,
    date: data.date,
    amount: data.amount.toString(),
    currency: data.currency,
    tag: data.tag,
    source: data.source ?? null,
    note: data.note ?? null,
  });
  await ensureTag(userId, data.tag, "expense");
  revalidatePath("/cashflow");
  revalidatePath("/");
}

export async function updateExpense(id: string, input: ExpenseInput) {
  const userId = await requireUser();
  const data = expenseSchema.parse(input);
  await db
    .update(expenses)
    .set({
      date: data.date,
      amount: data.amount.toString(),
      currency: data.currency,
      tag: data.tag,
      source: data.source ?? null,
      note: data.note ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
  await ensureTag(userId, data.tag, "expense");
  revalidatePath("/cashflow");
  revalidatePath("/");
}

export async function deleteExpense(id: string) {
  const userId = await requireUser();
  await db.delete(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
  revalidatePath("/cashflow");
  revalidatePath("/");
}

export async function createTag(input: { name: string; kind: TagKind; color?: string | null }) {
  const userId = await requireUser();
  const data = tagSchema.parse(input);
  const existing = await db
    .select()
    .from(tags)
    .where(and(eq(tags.userId, userId), eq(tags.kind, data.kind), eq(tags.name, data.name)))
    .limit(1);
  if (!existing[0]) {
    await db.insert(tags).values({ userId, name: data.name, kind: data.kind, color: data.color ?? null });
  }
  revalidatePath("/wealth");
  revalidatePath("/cashflow");
  revalidatePath("/settings");
}

/**
 * Wipes every row of one dataset for the current user — the "start over and
 * re-import" escape hatch. Tags are deliberately left alone: they are just
 * labels, and an import recreates the ones it needs anyway.
 */
export async function resetDataset(kind: TagKind): Promise<{ deleted: number }> {
  const userId = await requireUser();
  let deleted: { id: string }[];
  switch (kind) {
    case "investment":
      deleted = await db
        .delete(investments)
        .where(eq(investments.userId, userId))
        .returning({ id: investments.id });
      break;
    case "liquidity":
      deleted = await db
        .delete(liquidity)
        .where(eq(liquidity.userId, userId))
        .returning({ id: liquidity.id });
      break;
    case "income":
      deleted = await db
        .delete(incomes)
        .where(eq(incomes.userId, userId))
        .returning({ id: incomes.id });
      break;
    case "expense":
      deleted = await db
        .delete(expenses)
        .where(eq(expenses.userId, userId))
        .returning({ id: expenses.id });
      break;
    default:
      throw new Error("Unknown dataset");
  }
  revalidatePath("/wealth");
  revalidatePath("/cashflow");
  revalidatePath("/settings");
  revalidatePath("/");
  return { deleted: deleted.length };
}

/**
 * Clears every custom tag of one kind. Preset tags live in code, so they are
 * untouched — and so is the data: a row keeps its tag string either way, the
 * tag table is only the suggestion list the comboboxes read.
 */
export async function deleteAllTags(kind: TagKind): Promise<{ deleted: number }> {
  const userId = await requireUser();
  if (!TAG_KINDS.includes(kind)) throw new Error("Unknown tag kind");
  const deleted = await db
    .delete(tags)
    .where(and(eq(tags.userId, userId), eq(tags.kind, kind)))
    .returning({ id: tags.id });
  revalidatePath("/settings");
  return { deleted: deleted.length };
}

export async function deleteTag(id: string) {
  const userId = await requireUser();
  await db.delete(tags).where(and(eq(tags.id, id), eq(tags.userId, userId)));
  revalidatePath("/settings");
}
