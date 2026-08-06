"use client";

import { useOnline } from "@/lib/network";

export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;

  return (
    <p
      className="border-b border-rule bg-slip px-3.5 py-2 text-center text-[11px] leading-snug text-short"
      role="status"
      aria-live="polite"
    >
      当前离线 · 已缓存页可浏览，刷新需网络
    </p>
  );
}
