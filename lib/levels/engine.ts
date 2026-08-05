import type { OhlcBar, LevelSnapshot } from "@/lib/types";

/** ATR(14) Wilder-ish simple average of true ranges. */
export function atr(bars: OhlcBar[], period = 14): number {
  if (bars.length < 2) return 0;
  const trs: number[] = [];
  for (let i = 1; i < bars.length; i++) {
    const cur = bars[i];
    const prev = bars[i - 1];
    const tr = Math.max(
      cur.high - cur.low,
      Math.abs(cur.high - prev.close),
      Math.abs(cur.low - prev.close),
    );
    trs.push(tr);
  }
  const slice = trs.slice(-period);
  if (slice.length === 0) return 0;
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

/**
 * v1 levels: recent high/low band as entry zone;
 * stop = entryLow - ATR*mult (long bias) or entryHigh + ATR*mult (short);
 * TP opposite side of ATR*tpMult.
 */
export function computeLevels(
  symbol: string,
  bars: OhlcBar[],
  now = new Date().toISOString(),
): LevelSnapshot {
  if (bars.length < 5) {
    throw new Error(`insufficient bars for ${symbol}`);
  }

  const window = bars.slice(-20);
  const last = window[window.length - 1];
  const highs = window.map((b) => b.high);
  const lows = window.map((b) => b.low);
  const recentHigh = Math.max(...highs);
  const recentLow = Math.min(...lows);
  const mid = (recentHigh + recentLow) / 2;
  const a = atr(window, 14) || (recentHigh - recentLow) / 14;

  const longBias = last.close >= mid;
  const band = Math.max(a * 0.35, (recentHigh - recentLow) * 0.08);
  const entryLow = round(mid - band);
  const entryHigh = round(mid + band);

  const stopLoss = longBias
    ? round(entryLow - a * 1.2)
    : round(entryHigh + a * 1.2);
  const takeProfit = longBias
    ? round(entryHigh + a * 2.0)
    : round(entryLow - a * 2.0);

  return {
    symbol,
    sideBias: longBias ? "long" : "short",
    entryLow,
    entryHigh,
    takeProfit,
    stopLoss,
    updatedAt: now,
    method: "支撑阻力带 + ATR(14) v1",
    note: longBias
      ? "回调至买入区间内分批布局多单，价格向上反弹时逐步止盈，跌破止损位则离场观望。"
      : "反弹至卖出区间内分批布局空单，价格向下延续时逐步止盈，突破止损位则离场观望。",
  };
}

function round(n: number): number {
  if (n >= 1000) return Math.round(n);
  if (n >= 100) return Math.round(n * 10) / 10;
  return Math.round(n * 100) / 100;
}
