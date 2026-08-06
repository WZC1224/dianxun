import type { OhlcBar } from "@/lib/types";

export interface MarketProvider {
  getOhlc(symbol: string, count?: number): Promise<OhlcBar[]>;
}
