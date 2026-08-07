"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { NewsItem } from "@/lib/types";
import { formatClock, formatRelativeTime } from "@/lib/time";
import { putNewsItems } from "@/lib/news-cache";
import { DataSourceBanner } from "@/components/shell/DataSourceBanner";
import { Disclaimer } from "@/components/shell/Disclaimer";
import { EmptyState } from "@/components/shell/EmptyState";
import { networkErrorMessage } from "@/lib/network";
import { readWatchlist } from "@/lib/watchlist";

type TapeItem = {
  symbol: string;
  entryHint: string;
  last: number;
  bias: "long" | "short" | "neutral";
};

type SourceState = {
  dataSource?: "live" | "mock";
  degraded?: boolean;
};

const LOAD_MORE_DELAY_MS = 2000;

export function FlashHome() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [tape, setTape] = useState<TapeItem[]>([]);
  const [newsSource, setNewsSource] = useState<SourceState>({});
  const [tapeSource, setTapeSource] = useState<SourceState>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<string | undefined>(undefined);
  const loadingMoreRef = useRef(false);
  const loadMoreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (next?: string, append = false) => {
    if (append) {
      if (loadingMoreRef.current || !next) return;
      loadingMoreRef.current = true;
      setLoadingMore(true);
    } else {
      if (loadMoreTimerRef.current) {
        clearTimeout(loadMoreTimerRef.current);
        loadMoreTimerRef.current = null;
      }
      setLoading(true);
    }
    setError(null);
    try {
      const qs = new URLSearchParams({ limit: "10" });
      if (next) qs.set("cursor", next);
      const res = await fetch(`/api/news?${qs}`);
      if (!res.ok) throw new Error("fail");
      const data = (await res.json()) as {
        items: NewsItem[];
        nextCursor?: string;
        dataSource?: "live" | "mock";
        degraded?: boolean;
      };
      putNewsItems(data.items);
      setItems((prev) => (append ? [...prev, ...data.items] : data.items));
      cursorRef.current = data.nextCursor;
      setCursor(data.nextCursor);
      if (!append) {
        setNewsSource({
          dataSource: data.dataSource,
          degraded: data.degraded,
        });
      }
    } catch {
      if (!append) {
        setError(networkErrorMessage("快讯加载失败。检查网络后重试。"));
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, []);

  const tryLoadMore = useCallback(() => {
    const next = cursorRef.current;
    if (!next || loadingMoreRef.current || loadMoreTimerRef.current) return;
    setLoadingMore(true);
    loadMoreTimerRef.current = setTimeout(() => {
      loadMoreTimerRef.current = null;
      void load(next, true);
    }, LOAD_MORE_DELAY_MS);
  }, [load]);

  const loadTape = useCallback(() => {
    const watch = readWatchlist().slice(0, 3);
    const qs = new URLSearchParams({ symbols: watch.join(",") });
    void fetch(`/api/levels/tape?${qs}`)
      .then((r) => r.json())
      .then(
        (d: {
          items?: TapeItem[];
          dataSource?: "live" | "mock";
          degraded?: boolean;
        }) => {
          setTape(d.items ?? []);
          setTapeSource({
            dataSource: d.dataSource,
            degraded: d.degraded,
          });
        },
      )
      .catch(() => setTape([]));
  }, []);

  useEffect(() => {
    void load();
    loadTape();
    const onFocus = () => loadTape();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load, loadTape]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const root =
      (node.closest("main") as HTMLElement | null) ??
      (document.querySelector("main") as HTMLElement | null);

    const nearBottom = () => {
      if (!root) return false;
      return root.scrollTop + root.clientHeight >= root.scrollHeight - 160;
    };

    const onScroll = () => {
      if (nearBottom()) tryLoadMore();
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) tryLoadMore();
      },
      { root, rootMargin: "160px 0px", threshold: 0 },
    );
    io.observe(node);
    root?.addEventListener("scroll", onScroll, { passive: true });
    // First paint may already put sentinel in view (short list).
    if (nearBottom() || (root && root.scrollHeight <= root.clientHeight + 8)) {
      tryLoadMore();
    }

    return () => {
      io.disconnect();
      root?.removeEventListener("scroll", onScroll);
      if (loadMoreTimerRef.current) {
        clearTimeout(loadMoreTimerRef.current);
        loadMoreTimerRef.current = null;
      }
    };
  }, [tryLoadMore, items.length, cursor]);

  return (
    <div className="flex min-h-full flex-col">
      <section
        aria-label="自选点位胶带"
        className="sticky top-0 z-10 -mx-3.5 border-b border-rule bg-board px-3.5 py-2.5"
      >
        <div className="panel px-3 py-2.5">
          <div className="flex items-stretch gap-3">
            <div className="flex flex-col items-center justify-center gap-1 border-r border-rule pr-3">
              <span
                className="live-dot inline-block h-2 w-2 rounded-full bg-live"
                aria-label="实时"
              />
              <span className="font-data text-[9px] text-mute">自选</span>
            </div>
            <div className="grid min-w-0 flex-1 grid-cols-3 gap-3">
              {tape.length === 0
                ? ["BTC", "ETH", "SOL"].map((s) => (
                    <div key={s} className="text-xs text-mute">
                      {s} -
                    </div>
                  ))
                : tape.map((t) => (
                    <div key={t.symbol} className="min-w-0">
                      <div className="text-[11px] font-medium text-mute">
                        {t.symbol}
                      </div>
                      <div
                        className={`font-data mt-0.5 text-[15px] leading-none ${
                          t.bias === "long"
                            ? "text-long"
                            : t.bias === "short"
                              ? "text-short"
                              : "text-ink"
                        }`}
                      >
                        {formatPrice(t.last)}
                      </div>
                      <div
                        className={`mt-1 truncate text-[10px] leading-tight ${
                          t.bias === "long"
                            ? "text-long"
                            : t.bias === "short"
                              ? "text-short"
                              : "text-mute"
                        }`}
                      >
                        {t.entryHint}
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </section>

      <section aria-label="快讯" className="flex-1 py-3">
        <DataSourceBanner
          dataSource={
            newsSource.dataSource === "mock" || tapeSource.dataSource === "mock"
              ? "mock"
              : newsSource.dataSource ?? tapeSource.dataSource
          }
          degraded={Boolean(newsSource.degraded || tapeSource.degraded)}
        />
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">最新动态</h2>
          <button
            type="button"
            className="rounded-[length:var(--radius)] px-2 py-1 text-xs text-live transition-colors hover:bg-slip"
            onClick={() => {
              setLoading(true);
              void load();
            }}
          >
            刷新
          </button>
        </div>

        {loading && items.length === 0 ? (
          <p className="py-10 text-center text-sm text-mute">加载中...</p>
        ) : null}
        {error ? (
          <EmptyState
            title={error}
            detail="可先浏览已打开内容；网络恢复后再刷新。"
            actionLabel="重试"
            onAction={() => {
              setLoading(true);
              void load();
            }}
            tone="short"
          />
        ) : null}
        {!loading && !error && items.length === 0 ? (
          <EmptyState
            title="暂无快讯"
            detail="稍后再刷新，或检查数据源是否可用。"
            actionLabel="刷新"
            onAction={() => {
              setLoading(true);
              void load();
            }}
          />
        ) : null}

        <ol className="panel divide-y divide-rule overflow-hidden">
          {items.map((item, i) => (
            <li
              key={item.id}
              className="flash-row"
              style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
            >
              <Link
                href={`/news/${encodeURIComponent(item.id)}`}
                className="flex gap-3 px-3 py-3.5 transition-colors hover:bg-slip"
              >
                <time className="font-data w-12 shrink-0 pt-0.5 text-[11px] text-live">
                  {formatClock(item.publishedAt)}
                </time>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] leading-snug text-ink">
                    {item.title}
                  </p>
                  <p className="mt-1.5 text-[11px] text-mute">
                    {item.source} · {formatRelativeTime(item.publishedAt)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>

        <div ref={sentinelRef} className="h-1 w-full" aria-hidden />
        {loadingMore ? (
          <p className="mt-3 py-2 text-center text-sm text-mute">加载更多...</p>
        ) : null}
        {!loading && !loadingMore && items.length > 0 && !cursor ? (
          <p className="mt-3 py-2 text-center text-xs text-mute">已加载全部</p>
        ) : null}

        <div className="pb-4 pt-3">
          <Disclaimer />
        </div>
      </section>
    </div>
  );
}

function formatPrice(n: number): string {
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 1) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
}
