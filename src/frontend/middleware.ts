import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/app/lib/verify-access-token';

/** Routes for guests only (redirect to profile if access cookie is valid). */
const GUEST_ONLY_EXACT = new Set([
  '/sign-in',
  '/sign-up',
  '/activate',
  '/activate-email',
  '/forgot-password',
  '/reset-password',
]);

function isGuestOnlyRoute(pathname: string): boolean {
  if (GUEST_ONLY_EXACT.has(pathname)) return true;
  if (pathname.startsWith('/reset-password/')) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const accessToken = req.cookies.get('accessToken')?.value;
  const hasValidAccess = accessToken
    ? Boolean(await verifyAccessToken(accessToken))
    : false;

  const isProtected =
    pathname.startsWith('/home') || pathname.startsWith('/profile');

  if (isProtected && !hasValidAccess) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  if (isGuestOnlyRoute(pathname) && hasValidAccess) {
    return NextResponse.redirect(new URL('/profile', req.url));
  }

  return NextResponse.next();
}
