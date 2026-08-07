"use client";

import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import type { LevelSnapshot, OhlcBar } from "@/lib/types";

type Props = {
  bars: OhlcBar[];
  levels: Pick<
    LevelSnapshot,
    "entryLow" | "entryHigh" | "takeProfit" | "stopLoss" | "sideBias"
  >;
};

function cssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
}

export function LevelsMiniChart({ bars, levels }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = hostRef.current;
    if (!el || bars.length < 2) return;

    const board = cssVar("--board", "#0B0F14");
    const mute = cssVar("--mute", "#8B97A8");
    const rule = cssVar("--rule", "#2A3340");
    const live = cssVar("--live", "#2DD4BF");
    const long = cssVar("--long", "#0ECB81");
    const short = cssVar("--short", "#F6465D");

    const chart: IChartApi = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: board },
        textColor: mute,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: rule, style: 3 },
        horzLines: { color: rule, style: 3 },
      },
      rightPriceScale: {
        borderColor: rule,
        scaleMargins: { top: 0.12, bottom: 0.08 },
      },
      timeScale: {
        borderColor: rule,
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: { color: mute, labelBackgroundColor: live },
        horzLine: { color: mute, labelBackgroundColor: live },
      },
    });

    const series: ISeriesApi<"Candlestick"> = chart.addSeries(CandlestickSeries, {
      upColor: long,
      downColor: short,
      borderUpColor: long,
      borderDownColor: short,
      wickUpColor: long,
      wickDownColor: short,
    });

    const data = bars.map((b) => ({
      time: Math.floor(new Date(b.time).getTime() / 1000) as UTCTimestamp,
      open: b.open,
      high: b.high,
      low: b.low,
      close: b.close,
    }));
    series.setData(data);

    series.createPriceLine({
      price: levels.entryLow,
      color: live,
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: "入场下",
    });
    series.createPriceLine({
      price: levels.entryHigh,
      color: live,
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: "入场上",
    });
    series.createPriceLine({
      price: levels.takeProfit,
      color: long,
      lineWidth: 1,
      lineStyle: 0,
      axisLabelVisible: true,
      title: "止盈",
    });
    series.createPriceLine({
      price: levels.stopLoss,
      color: short,
      lineWidth: 1,
      lineStyle: 0,
      axisLabelVisible: true,
      title: "止损",
    });

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, [bars, levels]);

  if (bars.length < 2) {
    return (
      <p className="px-4 py-6 text-center text-xs text-mute">K 线数据不足</p>
    );
  }

  return (
    <div className="px-2 pb-2 pt-3">
      <div className="mb-2 flex items-center justify-between px-2">
        <h2 className="text-sm font-medium text-ink">4h 参考 K 线</h2>
        <span className="text-[10px] text-mute">叠加入场 / 止盈 / 止损</span>
      </div>
      <div
        ref={hostRef}
        className="h-52 w-full overflow-hidden rounded-[length:var(--radius)]"
        role="img"
        aria-label="点位参考 K 线图"
      />
      <p className="mt-1.5 px-2 text-[10px] leading-snug text-mute">
        迷你图仅供理解点位相对位置，非完整交易终端。
      </p>
    </div>
  );
}
