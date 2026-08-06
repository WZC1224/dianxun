"use client";

import { useCallback, useEffect, useState } from "react";
import type { NewsItem } from "@/lib/types";
import { formatClock, formatRelativeTime } from "@/lib/time";
import { DataSourceBanner } from "@/components/shell/DataSourceBanner";
import { Disclaimer } from "@/components/shell/Disclaimer";
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

export function FlashHome() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [tape, setTape] = useState<TapeItem[]>([]);
  const [newsSource, setNewsSource] = useState<SourceState>({});
  const [tapeSource, setTapeSource] = useState<SourceState>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (next?: string, append = false) => {
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
      setItems((prev) => (append ? [...prev, ...data.items] : data.items));
      setCursor(data.nextCursor);
      if (!append) {
        setNewsSource({
          dataSource: data.dataSource,
          degraded: data.degraded,
        });
      }
    } catch {
      setError("快讯加载失败。检查网络后重试。");
    } finally {
      setLoading(false);
    }
  }, []);

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
          <p className="py-10 text-center text-sm text-short" role="alert">
            {error}
          </p>
        ) : null}
        {!loading && !error && items.length === 0 ? (
          <p className="py-10 text-center text-sm text-mute">
            暂无快讯。稍后再刷新。
          </p>
        ) : null}

        <ol className="panel divide-y divide-rule overflow-hidden">
          {items.map((item, i) => (
            <li
              key={item.id}
              className="flash-row px-3 py-3.5"
              style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
            >
              <div className="flex gap-3">
                <time className="font-data w-12 shrink-0 pt-0.5 text-[11px] text-live">
                  {formatClock(item.publishedAt)}
                </time>
                <div className="min-w-0 flex-1">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[15px] leading-snug text-ink hover:text-live"
                    >
                      {item.title}
                    </a>
                  ) : (
                    <p className="text-[15px] leading-snug text-ink">
                      {item.title}
                    </p>
                  )}
                  <p className="mt-1.5 text-[11px] text-mute">
                    {item.source} · {formatRelativeTime(item.publishedAt)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        {cursor ? (
          <button
            type="button"
            className="panel mt-3 w-full py-2.5 text-sm text-mute transition-colors hover:text-ink"
            onClick={() => void load(cursor, true)}
          >
            加载更多
          </button>
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
