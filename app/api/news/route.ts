import { NextRequest, NextResponse } from "next/server";
import { dataSourceMeta } from "@/lib/providers/data-source-meta";
import { resolveNewsFlash } from "@/lib/providers/resolve";

export async function GET(req: NextRequest) {
  try {
    const rawLimit = Number(req.nextUrl.searchParams.get("limit") ?? "10");
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(Math.trunc(rawLimit), 1), 50)
      : 10;
    const cursor = req.nextUrl.searchParams.get("cursor") ?? undefined;
    if (cursor !== undefined && !/^\d+$/.test(cursor)) {
      return NextResponse.json({ error: "无效游标" }, { status: 400 });
    }
    const { items, nextCursor, source } = await resolveNewsFlash({
      limit,
      cursor,
    });
    return NextResponse.json({
      items,
      nextCursor,
      ...dataSourceMeta(source),
    });
  } catch {
    return NextResponse.json(
      { error: "快讯暂时不可用，请稍后重试" },
      { status: 502 },
    );
  }
}
