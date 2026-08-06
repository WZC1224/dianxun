import { BinanceMarketProvider } from "@/lib/providers/binance-market";
import {
  buildCryptoCalendarEvents,
  mergeCalendarEvents,
} from "@/lib/providers/crypto-calendar";
import { getDataMode } from "@/lib/providers/data-mode";
import {
  fetchFfCalendar,
  filterCalendarHorizon,
} from "@/lib/providers/ff-calendar";
import { fetchGateLongShort } from "@/lib/providers/gate-long-short";
import { mockCalendar } from "@/lib/providers/mock-calendar";
import { mockLongShort } from "@/lib/providers/mock-long-short";
import { mockOhlc } from "@/lib/providers/mock-market";
import { MockNewsProvider } from "@/lib/providers/mock-news";
import type { NewsProvider } from "@/lib/providers/news-types";
import { RssNewsProvider } from "@/lib/providers/rss-news";
import { WscnNewsProvider } from "@/lib/providers/wscn-news";
import { errFields, log } from "@/lib/observability/log";
import type {
  CalendarEvent,
  FundingSummary,
  LongShortRow,
  NewsItem,
  OhlcBar,
} from "@/lib/types";

export async function resolveOhlc(
  symbol: string,
  count = 40,
): Promise<{ bars: OhlcBar[]; source: "live" | "mock" }> {
  if (getDataMode() !== "live") {
    return { bars: mockOhlc(symbol, count), source: "mock" };
  }
  try {
    const bars = await new BinanceMarketProvider().getOhlc(symbol, count);
    return { bars, source: "live" };
  } catch (err) {
    log("error", "provider_fallback", {
      domain: "market",
      provider: "binance",
      outcome: "mock",
      symbol,
      ...errFields(err),
    });
    return { bars: mockOhlc(symbol, count), source: "mock" };
  }
}

export function resolveNewsProvider(): NewsProvider {
  return {
    async listFlash(params) {
      const { items, nextCursor } = await resolveNewsFlash(params);
      return { items, nextCursor };
    },
  };
}

export async function resolveNewsFlash(params: {
  limit: number;
  cursor?: string;
}): Promise<{
  items: NewsItem[];
  nextCursor?: string;
  source: "live" | "mock";
}> {
  if (getDataMode() !== "live") {
    return {
      ...(await new MockNewsProvider().listFlash(params)),
      source: "mock",
    };
  }
  try {
    return {
      ...(await new WscnNewsProvider().listFlash(params)),
      source: "live",
    };
  } catch (wscnErr) {
    log("warn", "provider_fallback", {
      domain: "news",
      provider: "wscn",
      outcome: "try_rss",
      ...errFields(wscnErr),
    });
    try {
      return {
        ...(await new RssNewsProvider().listFlash(params)),
        source: "live",
      };
    } catch (rssErr) {
      log("error", "provider_fallback", {
        domain: "news",
        provider: "rss",
        outcome: "mock",
        ...errFields(rssErr),
      });
      return {
        ...(await new MockNewsProvider().listFlash(params)),
        source: "mock",
      };
    }
  }
}

export async function resolveLongShort(): Promise<{
  rows: LongShortRow[];
  funding: FundingSummary;
  source: "live" | "mock";
}> {
  if (getDataMode() !== "live") {
    return { ...(await mockLongShort()), source: "mock" };
  }
  try {
    const data = await fetchGateLongShort();
    return { ...data, source: "live" };
  } catch (err) {
    log("error", "provider_fallback", {
      domain: "long-short",
      provider: "gate",
      outcome: "mock",
      ...errFields(err),
    });
    return { ...(await mockLongShort()), source: "mock" };
  }
}

export async function resolveCalendar(
  days: 7 | 30,
): Promise<{ events: CalendarEvent[]; source: "live" | "mock" }> {
  const crypto = filterCalendarHorizon(buildCryptoCalendarEvents(), days);

  if (getDataMode() !== "live") {
    return {
      events: mergeCalendarEvents(await mockCalendar(days), crypto),
      source: "mock",
    };
  }

  try {
    const { events: macro, fresh } = await fetchFfCalendar(days);
    const events = mergeCalendarEvents(macro, crypto);
    if (events.length === 0) {
      throw new Error("calendar empty");
    }
    return { events, source: fresh ? "live" : "mock" };
  } catch (err) {
    log("error", "provider_fallback", {
      domain: "calendar",
      provider: "ff",
      outcome: "mock_plus_crypto",
      ...errFields(err),
    });
    return {
      events: mergeCalendarEvents(await mockCalendar(days), crypto),
      source: "mock",
    };
  }
}
