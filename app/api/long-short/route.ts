import { NextRequest, NextResponse } from "next/server";
import { beginApiRequest } from "@/lib/observability/request";
import { dataSourceMeta } from "@/lib/providers/data-source-meta";
import { resolveLongShort } from "@/lib/providers/resolve";

export async function GET(req: NextRequest) {
  const api = beginApiRequest(req);
  try {
    const data = await resolveLongShort();
    const meta = dataSourceMeta(data.source);
    api.finish({
      route: "/api/long-short",
      status: 200,
      source: meta.dataSource,
      degraded: meta.degraded,
    });
    return NextResponse.json(
      {
        rows: data.rows,
        funding: data.funding,
        ...meta,
      },
      {
        headers: {
          ...api.headers,
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch {
    api.finish({ route: "/api/long-short", status: 502 });
    return NextResponse.json(
      { error: "多空比暂时不可用，请稍后重试" },
      { status: 502, headers: api.headers },
    );
  }
}
