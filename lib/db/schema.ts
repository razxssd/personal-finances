import { pgTable, text, timestamp, numeric, date, varchar, primaryKey, index } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

const id = () => text("id").primaryKey().$defaultFn(() => nanoid());
const userId = () => text("user_id").notNull();
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();
const amount = (name: string) => numeric(name, { precision: 18, scale: 2 }).notNull();
const currency = () => varchar("currency", { length: 8 }).notNull().default("EUR");

export const investments = pgTable(
  "investments",
  {
    id: id(),
    userId: userId(),
    monthYear: varchar("month_year", { length: 7 }).notNull(),
    value: amount("value"),
    currency: currency(),
    tag: text("tag").notNull(),
    note: text("note"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("investments_user_month_idx").on(t.userId, t.monthYear),
    index("investments_user_tag_idx").on(t.userId, t.tag),
  ]
);

export const liquidity = pgTable(
  "liquidity",
  {
    id: id(),
    userId: userId(),
    monthYear: varchar("month_year", { length: 7 }).notNull(),
    value: amount("value"),
    currency: currency(),
    tag: text("tag").notNull(),
    note: text("note"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("liquidity_user_month_idx").on(t.userId, t.monthYear),
    index("liquidity_user_tag_idx").on(t.userId, t.tag),
  ]
);

export const incomes = pgTable(
  "incomes",
  {
    id: id(),
    userId: userId(),
    date: date("date", { mode: "string" }).notNull(),
    amount: amount("amount"),
    currency: currency(),
    tag: text("tag").notNull(),
    source: text("source"),
    note: text("note"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("incomes_user_date_idx").on(t.userId, t.date),
    index("incomes_user_tag_idx").on(t.userId, t.tag),
  ]
);

export const expenses = pgTable(
  "expenses",
  {
    id: id(),
    userId: userId(),
    date: date("date", { mode: "string" }).notNull(),
    amount: amount("amount"),
    currency: currency(),
    tag: text("tag").notNull(),
    source: text("source"),
    note: text("note"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("expenses_user_date_idx").on(t.userId, t.date),
    index("expenses_user_tag_idx").on(t.userId, t.tag),
  ]
);

export const tags = pgTable(
  "tags",
  {
    id: id(),
    userId: userId(),
    name: text("name").notNull(),
    kind: varchar("kind", { length: 20 }).notNull(),
    color: varchar("color", { length: 16 }),
    createdAt: createdAt(),
  },
  (t) => [index("tags_user_kind_idx").on(t.userId, t.kind)]
);

export const exchangeRates = pgTable(
  "exchange_rates",
  {
    date: date("date", { mode: "string" }).notNull(),
    fromCurrency: varchar("from_currency", { length: 8 }).notNull(),
    toCurrency: varchar("to_currency", { length: 8 }).notNull(),
    rate: numeric("rate", { precision: 24, scale: 12 }).notNull(),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.date, t.fromCurrency, t.toCurrency] })]
);

export type Investment = typeof investments.$inferSelect;
export type NewInvestment = typeof investments.$inferInsert;
export type Liquidity = typeof liquidity.$inferSelect;
export type NewLiquidity = typeof liquidity.$inferInsert;
export type Income = typeof incomes.$inferSelect;
export type NewIncome = typeof incomes.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export type TagKind = "investment" | "liquidity" | "income" | "expense";
