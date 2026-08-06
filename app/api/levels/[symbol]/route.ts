import { NextResponse } from "next/server";
import { computeLevels } from "@/lib/levels/engine";
import { LEVEL_SYMBOLS } from "@/lib/providers/mock-market";
import { resolveOhlc } from "@/lib/providers/resolve";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ symbol: string }> },
) {
  const { symbol: raw } = await ctx.params;
  const symbol = raw.toUpperCase();
  if (!LEVEL_SYMBOLS.includes(symbol as (typeof LEVEL_SYMBOLS)[number])) {
    return NextResponse.json({ error: "不支持的币种" }, { status: 404 });
  }
  try {
    const { bars, source } = await resolveOhlc(symbol);
    const levels = computeLevels(symbol, bars);
    if (source === "live") {
      levels.method = `${levels.method} · Binance 4h`;
    }
    return NextResponse.json(
      { ...levels, dataSource: source },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "点位计算失败" }, { status: 500 });
  }
}
