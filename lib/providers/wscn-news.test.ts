import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isWscnCursor,
  parseWscnArticles,
  WscnNewsProvider,
} from "@/lib/providers/wscn-news";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("parseWscnArticles", () => {
  it("maps title source time and url", () => {
    const { items, nextCursor } = parseWscnArticles(
      {
        code: 20000,
        data: {
          items: [
            {
              id: 1,
              title: "比特币突破关键阻力",
              content_short: "摘要",
              display_time: 1_700_000_000,
              uri: "https://wallstreetcn.com/articles/1",
              source_name: "华尔街见闻",
              symbols: [{ name: "BTC" }],
            },
          ],
          next_cursor: "1,2",
        },
      },
      "华尔街见闻",
    );
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: "wscn-1",
      title: "比特币突破关键阻力",
      source: "华尔街见闻",
      url: "https://wallstreetcn.com/articles/1",
      symbols: ["BTC"],
    });
    expect(items[0].publishedAt).toBe(
      new Date(1_700_000_000 * 1000).toISOString(),
    );
    expect(nextCursor).toBe("1,2");
  });

  it("rejects empty data string from blocked UA", () => {
    expect(() =>
      parseWscnArticles({ code: 20000, message: "OK", data: "" }, "x"),
    ).toThrow(/invalid/i);
  });

  it("rejects bad code", () => {
    expect(() =>
      parseWscnArticles({ code: 500, data: { items: [] } }, "x"),
    ).toThrow(/invalid/i);
  });
});

describe("isWscnCursor", () => {
  it("accepts offset and remote cursors", () => {
    expect(isWscnCursor("10")).toBe(true);
    expect(isWscnCursor("1786069876,1786058443")).toBe(true);
    expect(isWscnCursor("abc")).toBe(false);
  });
});

describe("WscnNewsProvider.listFlash", () => {
  it("passes limit/cursor and returns remote nextCursor", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      expect(url).toContain("limit=10");
      expect(url).toContain("cursor=1%2C2");
      return {
        ok: true,
        json: async () => ({
          code: 20000,
          data: {
            items: [
              {
                id: 11,
                title: "第二页",
                display_time: 1_700_000_100,
                uri: "https://wallstreetcn.com/articles/11",
                source_name: "华尔街见闻",
              },
            ],
            next_cursor: "3,4",
          },
        }),
      };
    });
    vi.stubGlobal("fetch", fetchMock);
    const provider = new WscnNewsProvider(
      "https://example.test/articles",
      "blockchain",
      "华尔街见闻",
    );
    const page = await provider.listFlash({ limit: 10, cursor: "1,2" });
    expect(page.items[0]?.title).toBe("第二页");
    expect(page.nextCursor).toBe("3,4");
    const headers = (fetchMock.mock.calls[0]?.[1] as RequestInit)?.headers as
      | Record<string, string>
      | undefined;
    expect(headers?.["User-Agent"]).toMatch(/Mozilla/);
  });
});
