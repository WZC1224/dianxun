"use client";

import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/": "快讯",
  "/levels": "交易点位",
  "/long-short": "多空比",
  "/calendar": "大事日历",
};

export function TopBar() {
  const pathname = usePathname();
  const title =
    Object.entries(TITLES).find(([href]) =>
      href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(`${href}/`),
    )?.[1] ?? "点讯";

  return (
    <header
      className="shrink-0 border-b border-rule bg-slip"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="flex h-12 items-center justify-between gap-3 px-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="live-dot h-1.5 w-1.5 shrink-0 rounded-full bg-live"
            aria-hidden
          />
          <p className="font-display text-lg leading-none text-ink">点讯</p>
          <span className="h-3 w-px shrink-0 bg-rule" aria-hidden />
          <h1 className="truncate text-sm font-medium text-mute">{title}</h1>
        </div>
        <span className="font-data shrink-0 text-[10px] tracking-wide text-live">
          实时
        </span>
      </div>
    </header>
  );
}
