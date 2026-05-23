import { z } from "zod";

const monthYear = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Formato richiesto: YYYY-MM");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato richiesto: YYYY-MM-DD");
const positiveAmount = z.coerce.number().positive("Importo deve essere positivo").finite();
const currency = z.string().min(2).max(8).default("EUR");
const tag = z.string().min(1, "Tag obbligatorio").max(64);

export const investmentSchema = z.object({
  monthYear,
  value: positiveAmount,
  currency,
  tag,
  note: z.string().max(500).optional().nullable(),
});

export const liquiditySchema = z.object({
  monthYear,
  value: positiveAmount,
  currency,
  tag,
  note: z.string().max(500).optional().nullable(),
});

export const incomeSchema = z.object({
  date: isoDate,
  amount: positiveAmount,
  currency,
  tag,
  source: z.string().max(200).optional().nullable(),
  note: z.string().max(500).optional().nullable(),
});

export const expenseSchema = z.object({
  date: isoDate,
  amount: positiveAmount,
  currency,
  tag,
  source: z.string().max(200).optional().nullable(),
  note: z.string().max(500).optional().nullable(),
});

export const tagSchema = z.object({
  name: z.string().min(1).max(64),
  kind: z.enum(["investment", "liquidity", "income", "expense"]),
  color: z.string().max(16).optional().nullable(),
});

export type InvestmentInput = z.infer<typeof investmentSchema>;
export type LiquidityInput = z.infer<typeof liquiditySchema>;
export type IncomeInput = z.infer<typeof incomeSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type TagInput = z.infer<typeof tagSchema>;
