import { BinanceMarketProvider } from "@/lib/providers/binance-market";
import { getDataMode } from "@/lib/providers/data-mode";
import { fetchFfCalendar } from "@/lib/providers/ff-calendar";
import { fetchGateLongShort } from "@/lib/providers/gate-long-short";
import { mockCalendar } from "@/lib/providers/mock-calendar";
import { mockLongShort } from "@/lib/providers/mock-long-short";
import { mockOhlc } from "@/lib/providers/mock-market";
import { MockNewsProvider } from "@/lib/providers/mock-news";
import { RssNewsProvider } from "@/lib/providers/rss-news";
import type { NewsProvider } from "@/lib/providers/news-types";
import type {
  CalendarEvent,
  FundingSummary,
  LongShortRow,
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
    console.error("[market] live OHLC failed, falling back to mock", err);
    return { bars: mockOhlc(symbol, count), source: "mock" };
  }
}

export function resolveNewsProvider(): NewsProvider {
  if (getDataMode() !== "live") {
    return new MockNewsProvider();
  }
  return {
    async listFlash(params) {
      try {
        return await new RssNewsProvider().listFlash(params);
      } catch (err) {
        console.error("[news] live RSS failed, falling back to mock", err);
        return new MockNewsProvider().listFlash(params);
      }
    },
  };
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
    console.error("[long-short] live Gate failed, falling back to mock", err);
    return { ...(await mockLongShort()), source: "mock" };
  }
}

export async function resolveCalendar(
  days: 7 | 30,
): Promise<{ events: CalendarEvent[]; source: "live" | "mock" }> {
  if (getDataMode() !== "live") {
    return { events: await mockCalendar(days), source: "mock" };
  }
  try {
    const events = await fetchFfCalendar(days);
    if (events.length === 0) {
      throw new Error("FF calendar filtered empty");
    }
    return { events, source: "live" };
  } catch (err) {
    console.error("[calendar] live FF failed, falling back to mock", err);
    return { events: await mockCalendar(days), source: "mock" };
  }
}
