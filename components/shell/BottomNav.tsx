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

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-rule bg-slip"
      aria-label="主导航"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-xs transition-colors ${
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
                <span
                  className={`mt-0.5 h-0.5 w-6 rounded-sm transition-colors ${
                    active ? "bg-live" : "bg-transparent"
                  }`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
