"use client";

import { useEffect, useState } from "react";
import type { FundingSummary, LongShortRow } from "@/lib/types";
import { Disclaimer } from "@/components/shell/Disclaimer";

export function LongShortPanel() {
  const [rows, setRows] = useState<LongShortRow[]>([]);
  const [funding, setFunding] = useState<FundingSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/long-short")
      .then(async (res) => {
        if (!res.ok) throw new Error("fail");
        return res.json() as Promise<{
          rows: LongShortRow[];
          funding: FundingSummary;
        }>;
      })
      .then((d) => {
        setRows(d.rows);
        setFunding(d.funding);
      })
      .catch(() => setError("多空比加载失败。数据源暂不可用。"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <header>
        <p className="font-display text-lg text-live">点讯</p>
        <h1 className="text-2xl font-semibold text-ink">多空比</h1>
        <p className="mt-1 text-sm text-mute">多空持仓人数比例</p>
      </header>

      {loading ? (
        <p className="py-10 text-center text-sm text-mute">加载中...</p>
      ) : null}
      {error ? (
        <p className="py-10 text-center text-sm text-short" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="divide-y divide-rule border-y border-rule">
        {rows.map((row) => (
          <li key={row.symbol} className="py-4">
            <div className="mb-2 flex items-end justify-between gap-2">
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
              className="flex h-2 overflow-hidden rounded-[length:var(--radius)] bg-rule"
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
        <p className="font-data text-sm text-ink">
          {funding.label}{" "}
          <span className="text-long">
            {funding.ratePct >= 0 ? "+" : ""}
            {funding.ratePct.toFixed(4)}% ({funding.intervalHours}h)
          </span>
        </p>
      ) : null}

      <Disclaimer />
    </div>
  );
}
