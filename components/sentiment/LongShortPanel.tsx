"use client";

import { useEffect, useState } from "react";
import type { FundingSummary, LongShortRow } from "@/lib/types";
import { DataSourceBanner } from "@/components/shell/DataSourceBanner";
import { Disclaimer } from "@/components/shell/Disclaimer";
import { EmptyState } from "@/components/shell/EmptyState";
import { networkErrorMessage } from "@/lib/network";

export function LongShortPanel() {
  const [rows, setRows] = useState<LongShortRow[]>([]);
  const [funding, setFunding] = useState<FundingSummary | null>(null);
  const [dataSource, setDataSource] = useState<"live" | "mock" | undefined>();
  const [degraded, setDegraded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    void fetch("/api/long-short")
      .then(async (res) => {
        if (!res.ok) throw new Error("fail");
        return res.json() as Promise<{
          rows: LongShortRow[];
          funding: FundingSummary;
          dataSource?: "live" | "mock";
          degraded?: boolean;
        }>;
      })
      .then((d) => {
        setRows(d.rows);
        setFunding(d.funding);
        setDataSource(d.dataSource);
        setDegraded(Boolean(d.degraded));
      })
      .catch(() =>
        setError(networkErrorMessage("多空比加载失败。数据源暂不可用。")),
      )
      .finally(() => setLoading(false));
  }, [retryTick]);

  return (
    <div className="space-y-4 pb-4 pt-3">
      <p className="text-sm text-mute">多空持仓人数比例</p>
      <DataSourceBanner dataSource={dataSource} degraded={degraded} />

      {loading ? (
        <p className="py-10 text-center text-sm text-mute">加载中...</p>
      ) : null}
      {error ? (
        <EmptyState
          title={error}
          detail="恢复网络后点重试。"
          actionLabel="重试"
          onAction={() => setRetryTick((n) => n + 1)}
          tone="short"
        />
      ) : null}
      {!loading && !error && rows.length === 0 ? (
        <EmptyState title="暂无多空数据" detail="稍后再试。" />
      ) : null}

      <ul className="panel divide-y divide-rule overflow-hidden">
        {rows.map((row) => (
          <li key={row.symbol} className="px-4 py-4">
            <div className="mb-2.5 flex items-end justify-between gap-2">
              <div>
                <div className="font-medium text-ink">{row.symbol}</div>
                <div className="text-xs text-mute">{row.name}</div>
              </div>
              <div className="font-data text-xs">
                <span className="text-long">多 {row.longPct.toFixed(1)}%</span>
                <span className="mx-2 text-mute">/</span>
                <span className="text-short">
                  空 {row.shortPct.toFixed(1)}%
                </span>
              </div>
            </div>
            <div
              className="flex h-2 overflow-hidden rounded-full bg-rule"
              aria-hidden
            >
              <div
                className="bg-long"
                style={{ width: `${row.longPct}%` }}
              />
              <div
                className="bg-short"
                style={{ width: `${row.shortPct}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      {funding ? (
        <p className="panel px-4 py-3 font-data text-sm text-ink">
          {funding.label}{" "}
          <span
            className={funding.ratePct >= 0 ? "text-long" : "text-short"}
          >
            {funding.ratePct >= 0 ? "+" : ""}
            {funding.ratePct.toFixed(4)}% ({funding.intervalHours}h)
          </span>
        </p>
      ) : null}

      <Disclaimer />
    </div>
  );
}
