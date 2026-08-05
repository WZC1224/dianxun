"use client";

import { useCallback, useEffect, useState } from "react";
import type { NewsItem } from "@/lib/types";
import { formatClock, formatRelativeTime } from "@/lib/time";
import { Disclaimer } from "@/components/shell/Disclaimer";

type TapeItem = {
  symbol: string;
  entryHint: string;
  last: number;
  bias: "long" | "short" | "neutral";
};

export function FlashHome() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [tape, setTape] = useState<TapeItem[]>([]);
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
      };
      setItems((prev) => (append ? [...prev, ...data.items] : data.items));
      setCursor(data.nextCursor);
    } catch {
      setError("快讯加载失败。检查网络后重试。");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    void fetch("/api/levels/tape")
      .then((r) => r.json())
      .then((d: { items?: TapeItem[] }) => setTape(d.items ?? []))
      .catch(() => setTape([]));
  }, [load]);

  return (
    <div className="space-y-4">
      <header className="flex items-end gap-2 pt-2">
        <h1 className="font-display text-5xl tracking-tight text-ink">点讯</h1>
        <span
          className="live-dot mb-2 inline-block h-2 w-2 rounded-full bg-live"
          aria-label="实时"
        />
      </header>

      <section
        aria-label="主流币点位胶带"
        className="rounded-[length:var(--radius)] border border-rule bg-slip px-3 py-2"
      >
        <div className="grid grid-cols-3 gap-2">
          {tape.length === 0
            ? ["BTC", "ETH", "SOL"].map((s) => (
                <div key={s} className="text-xs text-mute">
                  {s} -
                </div>
              ))
            : tape.map((t) => (
                <div key={t.symbol} className="min-w-0">
                  <div className="text-xs font-medium text-ink">{t.symbol}</div>
                  <div className="font-data text-sm text-ink">
                    {formatPrice(t.last)}
                  </div>
                  <div
                    className={`truncate text-[11px] ${
                      t.bias === "long" ? "text-long" : "text-short"
                    }`}
                  >
                    {t.entryHint}
                  </div>
                </div>
              ))}
        </div>
      </section>

      <section aria-label="快讯">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink">快讯</h2>
          <button
            type="button"
            className="text-xs text-live"
            onClick={() => {
              setLoading(true);
              void load();
            }}
          >
            刷新
          </button>
        </div>

        {loading && items.length === 0 ? (
          <p className="py-8 text-center text-sm text-mute">加载中...</p>
        ) : null}
        {error ? (
          <p className="py-8 text-center text-sm text-short" role="alert">
            {error}
          </p>
        ) : null}
        {!loading && !error && items.length === 0 ? (
          <p className="py-8 text-center text-sm text-mute">
            暂无快讯。稍后再刷新。
          </p>
        ) : null}

        <ol className="relative space-y-0 border-l border-rule pl-4">
          {items.map((item, i) => (
            <li
              key={item.id}
              className="flash-row relative pb-5"
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-slip bg-live" />
              <div className="font-data text-xs text-live">
                {formatClock(item.publishedAt)}
              </div>
              <p className="mt-0.5 text-[15px] leading-snug text-ink">
                {item.title}
              </p>
              <p className="mt-1 text-xs text-mute">
                {item.source} · {formatRelativeTime(item.publishedAt)}
              </p>
            </li>
          ))}
        </ol>

        {cursor ? (
          <button
            type="button"
            className="mt-2 w-full rounded-[length:var(--radius)] border border-rule bg-slip py-2 text-sm text-ink"
            onClick={() => void load(cursor, true)}
          >
            加载更多
          </button>
        ) : null}
      </section>

      <Disclaimer />
    </div>
  );
}

function formatPrice(n: number): string {
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 1) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
}
