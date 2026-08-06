"use client";

import { useEffect, useState } from "react";
import type { LevelSnapshot } from "@/lib/types";
import { LEVEL_SYMBOLS } from "@/lib/providers/mock-market";
import { DataSourceBanner } from "@/components/shell/DataSourceBanner";
import { Disclaimer } from "@/components/shell/Disclaimer";
import { EmptyState } from "@/components/shell/EmptyState";
import { networkErrorMessage } from "@/lib/network";
import {
  readWatchlist,
  toggleWatchlist,
  type LevelSymbol,
} from "@/lib/watchlist";

export function LevelsPanel() {
  const [watchlist, setWatchlist] = useState<LevelSymbol[]>(DEFAULT_WATCH);
  const [symbol, setSymbol] = useState<LevelSymbol>("BTC");
  const [data, setData] = useState<LevelSnapshot | null>(null);
  const [dataSource, setDataSource] = useState<"live" | "mock" | undefined>();
  const [degraded, setDegraded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    const list = readWatchlist();
    setWatchlist(list);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void fetch(`/api/levels/${symbol}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("fail");
        return res.json() as Promise<
          LevelSnapshot & {
            dataSource?: "live" | "mock";
            degraded?: boolean;
          }
        >;
      })
      .then((d) => {
        setData(d);
        setDataSource(d.dataSource);
        setDegraded(Boolean(d.degraded));
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(networkErrorMessage("点位加载失败。稍后重试。"));
        setLoading(false);
      });
    return () => controller.abort();
  }, [symbol, retryTick]);

  const starred = watchlist.includes(symbol);

  return (
    <div className="pb-4">
      <div className="sticky top-0 z-10 -mx-3.5 mb-3 border-b border-rule bg-board px-3.5 pt-1">
        <div className="flex w-full" role="tablist" aria-label="交易品种">
          {LEVEL_SYMBOLS.map((s) => {
            const active = s === symbol;
            const inWatch = watchlist.includes(s);
            return (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={active}
                className={`-mb-px min-w-0 flex-1 border-b-2 py-2.5 text-center text-sm transition-colors ${
                  active
                    ? "border-live font-semibold text-live"
                    : "border-transparent text-mute hover:text-ink"
                }`}
                onClick={() => setSymbol(s)}
              >
                <span className="inline-flex items-center justify-center gap-0.5">
                  {inWatch ? (
                    <span className="text-[10px] leading-none" aria-hidden>
                      ★
                    </span>
                  ) : null}
                  {s}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between py-2">
          <p className="text-[11px] text-mute">
            {starred ? "已在自选，首页胶带会显示" : "未自选"}
          </p>
          <button
            type="button"
            aria-pressed={starred}
            className={`rounded-[length:var(--radius)] px-2 py-1 text-xs transition-colors ${
              starred
                ? "bg-slip text-live"
                : "text-mute hover:bg-slip hover:text-ink"
            }`}
            onClick={() => setWatchlist(toggleWatchlist(symbol, watchlist))}
          >
            {starred ? "★ 取消自选" : "☆ 加入自选"}
          </button>
        </div>
      </div>

      <DataSourceBanner dataSource={dataSource} degraded={degraded} />

      {loading ? (
        <p className="py-10 text-center text-sm text-mute">计算中...</p>
      ) : null}
      {error ? (
        <EmptyState
          title={error}
          detail="切换品种或恢复网络后再试。"
          actionLabel="重试"
          onAction={() => setRetryTick((n) => n + 1)}
          tone="short"
        />
      ) : null}

      {data && !loading ? (
        <div className="panel space-y-0 divide-y divide-rule overflow-hidden">
          <Metric
            label={data.sideBias === "short" ? "卖出区间" : "买入区间"}
            value={`${fmt(data.entryLow)} – ${fmt(data.entryHigh)}`}
            tone={data.sideBias === "short" ? "short" : "long"}
          />
          <Metric label="止盈" value={fmt(data.takeProfit)} tone="ink" />
          <Metric label="止损" value={fmt(data.stopLoss)} tone="short" />

          <div className="px-4 py-4">
            <h2 className="text-sm font-medium text-ink">交易思路</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink">
              {data.note}
            </p>
            <p className="mt-2 font-data text-xs text-mute">
              {data.method} · 偏向{" "}
              {data.sideBias === "long"
                ? "多"
                : data.sideBias === "short"
                  ? "空"
                  : "中性"}
            </p>
          </div>
        </div>
      ) : null}

      <div className="pt-4">
        <Disclaimer full />
      </div>
    </div>
  );
}

const DEFAULT_WATCH: LevelSymbol[] = ["BTC", "ETH", "SOL"];

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "long" | "short" | "ink";
}) {
  const color =
    tone === "long"
      ? "text-long"
      : tone === "short"
        ? "text-short"
        : "text-ink";
  return (
    <div className="px-4 py-4">
      <div className={`text-xs font-medium tracking-wide ${color}`}>{label}</div>
      <div
        className={`font-data mt-1.5 text-[1.75rem] font-medium leading-none tracking-tight ${color}`}
      >
        {value}
        <span className="ml-2 text-sm font-normal text-mute"> USDT</span>
      </div>
    </div>
  );
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
}
