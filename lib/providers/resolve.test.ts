import { afterEach, describe, expect, it, vi } from "vitest";
import {
  resolveCalendar,
  resolveLongShort,
  resolveNewsFlash,
  resolveOhlc,
} from "@/lib/providers/resolve";

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
    const openTime = 1_700_000_000_000;
    const rowTail = [
      "100",
      "110",
      "90",
      "105",
      "1",
      1_700_014_400_000,
    ] as const;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () =>
          Array.from({ length: 20 }, (_, i) => [
            openTime + i * 1000,
            ...rowTail,
          ]),
      })),
    );
    const { source, bars } = await resolveOhlc("BTC", 20);
    expect(source).toBe("live");
    expect(bars).toHaveLength(20);
    expect(bars[0].close).toBe(105);
  });
});

describe("resolveNewsFlash", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("uses mock when DATA_MODE is not live", async () => {
    vi.stubEnv("DATA_MODE", "mock");
    const { source, items } = await resolveNewsFlash({ limit: 5 });
    expect(source).toBe("mock");
    expect(items.length).toBeGreaterThan(0);
  });

  it("returns live when WSCN responds", async () => {
    vi.stubEnv("DATA_MODE", "live");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("wallstreetcn")) {
          return {
            ok: true,
            json: async () => ({
              code: 20000,
              data: {
                items: [
                  {
                    id: 99,
                    title: "测试快讯",
                    display_time: 1_700_000_000,
                    uri: "https://wallstreetcn.com/articles/99",
                    source_name: "华尔街见闻",
                  },
                ],
              },
            }),
          };
        }
        throw new Error(`unexpected fetch ${url}`);
      }),
    );
    const { source, items } = await resolveNewsFlash({ limit: 3 });
    expect(source).toBe("live");
    expect(items[0]?.title).toBe("测试快讯");
  });

  it("falls back to mock when WSCN and RSS both fail", async () => {
    vi.stubEnv("DATA_MODE", "live");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    const { source, items } = await resolveNewsFlash({ limit: 5 });
    expect(source).toBe("mock");
    expect(items.length).toBeGreaterThan(0);
  });
});

describe("resolveLongShort", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("uses mock when DATA_MODE is not live", async () => {
    vi.stubEnv("DATA_MODE", "mock");
    const { source, rows } = await resolveLongShort();
    expect(source).toBe("mock");
    expect(rows.length).toBeGreaterThan(0);
  });

  it("falls back to mock when Gate fetch fails", async () => {
    vi.stubEnv("DATA_MODE", "live");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    const { source, rows } = await resolveLongShort();
    expect(source).toBe("mock");
    expect(rows.length).toBeGreaterThan(0);
  });
});

describe("resolveCalendar", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("uses mock when DATA_MODE is not live", async () => {
    vi.stubEnv("DATA_MODE", "mock");
    const { source, events } = await resolveCalendar(7);
    expect(source).toBe("mock");
    expect(events.length).toBeGreaterThan(0);
  });

  it("falls back to mock+crypto when FF fetch fails", async () => {
    vi.stubEnv("DATA_MODE", "live");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    const { source, events } = await resolveCalendar(7);
    expect(source).toBe("mock");
    expect(events.some((e) => e.type === "解锁" || e.type === "上币")).toBe(
      true,
    );
  });
});
