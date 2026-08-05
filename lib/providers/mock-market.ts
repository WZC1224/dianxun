import type { OhlcBar } from "@/lib/types";

const SEEDS: Record<string, number> = {
  BTC: 66800,
  ETH: 3560,
  SOL: 163,
  BNB: 620,
  XRP: 0.62,
};

/** Deterministic PRNG so mock OHLC/levels stay stable across requests. */
function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromSymbol(symbol: string): number {
  let h = 2166136261;
  for (let i = 0; i < symbol.length; i++) {
    h ^= symbol.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mockOhlc(symbol: string, count = 40): OhlcBar[] {
  const base = SEEDS[symbol] ?? 100;
  const rand = mulberry32(seedFromSymbol(symbol));
  const bars: OhlcBar[] = [];
  let price = base;
  const start = Date.UTC(2026, 0, 1);
  for (let i = 0; i < count; i++) {
    const drift =
      Math.sin(i / 3) * base * 0.004 + (rand() - 0.48) * base * 0.008;
    const open = price;
    const close = Math.max(base * 0.5, open + drift);
    const high = Math.max(open, close) * (1 + rand() * 0.004);
    const low = Math.min(open, close) * (1 - rand() * 0.004);
    bars.push({
      open,
      high,
      low,
      close,
      time: new Date(start + i * 4 * 3600_000).toISOString(),
    });
    price = close;
  }
  return bars;
}

export const LEVEL_SYMBOLS = ["BTC", "ETH", "SOL", "BNB", "XRP"] as const;
