import { NextResponse } from 'next/server';

export function getSetCookieHeaders(res: Response): string[] {
  if (typeof res.headers.getSetCookie === 'function') {
    return res.headers.getSetCookie();
  }
  const single = res.headers.get('set-cookie');
  return single ? [single] : [];
}

export function applySetCookies(from: Response, to: NextResponse): void {
  for (const cookie of getSetCookieHeaders(from)) {
    to.headers.append('set-cookie', cookie);
  }
}

export function backendHeaders(request?: Request): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const cookie = request?.headers.get('cookie');
  if (cookie) {
    headers.cookie = cookie;
  }
  return headers;
}

export function refreshHeaders(request: Request): HeadersInit {
  const raw = request.headers.get('cookie') ?? '';
  const filtered = raw
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part && !part.startsWith('accessToken='))
    .join('; ');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (filtered) {
    headers.cookie = filtered;
  }
  return headers;
}
