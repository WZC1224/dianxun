"use client";

import { useEffect, useState } from "react";
import type { LevelSnapshot } from "@/lib/types";
import { LEVEL_SYMBOLS } from "@/lib/providers/mock-market";
import { Disclaimer } from "@/components/shell/Disclaimer";

export function LevelsPanel() {
  const [symbol, setSymbol] = useState<(typeof LEVEL_SYMBOLS)[number]>("BTC");
  const [data, setData] = useState<LevelSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetch(`/api/levels/${symbol}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("fail");
        return res.json() as Promise<LevelSnapshot>;
      })
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setError("点位加载失败。稍后重试。");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [symbol]);

  return (
    <div className="pb-4">
      <div
        className="sticky top-0 z-10 -mx-3.5 mb-4 border-b border-rule bg-board px-3.5 pt-3"
        role="tablist"
      >
        <div className="flex gap-1">
          {LEVEL_SYMBOLS.map((s) => {
            const active = s === symbol;
            return (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={active}
                className={`-mb-px px-3 pb-2.5 text-sm transition-colors ${
                  active
                    ? "border-b-2 border-live font-semibold text-live"
                    : "text-mute hover:text-ink"
                }`}
                onClick={() => setSymbol(s)}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-mute">计算中...</p>
      ) : null}
      {error ? (
        <p className="py-10 text-center text-sm text-short" role="alert">
          {error}
        </p>
      ) : null}

      {data && !loading ? (
        <div className="panel space-y-0 divide-y divide-rule overflow-hidden">
          <Metric
            label={data.sideBias === "short" ? "卖出区间" : "买入区间"}
            value={`${fmt(data.entryLow)} - ${fmt(data.entryHigh)}`}
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
        <span className="ml-2 text-sm font-normal text-mute">USDT</span>
      </div>
    </div>
  );
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
}
