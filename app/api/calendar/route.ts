import { NextRequest, NextResponse } from "next/server";
import { beginApiRequest } from "@/lib/observability/request";
import { dataSourceMeta } from "@/lib/providers/data-source-meta";
import { resolveCalendar } from "@/lib/providers/resolve";

export async function GET(req: NextRequest) {
  const api = beginApiRequest(req);
  try {
    const raw = req.nextUrl.searchParams.get("days") ?? "7";
    const days = raw === "30" ? 30 : 7;
    const { events, source } = await resolveCalendar(days);
    const meta = dataSourceMeta(source);
    api.finish({
      route: "/api/calendar",
      status: 200,
      source: meta.dataSource,
      degraded: meta.degraded,
    });
    return NextResponse.json(
      { days, events, ...meta },
      {
        headers: {
          ...api.headers,
          // Degraded responses must not stick on CDN as "live".
          "Cache-Control": meta.degraded
            ? "private, no-store"
            : "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch {
    api.finish({ route: "/api/calendar", status: 502 });
    return NextResponse.json(
      { error: "日历暂时不可用，请稍后重试" },
      { status: 502, headers: api.headers },
    );
  }
}
