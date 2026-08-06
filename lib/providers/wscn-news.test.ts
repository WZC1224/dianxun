import { describe, expect, it } from "vitest";
import { parseWscnArticles } from "@/lib/providers/wscn-news";

describe("parseWscnArticles", () => {
  it("maps title source time and url", () => {
    const items = parseWscnArticles(
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
  });

  it("rejects bad code", () => {
    expect(() =>
      parseWscnArticles({ code: 500, data: { items: [] } }, "x"),
    ).toThrow(/invalid/i);
  });
});
