import "server-only";
import { db } from "@/lib/db";
import { exchangeRates } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

const CRYPTO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  USDT: "tether",
  USDC: "usd-coin",
  BNB: "binancecoin",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

async function readCached(date: string, from: string, to: string) {
  const rows = await db
    .select()
    .from(exchangeRates)
    .where(
      and(
        eq(exchangeRates.date, date),
        eq(exchangeRates.fromCurrency, from),
        eq(exchangeRates.toCurrency, to)
      )
    )
    .limit(1);
  return rows[0]?.rate ? Number(rows[0].rate) : null;
}

async function writeCached(date: string, from: string, to: string, rate: number) {
  await db
    .insert(exchangeRates)
    .values({ date, fromCurrency: from, toCurrency: to, rate: rate.toString() })
    .onConflictDoUpdate({
      target: [exchangeRates.date, exchangeRates.fromCurrency, exchangeRates.toCurrency],
      set: { rate: rate.toString() },
    });
}

async function fetchFiatRate(from: string, to: string): Promise<number | null> {
  try {
    const r = await fetch(
      `https://api.exchangerate.host/latest?base=${from}&symbols=${to}`,
      { next: { revalidate: 21600 } }
    );
    if (!r.ok) return null;
    const data = (await r.json()) as { rates?: Record<string, number> };
    return data.rates?.[to] ?? null;
  } catch {
    return null;
  }
}

async function fetchCryptoRate(crypto: string, to: string): Promise<number | null> {
  const id = CRYPTO_IDS[crypto.toUpperCase()];
  if (!id) return null;
  const vs = to.toLowerCase();
  try {
    const r = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${vs}`,
      { next: { revalidate: 21600 } }
    );
    if (!r.ok) return null;
    const data = (await r.json()) as Record<string, Record<string, number>>;
    return data[id]?.[vs] ?? null;
  } catch {
    return null;
  }
}

export async function getRate(from: string, to = "EUR"): Promise<number> {
  const F = from.toUpperCase();
  const T = to.toUpperCase();
  if (F === T) return 1;

  const date = todayISO();
  const cached = await readCached(date, F, T);
  if (cached !== null) return cached;

  let rate: number | null = null;
  if (CRYPTO_IDS[F]) {
    rate = await fetchCryptoRate(F, T);
  } else {
    rate = await fetchFiatRate(F, T);
  }

  if (rate === null) return 1;
  await writeCached(date, F, T, rate);
  return rate;
}

export async function convertToEUR(amount: number, from: string): Promise<number> {
  if (from.toUpperCase() === "EUR") return amount;
  const rate = await getRate(from, "EUR");
  return amount * rate;
}

export function isKnownCurrency(code: string): boolean {
  const upper = code.toUpperCase();
  return upper in CRYPTO_IDS || ["EUR", "USD", "GBP", "CHF", "JPY"].includes(upper);
}
