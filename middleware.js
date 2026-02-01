import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isSiteDown } from './app/api/toggle-shutdown/route';

// Routes that don't require auth
const PUBLIC_PATHS = [
  '/',
  '/auth/register',
  '/payment/failed',
  '/payment/success',
  '/payment/verify',
  '/auth/login',
  '/join-member',
  '/auth/forgot-password',
  '/auth/reset-password',
];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (isSiteDown()) {
    // Allow API route itself so you can turn it back on
    if (req.nextUrl.pathname.startsWith("/api/toggle-shutdown")) {
      return NextResponse.next();
    }

    // Show a maintenance page instead of your app
    return NextResponse.rewrite(new URL("/maintenance", req.url));
  }

  // Skip static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/img') || 
    pathname.startsWith('/images') // if you keep them in /public/images
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Allow public routes
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Restrict /admin routes to admin users only
  if (pathname.startsWith('/admin') && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // All good
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|gif|svg|webp|ico|avif|bmp|tiff|woff|woff2|ttf|eot|mp4|webm|ogg|mp3|wav|pdf)).*)',
  ],
};

