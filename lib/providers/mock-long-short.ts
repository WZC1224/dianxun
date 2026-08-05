import type { FundingSummary, LongShortRow } from "@/lib/types";

export async function mockLongShort(): Promise<{
  rows: LongShortRow[];
  funding: FundingSummary;
}> {
  const now = new Date().toISOString();
  return {
    rows: [
      { symbol: "BTC", name: "Bitcoin", longPct: 63.2, shortPct: 36.8, updatedAt: now },
      { symbol: "ETH", name: "Ethereum", longPct: 58.7, shortPct: 41.3, updatedAt: now },
      { symbol: "SOL", name: "Solana", longPct: 54.1, shortPct: 45.9, updatedAt: now },
      { symbol: "BNB", name: "BNB", longPct: 51.4, shortPct: 48.6, updatedAt: now },
      { symbol: "XRP", name: "XRP", longPct: 49.2, shortPct: 50.8, updatedAt: now },
    ],
    funding: {
      label: "资金费率 (主流合约平均)",
      ratePct: 0.0102,
      intervalHours: 8,
    },
  };
}
