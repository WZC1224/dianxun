import { createHash } from "node:crypto";
import type { CalendarEvent, CalendarEventType } from "@/lib/types";
import { ProviderError } from "@/lib/types";
import bootstrapJson from "@/lib/providers/fixtures/ff-calendar-bootstrap.json";

export const DEFAULT_FF_CALENDAR_URL =
  "https://nfs.faireconomy.media/ff_calendar_thisweek.json";

type FfRow = {
  title?: string;
  country?: string;
  date?: string;
  impact?: string;
  forecast?: string;
  previous?: string;
};

export function classifyFfEvent(title: string): CalendarEventType {
  const t = title.toLowerCase();
  if (
    t.includes("meeting") ||
    t.includes("fomc") ||
    t.includes("speak") ||
    t.includes("testimony") ||
    t.includes("press conference")
  ) {
    return "会议";
  }
  if (t.includes("holiday") || t.includes("bank holiday")) {
    return "其他";
  }
  return "宏观";
}

export function parseFfCalendar(raw: unknown): CalendarEvent[] {
  if (!Array.isArray(raw)) {
    throw new ProviderError("FF calendar payload invalid", "PARSE");
  }
  const events: CalendarEvent[] = [];
  for (const row of raw as FfRow[]) {
    if (!row?.title || !row?.date) continue;
    const starts = new Date(row.date);
    if (Number.isNaN(starts.getTime())) continue;
    const bits = [
      row.country ? `地区 ${row.country}` : null,
      row.impact ? `影响 ${row.impact}` : null,
      row.forecast ? `预期 ${row.forecast}` : null,
      row.previous ? `前值 ${row.previous}` : null,
    ].filter(Boolean);
    const id = createHash("sha1")
      .update(`${row.title}|${row.date}|${row.country ?? ""}`)
      .digest("hex")
      .slice(0, 16);
    events.push({
      id: `ff-${id}`,
      title: row.title.trim(),
      type: classifyFfEvent(row.title),
      startsAt: starts.toISOString(),
      detail: bits.length ? bits.join(" · ") : undefined,
    });
  }
  if (events.length === 0) {
    throw new ProviderError("FF calendar empty", "EMPTY");
  }
  return events.sort(
    (a, b) =>
      new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );
}

export function filterCalendarHorizon(
  events: CalendarEvent[],
  days: 7 | 30,
  now = Date.now(),
): CalendarEvent[] {
  // FF feed is "this week" — keep recent past so mid-week tabs aren't empty.
  const lookback = Math.min(days, 7) * 24 * 3600_000;
  const start = now - lookback;
  const end = now + days * 24 * 3600_000;
  return events.filter((e) => {
    const t = new Date(e.startsAt).getTime();
    return t >= start && t <= end;
  });
}

type FfCache = {
  at: number;
  events: CalendarEvent[];
  url: string;
  failUntil?: number;
};
let ffCache: FfCache | null = null;
const FF_TTL_MS = 15 * 60_000;
/** After FF network/HTTP failure, skip outbound fetch for this window. */
export const FF_FAIL_COOLDOWN_MS = 60_000;

/** Test-only: clear module cache between cases. */
export function resetFfCacheForTests(): void {
  ffCache = null;
}

function ensureBootstrapCache(feedUrl: string): CalendarEvent[] {
  if (ffCache && ffCache.url === feedUrl) return ffCache.events;
  const events = parseFfCalendar(bootstrapJson);
  ffCache = { at: 0, events, url: feedUrl };
  return events;
}

export async function fetchFfCalendar(
  days: 7 | 30,
  feedUrl =
    process.env.CALENDAR_FF_URL?.trim() || DEFAULT_FF_CALENDAR_URL,
): Promise<{ events: CalendarEvent[]; fresh: boolean }> {
  const cached = ensureBootstrapCache(feedUrl);
  const now = Date.now();

  if (ffCache?.failUntil && now < ffCache.failUntil) {
    return {
      events: filterCalendarHorizon(ffCache.events, days, now),
      fresh: false,
    };
  }

  if (ffCache && now - ffCache.at < FF_TTL_MS && ffCache.at > 0) {
    return {
      events: filterCalendarHorizon(cached, days, now),
      fresh: true,
    };
  }

  try {
    const res = await fetch(feedUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (compatible; dianxun/0.1; +https://github.com/WZC1224/dianxun)",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) {
      throw new ProviderError(`FF calendar HTTP ${res.status}`, "FETCH");
    }
    const json: unknown = await res.json();
    const all = parseFfCalendar(json);
    ffCache = { at: Date.now(), events: all, url: feedUrl };
    return {
      events: filterCalendarHorizon(all, days),
      fresh: true,
    };
  } catch (err) {
    // Bootstrap / last-good beats empty calendar when FF rate-limits (common).
    console.warn("[calendar] FF fetch failed, using cached or bootstrap", err);
    ffCache = {
      at: ffCache?.at ?? 0,
      events: cached,
      url: feedUrl,
      failUntil: Date.now() + FF_FAIL_COOLDOWN_MS,
    };
    return {
      events: filterCalendarHorizon(cached, days),
      fresh: false,
    };
  }
}
