import { LEVEL_SYMBOLS } from "@/lib/providers/mock-market";

export type LevelSymbol = (typeof LEVEL_SYMBOLS)[number];

export const WATCHLIST_KEY = "dianxun.watchlist.v1";
export const DEFAULT_WATCHLIST: LevelSymbol[] = ["BTC", "ETH", "SOL"];

function isLevelSymbol(s: string): s is LevelSymbol {
  return (LEVEL_SYMBOLS as readonly string[]).includes(s);
}

export function normalizeWatchlist(raw: unknown): LevelSymbol[] {
  if (!Array.isArray(raw)) return [...DEFAULT_WATCHLIST];
  const out: LevelSymbol[] = [];
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const up = item.toUpperCase();
    if (!isLevelSymbol(up)) continue;
    if (!out.includes(up)) out.push(up);
  }
  return out.length ? out : [...DEFAULT_WATCHLIST];
}

export function readWatchlist(): LevelSymbol[] {
  if (typeof window === "undefined") return [...DEFAULT_WATCHLIST];
  try {
    const raw = window.localStorage.getItem(WATCHLIST_KEY);
    if (!raw) return [...DEFAULT_WATCHLIST];
    return normalizeWatchlist(JSON.parse(raw) as unknown);
  } catch {
    return [...DEFAULT_WATCHLIST];
  }
}

export function writeWatchlist(symbols: LevelSymbol[]): LevelSymbol[] {
  const next = normalizeWatchlist(symbols);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
  }
  return next;
}

export function toggleWatchlist(
  symbol: LevelSymbol,
  current = readWatchlist(),
): LevelSymbol[] {
  const set = new Set(current);
  if (set.has(symbol)) {
    if (set.size <= 1) return current;
    set.delete(symbol);
  } else {
    set.add(symbol);
  }
  // Keep LEVEL_SYMBOLS order for stable tabs.
  const next = LEVEL_SYMBOLS.filter((s) => set.has(s));
  return writeWatchlist(next);
}

export function orderSymbolsByWatchlist(
  watchlist: LevelSymbol[],
): LevelSymbol[] {
  const starred = new Set(watchlist);
  return [
    ...LEVEL_SYMBOLS.filter((s) => starred.has(s)),
    ...LEVEL_SYMBOLS.filter((s) => !starred.has(s)),
  ];
}
