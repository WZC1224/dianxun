import { NextResponse } from "next/server";
import { computeLevels } from "@/lib/levels/engine";
import { LEVEL_SYMBOLS } from "@/lib/providers/mock-market";
import { resolveOhlc } from "@/lib/providers/resolve";

export async function GET() {
  try {
    const symbols = LEVEL_SYMBOLS.slice(0, 3);
    const items = await Promise.all(
      symbols.map(async (symbol) => {
        const { bars, source } = await resolveOhlc(symbol);
        const levels = computeLevels(symbol, bars);
        return {
          symbol,
          entryHint:
            levels.sideBias === "long"
              ? `近支撑 ${levels.entryLow}`
              : `近阻力 ${levels.entryHigh}`,
          last: bars.at(-1)?.close ?? 0,
          bias: levels.sideBias,
          dataSource: source,
        };
      }),
    );
    return NextResponse.json(
      { items },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "点位条不可用" }, { status: 502 });
  }
}
