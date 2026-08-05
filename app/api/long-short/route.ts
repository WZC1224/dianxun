import { NextResponse } from "next/server";
import { mockLongShort } from "@/lib/providers/mock-long-short";

export async function GET() {
  try {
    const data = await mockLongShort();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "多空比暂时不可用，请稍后重试" },
      { status: 502 },
    );
  }
}
