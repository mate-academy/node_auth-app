import { applySetCookies, refreshHeaders } from '@/app/lib/bff';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

async function proxyRefresh(request: Request) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { message: 'Refresh token missing' },
      { status: 401 },
    );
  }

  const base = process.env.SERVER_PATH;
  if (!base) {
    return NextResponse.json(
      { message: 'SERVER_PATH is not configured' },
      { status: 500 },
    );
  }

  const url = `${base}/auth/refresh`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: refreshHeaders(request),
      cache: 'no-store',
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to reach backend';
    return NextResponse.json(
      { message: `Backend fetch failed (${url}): ${message}` },
      { status: 502 },
    );
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Unauthorized' }));
    return NextResponse.json(body, { status: res.status });
  }

  const response = NextResponse.json({ message: 'OK' }, { status: 200 });
  applySetCookies(res, response);

  return response;
}

export async function GET(request: Request) {
  return proxyRefresh(request);
}
