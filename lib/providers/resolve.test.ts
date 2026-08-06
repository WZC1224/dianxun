import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveOhlc } from "@/lib/providers/resolve";

describe("resolveOhlc", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("uses mock when DATA_MODE is not live", async () => {
    vi.stubEnv("DATA_MODE", "mock");
    const { source, bars } = await resolveOhlc("BTC");
    expect(source).toBe("mock");
    expect(bars.length).toBeGreaterThan(5);
  });

  it("falls back to mock when live fetch fails", async () => {
    vi.stubEnv("DATA_MODE", "live");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    const { source, bars } = await resolveOhlc("BTC");
    expect(source).toBe("mock");
    expect(bars.length).toBeGreaterThan(5);
  });

  it("returns live bars when Binance responds", async () => {
    vi.stubEnv("DATA_MODE", "live");
    const row = [
      1_700_000_000_000,
      "100",
      "110",
      "90",
      "105",
      "1",
      1_700_014_400_000,
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => Array.from({ length: 20 }, (_, i) => [
          row[0] + i * 1000,
          ...row.slice(1),
        ]),
      })),
    );
    const { source, bars } = await resolveOhlc("BTC", 20);
    expect(source).toBe("live");
    expect(bars).toHaveLength(20);
    expect(bars[0].close).toBe(105);
  });
});
