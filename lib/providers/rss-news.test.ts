import { describe, expect, it } from "vitest";
import { parseRssItems } from "@/lib/providers/rss-news";

const FIXTURE = `<?xml version="1.0"?>
<rss><channel>
<item>
  <title><![CDATA[Bitcoin hits new range]]></title>
  <link>https://example.com/a</link>
  <pubDate>Wed, 05 Aug 2026 12:00:00 GMT</pubDate>
  <description><![CDATA[Summary &amp; more]]></description>
</item>
<item>
  <title>Second story</title>
  <link>https://example.com/b</link>
  <pubDate>Wed, 05 Aug 2026 11:00:00 GMT</pubDate>
</item>
</channel></rss>`;

describe("parseRssItems", () => {
  it("parses titles links and entities", () => {
    const items = parseRssItems(FIXTURE, "Cointelegraph");
    expect(items).toHaveLength(2);
    expect(items[0].title).toBe("Bitcoin hits new range");
    expect(items[0].url).toBe("https://example.com/a");
    expect(items[0].summary).toContain("Summary & more");
    expect(items[0].source).toBe("Cointelegraph");
    expect(items[0].id).toMatch(/^rss-/);
  });
});
