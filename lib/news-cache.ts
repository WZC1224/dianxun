import type { NewsItem } from "@/lib/types";

const KEY = "dianxun.news-cache.v1";

type CacheShape = Record<string, NewsItem>;

function readAll(): CacheShape {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as CacheShape;
  } catch {
    return {};
  }
}

function writeAll(map: CacheShape) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* quota / private mode */
  }
}

export function putNewsItems(items: NewsItem[]) {
  if (items.length === 0) return;
  const map = readAll();
  for (const item of items) {
    map[item.id] = item;
  }
  writeAll(map);
}

export function getNewsItem(id: string): NewsItem | null {
  return readAll()[id] ?? null;
}
