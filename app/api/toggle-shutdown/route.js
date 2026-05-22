import { NextResponse } from "next/server";

import { toggleSite } from "@/lib/siteState";

export async function GET() {
  const siteDown = toggleSite();

  return NextResponse.json({
    siteDown,
  });
}