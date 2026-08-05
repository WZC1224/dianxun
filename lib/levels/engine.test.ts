import { describe, expect, it } from "vitest";
import { atr, computeLevels } from "@/lib/levels/engine";
import type { OhlcBar } from "@/lib/types";

function bars(n: number, base = 100): OhlcBar[] {
  const out: OhlcBar[] = [];
  let p = base;
  for (let i = 0; i < n; i++) {
    const open = p;
    const close = p + (i % 2 === 0 ? 1.5 : -1);
    out.push({
      open,
      high: Math.max(open, close) + 0.5,
      low: Math.min(open, close) - 0.5,
      close,
      time: new Date(Date.UTC(2026, 0, i + 1)).toISOString(),
    });
    p = close;
  }
  return out;
}

describe("atr", () => {
  it("returns positive value for trending series", () => {
    expect(atr(bars(20))).toBeGreaterThan(0);
  });
});

describe("computeLevels", () => {
  it("returns entry band stop and take profit", () => {
    const level = computeLevels("BTC", bars(30, 66000), "2026-08-05T00:00:00.000Z");
    expect(level.symbol).toBe("BTC");
    expect(level.entryHigh).toBeGreaterThan(level.entryLow);
    expect(level.takeProfit).not.toBe(level.stopLoss);
    expect(level.method).toContain("ATR");
  });

  it("throws when bars insufficient", () => {
    expect(() => computeLevels("ETH", bars(3))).toThrow(/insufficient/);
  });

  it("is deterministic for same bars", () => {
    const input = bars(30, 50000);
    const a = computeLevels("SOL", input, "2026-08-05T00:00:00.000Z");
    const b = computeLevels("SOL", input, "2026-08-05T00:00:00.000Z");
    expect(a).toEqual(b);
  });
});
