import { createHash } from "node:crypto";
import type { NewsItem } from "@/lib/types";
import { ProviderError } from "@/lib/types";
import type { NewsProvider } from "@/lib/providers/news-types";

export const DEFAULT_NEWS_RSS_URL = "https://cointelegraph.com/rss";

function stripCdata(s: string): string {
  return s.replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/, "$1").trim();
}

function tagText(block: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = block.match(re);
  if (!m) return undefined;
  // CDATA first — otherwise `<![CDATA[...]]>` looks like a tag and gets wiped.
  const inner = stripCdata(m[1].trim());
  return inner.replace(/<[^>]+>/g, "").trim() || undefined;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function parseRssItems(xml: string, sourceFallback: string): NewsItem[] {
  const chunks = xml
    .split(/<item[\s>]/i)
    .slice(1)
    .map((part) => {
      const end = part.search(/<\/item>/i);
      return end >= 0 ? part.slice(0, end) : part;
    })
    .filter(Boolean);
  const items: NewsItem[] = [];
  for (const chunk of chunks) {
    const title = tagText(chunk, "title");
    if (!title) continue;
    const link = tagText(chunk, "link") ?? tagText(chunk, "guid");
    const pub = tagText(chunk, "pubDate");
    const desc = tagText(chunk, "description");
    const source =
      tagText(chunk, "source") ??
      tagText(chunk, "dc:creator") ??
      sourceFallback;
    const parsed = pub ? new Date(pub) : new Date();
    if (Number.isNaN(parsed.getTime())) continue;
    const publishedAt = parsed.toISOString();
    const idSeed = link || `${title}-${publishedAt}`;
    const id = createHash("sha1").update(idSeed).digest("hex").slice(0, 16);
    items.push({
      id: `rss-${id}`,
      title: decodeEntities(title),
      summary: desc ? decodeEntities(desc).slice(0, 280) : undefined,
      source: decodeEntities(source),
      url: link,
      publishedAt,
    });
  }
  if (items.length === 0) {
    throw new ProviderError("RSS items empty", "EMPTY");
  }
  return items;
}

export class RssNewsProvider implements NewsProvider {
  constructor(
    private readonly feedUrl =
      process.env.NEWS_RSS_URL?.trim() || DEFAULT_NEWS_RSS_URL,
    private readonly sourceLabel =
      process.env.NEWS_SOURCE_LABEL?.trim() || "Cointelegraph",
  ) {}

  async listFlash(params: { limit: number; cursor?: string }) {
    let xml: string;
    try {
      const res = await fetch(this.feedUrl, {
        headers: {
          Accept: "application/rss+xml, application/xml, text/xml, */*",
          "User-Agent": "dianxun/0.1 (+https://github.com/WZC1224/dianxun)",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(12_000),
      });
      if (!res.ok) {
        throw new ProviderError(`RSS HTTP ${res.status}`, "FETCH");
      }
      xml = await res.text();
    } catch (e) {
      if (e instanceof ProviderError) throw e;
      throw new ProviderError("RSS fetch failed", "FETCH");
    }

    const all = parseRssItems(xml, this.sourceLabel);
    const start = params.cursor ? Number(params.cursor) : 0;
    if (!Number.isFinite(start) || start < 0) {
      throw new ProviderError("bad cursor", "PARSE");
    }
    const limit = Math.min(Math.max(params.limit, 1), 50);
    const items = all.slice(start, start + limit);
    const next = start + items.length;
    return {
      items,
      nextCursor: next < all.length ? String(next) : undefined,
    };
  }
}
