export type NewsItem = {
  id: string;
  title: string;
  summary?: string;
  source: string;
  url?: string;
  publishedAt: string;
  symbols?: string[];
};

export type LevelSnapshot = {
  symbol: string;
  sideBias: "long" | "short" | "neutral";
  entryLow: number;
  entryHigh: number;
  takeProfit: number;
  stopLoss: number;
  updatedAt: string;
  method: string;
  note: string;
  /** Recent 4h OHLC for mini chart (optional). */
  bars?: OhlcBar[];
};

export type OhlcBar = {
  open: number;
  high: number;
  low: number;
  close: number;
  time: string;
};

export type LongShortRow = {
  symbol: string;
  name: string;
  longPct: number;
  shortPct: number;
  updatedAt: string;
};

export type FundingSummary = {
  label: string;
  ratePct: number;
  intervalHours: number;
};

export type CalendarEventType = "宏观" | "解锁" | "上币" | "会议" | "其他";

export type CalendarEvent = {
  id: string;
  title: string;
  type: CalendarEventType;
  startsAt: string;
  detail?: string;
};

export class ProviderError extends Error {
  constructor(
    message: string,
    readonly code: "FETCH" | "PARSE" | "EMPTY" = "FETCH",
  ) {
    super(message);
    this.name = "ProviderError";
  }
}
