"use client";

import { useEffect, useMemo, useState } from "react";
import type { CalendarEvent, CalendarEventType } from "@/lib/types";
import { formatClock, formatDayLabel } from "@/lib/time";
import { Disclaimer } from "@/components/shell/Disclaimer";

const TYPE_FILTERS: Array<"全部" | CalendarEventType> = [
  "全部",
  "宏观",
  "解锁",
  "上币",
  "会议",
  "其他",
];

export function CalendarPanel() {
  const [days, setDays] = useState<7 | 30>(7);
  const [type, setType] = useState<(typeof TYPE_FILTERS)[number]>("全部");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void fetch(`/api/calendar?days=${days}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("fail");
        return res.json() as Promise<{ events: CalendarEvent[] }>;
      })
      .then((d) => setEvents(d.events))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("日历加载失败。稍后重试。");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [days]);

  const filtered = useMemo(
    () => (type === "全部" ? events : events.filter((e) => e.type === type)),
    [events, type],
  );

  const groups = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of filtered) {
      const key = formatDayLabel(e.startsAt);
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <div className="pb-4">
      <div className="sticky top-0 z-10 -mx-3.5 mb-4 border-b border-rule bg-board px-3.5 pt-2">
        <div className="flex w-full" role="tablist" aria-label="时间范围">
          {([7, 30] as const).map((d) => {
            const active = days === d;
            return (
              <button
                key={d}
                type="button"
                className={`-mb-px min-w-0 flex-1 border-b-2 py-2.5 text-center text-sm transition-colors ${
                  active
                    ? "border-live font-semibold text-live"
                    : "border-transparent text-mute hover:text-ink"
                }`}
                onClick={() => setDays(d)}
              >
                {d}天
              </button>
            );
          })}
        </div>
        <div
          className="flex w-full gap-0.5 py-2"
          role="group"
          aria-label="事件类型"
        >
          {TYPE_FILTERS.map((t) => {
            const active = type === t;
            return (
              <button
                key={t}
                type="button"
                className={`min-w-0 flex-1 truncate rounded-[length:var(--radius)] px-0.5 py-1.5 text-center text-[11px] transition-colors ${
                  active
                    ? "bg-slip font-medium text-live"
                    : "text-mute hover:text-ink"
                }`}
                onClick={() => setType(t)}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-mute">加载中...</p>
      ) : null}
      {error ? (
        <p className="py-10 text-center text-sm text-short" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error && groups.length === 0 ? (
        <p className="py-10 text-center text-sm text-mute">
          该筛选下无事件。
        </p>
      ) : null}

      <div className="space-y-5">
        {groups.map(([day, list]) => (
          <section key={day}>
            <h2 className="mb-2 text-xs font-semibold tracking-wide text-live">
              {day}
            </h2>
            <ul className="panel divide-y divide-rule overflow-hidden">
              {list.map((e) => (
                <li key={e.id} className="px-3 py-3">
                  <div className="flex gap-3 text-sm">
                    <span className="font-data w-12 shrink-0 text-mute">
                      {formatClock(e.startsAt)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-data text-[10px] text-live">
                          {e.type}
                        </span>
                        <span className="text-ink">{e.title}</span>
                      </div>
                      {e.detail ? (
                        <p className="mt-1 text-xs text-mute">{e.detail}</p>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-3 text-center text-[11px] text-mute">
        解锁/上币为相对日程参考；宏观来自公开日历源
      </p>
      <Disclaimer />
    </div>
  );
}
