"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarBlank,
  Lightning,
  Crosshair,
  ArrowsDownUp,
} from "@phosphor-icons/react";

const TABS = [
  { href: "/", label: "快讯", icon: Lightning },
  { href: "/levels", label: "点位", icon: Crosshair },
  { href: "/long-short", label: "多空", icon: ArrowsDownUp },
  { href: "/calendar", label: "日历", icon: CalendarBlank },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const activeIndex = TABS.findIndex(({ href }) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`),
  );
  const index = activeIndex < 0 ? 0 : activeIndex;

  return (
    <nav
      className="shrink-0 border-t border-rule bg-slip"
      aria-label="主导航"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="relative">
        <ul className="grid grid-cols-4">
          {TABS.map(({ href, label, icon: Icon }, i) => {
            const active = i === index;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex flex-col items-center gap-0.5 py-2.5 pb-3 text-xs transition-colors ${
                    active ? "text-live" : "text-mute"
                  }`}
                >
                  <Icon
                    size={22}
                    weight={active ? "fill" : "regular"}
                    aria-hidden
                  />
                  <span className={active ? "font-medium" : undefined}>
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div
          className="nav-indicator pointer-events-none absolute bottom-1.5 left-0 w-1/4"
          style={{ transform: `translateX(${index * 100}%)` }}
          aria-hidden
        >
          <span className="mx-auto block h-0.5 w-6 rounded-sm bg-live" />
        </div>
      </div>
    </nav>
  );
}
