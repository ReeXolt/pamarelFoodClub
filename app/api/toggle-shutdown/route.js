import { NextResponse } from "next/server";
import { toggleSite } from "@/lib/siteState";

export function GET() {
  const siteDown = toggleSite();
  return NextResponse.json({ siteDown });
}