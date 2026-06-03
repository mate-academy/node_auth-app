import { applySetCookies, backendHeaders } from '@/app/lib/bff';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const base = process.env.SERVER_PATH;
  const url = `${base}/user`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: backendHeaders(request),
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

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: res.status },
    );
  }

  const response = NextResponse.json(payload, { status: res.status });
  applySetCookies(res, response);

  return response;
}
