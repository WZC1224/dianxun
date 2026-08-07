import { NextRequest, NextResponse } from "next/server";
import { beginApiRequest } from "@/lib/observability/request";
import { dataSourceMeta } from "@/lib/providers/data-source-meta";
import { resolveNewsFlash } from "@/lib/providers/resolve";

export async function GET(req: NextRequest) {
  const api = beginApiRequest(req);
  try {
    const rawLimit = Number(req.nextUrl.searchParams.get("limit") ?? "10");
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(Math.trunc(rawLimit), 1), 50)
      : 10;
    const cursor = req.nextUrl.searchParams.get("cursor") ?? undefined;
    // Numeric offset (mock/RSS) or WSCN opaque `ts,ts`.
    if (cursor !== undefined && !/^[\d,]+$/.test(cursor)) {
      api.finish({ route: "/api/news", status: 400 });
      return NextResponse.json(
        { error: "无效游标" },
        { status: 400, headers: api.headers },
      );
    }
    const { items, nextCursor, source } = await resolveNewsFlash({
      limit,
      cursor,
    });
    const meta = dataSourceMeta(source);
    api.finish({
      route: "/api/news",
      status: 200,
      source: meta.dataSource,
      degraded: meta.degraded,
    });
    return NextResponse.json(
      {
        items,
        nextCursor,
        ...meta,
      },
      { headers: api.headers },
    );
  } catch {
    api.finish({ route: "/api/news", status: 502 });
    return NextResponse.json(
      { error: "快讯暂时不可用，请稍后重试" },
      { status: 502, headers: api.headers },
    );
  }
}
