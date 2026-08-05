import { NextRequest, NextResponse } from "next/server";
import { mockCalendar } from "@/lib/providers/mock-calendar";

export async function GET(req: NextRequest) {
  try {
    const raw = req.nextUrl.searchParams.get("days") ?? "7";
    const days = raw === "30" ? 30 : 7;
    const events = await mockCalendar(days);
    return NextResponse.json({ days, events });
  } catch {
    return NextResponse.json(
      { error: "日历暂时不可用，请稍后重试" },
      { status: 502 },
    );
  }
}
