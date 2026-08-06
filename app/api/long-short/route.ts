import { NextResponse } from "next/server";
import { resolveLongShort } from "@/lib/providers/resolve";

export async function GET() {
  try {
    const data = await resolveLongShort();
    return NextResponse.json(
      {
        rows: data.rows,
        funding: data.funding,
        dataSource: data.source,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "多空比暂时不可用，请稍后重试" },
      { status: 502 },
    );
  }
}
