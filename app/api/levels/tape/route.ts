import { NextResponse } from "next/server";
import { LEVEL_SYMBOLS, mockOhlc } from "@/lib/providers/mock-market";
import { computeLevels } from "@/lib/levels/engine";

export async function GET() {
  try {
    const items = LEVEL_SYMBOLS.slice(0, 3).map((symbol) => {
      const bars = mockOhlc(symbol);
      const levels = computeLevels(symbol, bars);
      return {
        symbol,
        entryHint:
          levels.sideBias === "long"
            ? `关键支撑 ${levels.entryLow}`
            : `关键阻力 ${levels.entryHigh}`,
        last: bars.at(-1)?.close ?? 0,
        bias: levels.sideBias,
      };
    });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "点位条不可用" }, { status: 502 });
  }
}
