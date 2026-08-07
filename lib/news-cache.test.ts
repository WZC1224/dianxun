/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from "vitest";
import { getNewsItem, putNewsItems } from "@/lib/news-cache";
import type { NewsItem } from "@/lib/types";

const sample: NewsItem = {
  id: "news-0",
  title: "测试标题",
  summary: "测试摘要",
  source: "律动",
  publishedAt: "2026-08-07T01:00:00.000Z",
};

describe("news-cache", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("stores and reads items by id", () => {
    putNewsItems([sample]);
    expect(getNewsItem("news-0")?.title).toBe("测试标题");
    expect(getNewsItem("missing")).toBeNull();
  });
});
