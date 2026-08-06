import type { FundingSummary, LongShortRow } from "@/lib/types";
import { ProviderError } from "@/lib/types";
import { LEVEL_SYMBOLS } from "@/lib/providers/mock-market";

export const DEFAULT_GATE_API_BASE = "https://api.gateio.ws";

const CONTRACT: Record<(typeof LEVEL_SYMBOLS)[number], string> = {
  BTC: "BTC_USDT",
  ETH: "ETH_USDT",
  SOL: "SOL_USDT",
  BNB: "BNB_USDT",
  XRP: "XRP_USDT",
};

const NAMES: Record<(typeof LEVEL_SYMBOLS)[number], string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  SOL: "Solana",
  BNB: "BNB",
  XRP: "XRP",
};

type GateContract = {
  name?: string;
  long_users?: number;
  short_users?: number;
  funding_rate?: string;
  funding_interval?: number;
};

export function parseGateContract(
  symbol: (typeof LEVEL_SYMBOLS)[number],
  raw: GateContract,
  now = new Date().toISOString(),
): { row: LongShortRow; fundingRate: number; intervalHours: number } {
  const longUsers = Number(raw.long_users ?? 0);
  const shortUsers = Number(raw.short_users ?? 0);
  const total = longUsers + shortUsers;
  if (!Number.isFinite(total) || total <= 0) {
    throw new ProviderError(`Gate ${symbol} users empty`, "EMPTY");
  }
  const longPct = Math.round((longUsers / total) * 1000) / 10;
  const shortPct = Math.round((100 - longPct) * 10) / 10;
  const fundingRate = Number(raw.funding_rate ?? NaN);
  if (!Number.isFinite(fundingRate)) {
    throw new ProviderError(`Gate ${symbol} funding invalid`, "PARSE");
  }
  const intervalSec = Number(raw.funding_interval ?? 28_800);
  const intervalHours = intervalSec > 0 ? intervalSec / 3600 : 8;
  return {
    row: {
      symbol,
      name: NAMES[symbol],
      longPct,
      shortPct,
      updatedAt: now,
    },
    fundingRate,
    intervalHours,
  };
}

type GateCache = {
  at: number;
  data: { rows: LongShortRow[]; funding: FundingSummary };
  baseUrl: string;
};
let gateCache: GateCache | null = null;
const GATE_TTL_MS = 60_000;

export async function fetchGateLongShort(baseUrl =
  process.env.GATE_API_BASE?.replace(/\/$/, "") || DEFAULT_GATE_API_BASE): Promise<{
  rows: LongShortRow[];
  funding: FundingSummary;
}> {
  if (
    gateCache &&
    gateCache.baseUrl === baseUrl &&
    Date.now() - gateCache.at < GATE_TTL_MS
  ) {
    return gateCache.data;
  }

  const now = new Date().toISOString();
  const parsed = await Promise.all(
    LEVEL_SYMBOLS.map(async (symbol) => {
      const contract = CONTRACT[symbol];
      const url = `${baseUrl}/api/v4/futures/usdt/contracts/${contract}`;
      let res: Response;
      try {
        res = await fetch(url, {
          headers: { Accept: "application/json" },
          cache: "no-store",
          signal: AbortSignal.timeout(12_000),
        });
      } catch {
        throw new ProviderError(`Gate ${symbol} fetch failed`, "FETCH");
      }
      if (!res.ok) {
        throw new ProviderError(`Gate ${symbol} HTTP ${res.status}`, "FETCH");
      }
      const json = (await res.json()) as GateContract;
      return parseGateContract(symbol, json, now);
    }),
  );

  const rows = parsed.map((p) => p.row);
  const avgRate =
    parsed.reduce((sum, p) => sum + p.fundingRate, 0) / parsed.length;
  // Gate returns fraction (e.g. 0.00006); UI shows percent like 0.006
  const ratePct = Math.round(avgRate * 100 * 10_000) / 10_000;
  const intervalHours = parsed[0]?.intervalHours ?? 8;

  const data = {
    rows,
    funding: {
      label: "资金费率 (Gate 永续平均)",
      ratePct,
      intervalHours,
    },
  };
  gateCache = { at: Date.now(), data, baseUrl };
  return data;
}
