"use client";

import { useCallback, useState } from "react";
import {
  EXCLUDE_INVESTMENTS_COOKIE,
  PREF_COOKIE_MAX_AGE,
} from "@/lib/prefs";

/**
 * "Exclude Investments" toggle, shared by Home and Cashflow.
 *
 * `initial` comes from the cookie read on the server, so the first render is
 * already correct — the state here only tracks changes made in this tab.
 */
export function useExcludeInvestments(
  initial: boolean
): [boolean, (next: boolean) => void] {
  const [excludeInvestments, setExcludeInvestments] = useState(initial);

  const set = useCallback((next: boolean) => {
    setExcludeInvestments(next);
    if (typeof document === "undefined") return;
    const secure = window.location.protocol === "https:" ? "; secure" : "";
    document.cookie = `${EXCLUDE_INVESTMENTS_COOKIE}=${next ? "1" : "0"}; path=/; max-age=${PREF_COOKIE_MAX_AGE}; samesite=lax${secure}`;
  }, []);

  return [excludeInvestments, set];
}
