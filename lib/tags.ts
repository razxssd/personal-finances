import type { TagKind } from "./db/schema";

export const PRESET_TAGS: Record<TagKind, string[]> = {
  investment: ["ETF", "Azioni", "Crypto", "Crypto-Meme"],
  liquidity: ["Cash", "Online Banking", "Benefits"],
  income: ["Stipendio", "Freelance", "Extra", "Rimborsi"],
  expense: [
    "Fixed costs",
    "Home",
    "Home Invoices",
    "Car expenses",
    "Eating Out",
    "Hang outs",
    "Treats",
    "Gifts",
    "Barber",
    "House Cleaning",
    "Girlfriend",
    "Breakfast or Coffee Offered",
    "Travel",
    "Health",
    "Taxes",
    "Work",
    "Personal Growing",
    "Investments",
    "Other",
  ],
};

const PALETTE = [
  "#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#06b6d4",
  "#ec4899", "#10b981", "#f97316", "#84cc16", "#14b8a6", "#0ea5e9",
  "#d946ef", "#eab308", "#f43f5e", "#3b82f6", "#8b5cf6", "#fb923c",
  "#facc15", "#34d399",
];

export function colorForTag(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) | 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function mergePresetWithCustom(kind: TagKind, custom: string[]): string[] {
  const presets = PRESET_TAGS[kind];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of [...presets, ...custom]) {
    const key = t.trim().toLowerCase();
    if (!seen.has(key) && t.trim()) {
      seen.add(key);
      out.push(t);
    }
  }
  return out;
}
