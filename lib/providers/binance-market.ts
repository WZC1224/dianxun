import type { OhlcBar } from "@/lib/types";
import { ProviderError } from "@/lib/types";
import type { MarketProvider } from "@/lib/providers/market-types";
import { LEVEL_SYMBOLS } from "@/lib/providers/mock-market";

/** Public market-data host; api.binance.com often blocked in CN. */
export const DEFAULT_BINANCE_API_BASE = "https://data-api.binance.vision";

const PAIR: Record<(typeof LEVEL_SYMBOLS)[number], string> = {
  BTC: "BTCUSDT",
  ETH: "ETHUSDT",
  SOL: "SOLUSDT",
  BNB: "BNBUSDT",
  XRP: "XRPUSDT",
};

type BinanceKline = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  ...unknown[],
];

export function parseBinanceKlines(raw: unknown): OhlcBar[] {
  if (!Array.isArray(raw)) {
    throw new ProviderError("Binance klines payload invalid", "PARSE");
  }
  const bars: OhlcBar[] = [];
  for (const row of raw) {
    if (!Array.isArray(row) || row.length < 6) {
      throw new ProviderError("Binance kline row invalid", "PARSE");
    }
    const k = row as BinanceKline;
    bars.push({
      open: Number(k[1]),
      high: Number(k[2]),
      low: Number(k[3]),
      close: Number(k[4]),
      time: new Date(k[0]).toISOString(),
    });
  }
  if (bars.length === 0) {
    throw new ProviderError("Binance klines empty", "EMPTY");
  }
  if (bars.some((b) => !Number.isFinite(b.close))) {
    throw new ProviderError("Binance kline numbers invalid", "PARSE");
  }
  return bars;
}

export class BinanceMarketProvider implements MarketProvider {
  constructor(
    private readonly baseUrl =
      process.env.BINANCE_API_BASE?.replace(/\/$/, "") ||
      DEFAULT_BINANCE_API_BASE,
  ) {}

  async getOhlc(symbol: string, count = 40): Promise<OhlcBar[]> {
    const upper = symbol.toUpperCase();
    const pair = PAIR[upper as keyof typeof PAIR];
    if (!pair) {
      throw new ProviderError(`unsupported symbol ${upper}`, "FETCH");
    }
    const limit = Math.min(Math.max(count, 5), 200);
    const url = `${this.baseUrl}/api/v3/klines?symbol=${pair}&interval=4h&limit=${limit}`;
    let res: Response;
    try {
      res = await fetch(url, {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(12_000),
      });
    } catch {
      throw new ProviderError("Binance klines fetch failed", "FETCH");
    }
    if (!res.ok) {
      throw new ProviderError(`Binance HTTP ${res.status}`, "FETCH");
    }
    const json: unknown = await res.json();
    return parseBinanceKlines(json);
  }
}
