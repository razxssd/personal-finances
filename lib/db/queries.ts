import "server-only";
import { auth } from "@clerk/nextjs/server";
import { db } from "./index";
import { investments, liquidity, incomes, expenses, tags } from "./schema";
import { and, asc, desc, eq, gte, lte } from "drizzle-orm";

export async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHORIZED");
  return userId;
}

export async function listInvestments() {
  const userId = await requireUser();
  return db
    .select()
    .from(investments)
    .where(eq(investments.userId, userId))
    .orderBy(desc(investments.monthYear), desc(investments.createdAt));
}

export async function listLiquidity() {
  const userId = await requireUser();
  return db
    .select()
    .from(liquidity)
    .where(eq(liquidity.userId, userId))
    .orderBy(desc(liquidity.monthYear), desc(liquidity.createdAt));
}

export async function listIncomes(opts?: { from?: string; to?: string }) {
  const userId = await requireUser();
  const conditions = [eq(incomes.userId, userId)];
  if (opts?.from) conditions.push(gte(incomes.date, opts.from));
  if (opts?.to) conditions.push(lte(incomes.date, opts.to));
  return db
    .select()
    .from(incomes)
    .where(and(...conditions))
    .orderBy(desc(incomes.date), desc(incomes.createdAt));
}

export async function listExpenses(opts?: { from?: string; to?: string }) {
  const userId = await requireUser();
  const conditions = [eq(expenses.userId, userId)];
  if (opts?.from) conditions.push(gte(expenses.date, opts.from));
  if (opts?.to) conditions.push(lte(expenses.date, opts.to));
  return db
    .select()
    .from(expenses)
    .where(and(...conditions))
    .orderBy(desc(expenses.date), desc(expenses.createdAt));
}

export async function listTags(kind?: "investment" | "liquidity" | "income" | "expense") {
  const userId = await requireUser();
  const conditions = [eq(tags.userId, userId)];
  if (kind) conditions.push(eq(tags.kind, kind));
  return db
    .select()
    .from(tags)
    .where(and(...conditions))
    .orderBy(asc(tags.name));
}
