import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import { getSiteState } from '@/lib/siteState';

// Routes that don't require auth
const PUBLIC_PATHS: string[] = [
  '/',
  '/auth/register',
  '/contact',
  '/payment/failed',
  '/payment/success',
  '/payment/verify',
  '/auth/login',
  '/join-member',
  '/auth/forgot-password',
  '/auth/reset-password',
];

type TokenType = {
  role?: string;
};

export async function middleware(
  req: NextRequest
): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // 🔴 DEV ONLY: DISABLE AUTH
  // if (process.env.NODE_ENV === "development") {
  //   if (getSiteState()) {
  //     if (req.nextUrl.pathname.startsWith("/api/toggle-shutdown")) {
  //       return NextResponse.next();
  //     }

  //     return NextResponse.rewrite(
  //       new URL("/maintenance", req.url)
  //     );
  //   }

  //   return NextResponse.next();
  // }

  if (getSiteState()) {
    // Allow API route itself so you can turn it back on
    if (req.nextUrl.pathname.startsWith('/api/toggle-shutdown')) {
      return NextResponse.next();
    }

    // Show maintenance page
    return NextResponse.rewrite(
      new URL('/maintenance', req.url)
    );
  }

  // Skip static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/img') ||
    pathname.startsWith('/images')
  ) {
    return NextResponse.next();
  }

  const token = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })) as TokenType | null;

  // Allow public routes
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users
  if (!token) {
    return NextResponse.redirect(
      new URL('/auth/login', req.url)
    );
  }

  // Restrict admin routes
  if (
    pathname.startsWith('/admin') &&
    token.role !== 'admin'
  ) {
    return NextResponse.redirect(
      new URL('/', req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|gif|svg|webp|ico|avif|bmp|tiff|woff|woff2|ttf|eot|mp4|webm|ogg|mp3|wav|pdf)).*)',
  ],
};