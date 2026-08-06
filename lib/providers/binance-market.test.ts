import { describe, expect, it } from "vitest";
import { parseBinanceKlines } from "@/lib/providers/binance-market";

describe("parseBinanceKlines", () => {
  it("maps open/high/low/close/time", () => {
    const bars = parseBinanceKlines([
      [
        1_700_000_000_000,
        "100",
        "110",
        "90",
        "105",
        "1",
        1_700_014_400_000,
      ],
    ]);
    expect(bars).toHaveLength(1);
    expect(bars[0]).toMatchObject({
      open: 100,
      high: 110,
      low: 90,
      close: 105,
    });
    expect(bars[0].time).toBe(new Date(1_700_000_000_000).toISOString());
  });

  it("rejects empty payload", () => {
    expect(() => parseBinanceKlines([])).toThrow(/empty/i);
  });
});
