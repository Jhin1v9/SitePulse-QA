import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "sitepulse-hub",
    now: new Date().toISOString(),
  });
}

