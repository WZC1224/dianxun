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
    <div className="space-y-5">
      <header>
        <p className="font-display text-lg text-live">点讯</p>
        <h1 className="text-2xl font-semibold text-ink">交易点位</h1>
      </header>

      <div className="flex gap-4 border-b border-rule" role="tablist">
        {LEVEL_SYMBOLS.map((s) => {
          const active = s === symbol;
          return (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={active}
              className={`pb-2 text-sm transition-colors ${
                active
                  ? "border-b-2 border-live font-semibold text-live"
                  : "text-mute"
              }`}
              onClick={() => setSymbol(s)}
            >
              {s}
            </button>
          );
        })}
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
        <div className="space-y-6">
          <Metric
            label={data.sideBias === "short" ? "卖出区间" : "买入区间"}
            value={`${fmt(data.entryLow)} - ${fmt(data.entryHigh)}`}
            tone={data.sideBias === "short" ? "short" : "long"}
          />
          <Metric label="止盈" value={fmt(data.takeProfit)} tone="live" />
          <Metric label="止损" value={fmt(data.stopLoss)} tone="short" />

          <div className="border-t border-dashed border-rule pt-4">
            <h2 className="text-sm font-medium text-ink">交易思路</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink">{data.note}</p>
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

      <Disclaimer full />
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
  tone: "long" | "short" | "live";
}) {
  const color =
    tone === "long"
      ? "text-long"
      : tone === "short"
        ? "text-short"
        : "text-live";
  return (
    <div className="border-b border-dashed border-rule pb-4">
      <div className={`text-sm ${color}`}>{label}</div>
      <div className={`font-data mt-1 text-3xl font-medium tracking-tight ${color}`}>
        {value}
        <span className="ml-2 text-sm font-normal text-mute">USDT</span>
      </div>
    </div>
  );
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
}
