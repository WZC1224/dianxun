import type { NewsItem } from "@/lib/types";
import { ProviderError } from "@/lib/types";
import type { NewsProvider } from "@/lib/providers/news-types";

export const DEFAULT_WSCN_ARTICLES_URL =
  "https://api.wallstreetcn.com/apiv1/content/articles";

type WscnArticle = {
  id?: number | string;
  title?: string;
  content_short?: string;
  display_time?: number;
  uri?: string;
  source_name?: string;
  author?: { display_name?: string };
  symbols?: { name?: string }[] | string[];
};

type WscnResponse = {
  code?: number;
  data?: { items?: WscnArticle[] };
};

export function parseWscnArticles(
  raw: unknown,
  sourceFallback: string,
): NewsItem[] {
  const body = raw as WscnResponse;
  if (body?.code !== 20000 || !Array.isArray(body.data?.items)) {
    throw new ProviderError("WSCN payload invalid", "PARSE");
  }
  const items: NewsItem[] = [];
  for (const row of body.data.items) {
    if (!row?.title || row.id == null) continue;
    const ts = Number(row.display_time);
    if (!Number.isFinite(ts) || ts <= 0) continue;
    const symbols = Array.isArray(row.symbols)
      ? row.symbols
          .map((s) => (typeof s === "string" ? s : s?.name))
          .filter((s): s is string => Boolean(s))
      : undefined;
    items.push({
      id: `wscn-${row.id}`,
      title: row.title.trim(),
      summary: row.content_short?.trim() || undefined,
      source: row.source_name?.trim() || sourceFallback,
      url: row.uri,
      publishedAt: new Date(ts * 1000).toISOString(),
      symbols: symbols?.length ? symbols : undefined,
    });
  }
  if (items.length === 0) {
    throw new ProviderError("WSCN articles empty", "EMPTY");
  }
  return items;
}

export class WscnNewsProvider implements NewsProvider {
  constructor(
    private readonly baseUrl =
      process.env.NEWS_WSCN_URL?.replace(/\/$/, "") ||
      DEFAULT_WSCN_ARTICLES_URL,
    private readonly channel =
      process.env.NEWS_WSCN_CHANNEL?.trim() || "blockchain",
    private readonly sourceLabel =
      process.env.NEWS_SOURCE_LABEL?.trim() || "华尔街见闻",
  ) {}

  async listFlash(params: { limit: number; cursor?: string }) {
    const limit = Math.min(Math.max(params.limit, 1), 50);
    const start = params.cursor ? Number(params.cursor) : 0;
    if (!Number.isFinite(start) || start < 0) {
      throw new ProviderError("bad cursor", "PARSE");
    }
    // API page param is unreliable; pull a window then slice locally.
    const fetchLimit = Math.min(Math.max(start + limit, limit), 50);
    const url = `${this.baseUrl}?channel=${encodeURIComponent(this.channel)}&limit=${fetchLimit}`;
    let res: Response;
    try {
      res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "dianxun/0.1 (+https://github.com/WZC1224/dianxun)",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(12_000),
      });
    } catch {
      throw new ProviderError("WSCN fetch failed", "FETCH");
    }
    if (!res.ok) {
      throw new ProviderError(`WSCN HTTP ${res.status}`, "FETCH");
    }
    const json: unknown = await res.json();
    const all = parseWscnArticles(json, this.sourceLabel);
    const items = all.slice(start, start + limit);
    const next = start + items.length;
    return {
      items,
      nextCursor: next < all.length ? String(next) : undefined,
    };
  }
}
