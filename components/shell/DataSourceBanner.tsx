"use client";

type Props = {
  dataSource?: "live" | "mock";
  degraded?: boolean;
};

export function DataSourceBanner({ dataSource, degraded }: Props) {
  if (!dataSource || dataSource === "live") return null;

  const text = degraded
    ? "实时源暂不可用，已用缓存或备用数据。勿作交易依据。"
    : "演示数据 · 非实时行情。勿作交易依据。";

  return (
    <p
      className="mb-3 rounded-[length:var(--radius)] border border-rule bg-slip px-3 py-2 text-[11px] leading-snug text-mute"
      role="status"
    >
      {text}
    </p>
  );
}
