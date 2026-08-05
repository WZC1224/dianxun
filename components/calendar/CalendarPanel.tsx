"use client";

import { useEffect, useMemo, useState } from "react";
import type { CalendarEvent } from "@/lib/types";
import { formatClock, formatDayLabel } from "@/lib/time";
import { Disclaimer } from "@/components/shell/Disclaimer";

export function CalendarPanel() {
  const [days, setDays] = useState<7 | 30>(7);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    void fetch(`/api/calendar?days=${days}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("fail");
        return res.json() as Promise<{ events: CalendarEvent[] }>;
      })
      .then((d) => setEvents(d.events))
      .catch(() => setError("日历加载失败。稍后重试。"))
      .finally(() => setLoading(false));
  }, [days]);

  const groups = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const key = formatDayLabel(e.startsAt);
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [events]);

  return (
    <div className="space-y-5">
      <header>
        <p className="font-display text-lg text-live">点讯</p>
        <h1 className="text-2xl font-semibold text-ink">大事日历</h1>
      </header>

      <div className="flex gap-4 border-b border-rule">
        {([7, 30] as const).map((d) => {
          const active = days === d;
          return (
            <button
              key={d}
              type="button"
              className={`pb-2 text-sm ${
                active
                  ? "border-b-2 border-live font-semibold text-live"
                  : "text-mute"
              }`}
              onClick={() => setDays(d)}
            >
              {d}天
            </button>
          );
        })}
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
          该时间范围内无事件。
        </p>
      ) : null}

      <div className="space-y-6">
        {groups.map(([day, list]) => (
          <section key={day}>
            <h2 className="mb-2 text-sm font-semibold text-live">{day}</h2>
            <ul className="divide-y divide-rule border-y border-rule">
              {list.map((e) => (
                <li key={e.id} className="py-3">
                  <div className="flex gap-3 text-sm">
                    <span className="font-data w-12 shrink-0 text-mute">
                      {formatClock(e.startsAt)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-xs text-live">{e.type}</span>
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

      <Disclaimer />
    </div>
  );
}
