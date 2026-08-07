import { NextRequest, NextResponse } from "next/server";
import { computeLevels } from "@/lib/levels/engine";
import { beginApiRequest } from "@/lib/observability/request";
import { dataSourceMeta } from "@/lib/providers/data-source-meta";
import { LEVEL_SYMBOLS } from "@/lib/providers/mock-market";
import { resolveOhlc } from "@/lib/providers/resolve";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ symbol: string }> },
) {
  const api = beginApiRequest(req);
  const { symbol: raw } = await ctx.params;
  const symbol = raw.toUpperCase();
  if (!LEVEL_SYMBOLS.includes(symbol as (typeof LEVEL_SYMBOLS)[number])) {
    api.finish({ route: "/api/levels/[symbol]", status: 404 });
    return NextResponse.json(
      { error: "不支持的币种" },
      { status: 404, headers: api.headers },
    );
  }
  try {
    const { bars, source } = await resolveOhlc(symbol);
    const levels = computeLevels(symbol, bars);
    if (source === "live") {
      levels.method = `${levels.method} · Binance 4h`;
    }
    levels.bars = bars.slice(-40);
    const meta = dataSourceMeta(source);
    api.finish({
      route: "/api/levels/[symbol]",
      status: 200,
      source: meta.dataSource,
      degraded: meta.degraded,
    });
    return NextResponse.json(
      { ...levels, ...meta },
      {
        headers: {
          ...api.headers,
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  } catch {
    api.finish({ route: "/api/levels/[symbol]", status: 500 });
    return NextResponse.json(
      { error: "点位计算失败" },
      { status: 500, headers: api.headers },
    );
  }
}
