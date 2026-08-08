/**
 * UI preferences persisted in a cookie so the server render already knows them
 * (no post-hydration flash). Read on the server with `cookies()`, written on
 * the client with `useExcludeInvestments`. Neutral module: no "use client",
 * no "server-only" — both sides import it.
 */

export const EXCLUDE_INVESTMENTS_COOKIE = "pf_exclude_investments";

/** One year — this is a display preference, not session state. */
export const PREF_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function parseExcludeInvestments(value: string | undefined): boolean {
  return value === "1";
}
