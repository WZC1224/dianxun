import { NextResponse } from "next/server";
import { computeLevels } from "@/lib/levels/engine";
import { LEVEL_SYMBOLS, mockOhlc } from "@/lib/providers/mock-market";

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
    const bars = mockOhlc(symbol);
    const levels = computeLevels(symbol, bars);
    return NextResponse.json(levels);
  } catch {
    return NextResponse.json({ error: "点位计算失败" }, { status: 500 });
  }
}
