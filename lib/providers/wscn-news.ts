import type { NewsItem } from "@/lib/types";
import { ProviderError } from "@/lib/types";
import type { NewsProvider } from "@/lib/providers/news-types";

export const DEFAULT_WSCN_ARTICLES_URL =
  "https://api.wallstreetcn.com/apiv1/content/articles";

/** Browser-like UA — custom bot UA gets empty `data:""` from WSCN. */
const WSCN_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/** WSCN remote cursor looks like `1786069876,1786058443`. */
export function isWscnCursor(cursor: string): boolean {
  return /^[\d,]+$/.test(cursor);
}

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
  data?: { items?: WscnArticle[]; next_cursor?: string } | string | null;
};

export function parseWscnArticles(
  raw: unknown,
  sourceFallback: string,
): { items: NewsItem[]; nextCursor?: string } {
  const body = raw as WscnResponse;
  const data = body?.data;
  if (
    body?.code !== 20000 ||
    !data ||
    typeof data !== "object" ||
    !Array.isArray(data.items)
  ) {
    throw new ProviderError("WSCN payload invalid", "PARSE");
  }
  const items: NewsItem[] = [];
  for (const row of data.items) {
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
  const next =
    typeof data.next_cursor === "string" && data.next_cursor.trim()
      ? data.next_cursor.trim()
      : undefined;
  return { items, nextCursor: next };
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
    if (params.cursor !== undefined && !isWscnCursor(params.cursor)) {
      throw new ProviderError("bad cursor", "PARSE");
    }
    const qs = new URLSearchParams({
      channel: this.channel,
      limit: String(limit),
    });
    if (params.cursor) qs.set("cursor", params.cursor);
    const url = `${this.baseUrl}?${qs}`;
    let res: Response;
    try {
      res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": WSCN_UA,
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
    return parseWscnArticles(json, this.sourceLabel);
  }
}
