import { NextResponse } from "next/server";


let siteDown = false;

export function GET() {
  siteDown = !siteDown;
  return NextResponse.json({ siteDown });
}

// Expose state for middleware to check
export function isSiteDown() {
  return siteDown;
}
