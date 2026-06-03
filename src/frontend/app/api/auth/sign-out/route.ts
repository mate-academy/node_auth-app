import { applySetCookies, backendHeaders } from '@/app/lib/bff';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const base = process.env.SERVER_PATH;
  const url = `${base}/auth/sign-out`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: backendHeaders(request),
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
    return NextResponse.json({ message: 'Failed' }, { status: res.status });
  }

  const response = NextResponse.json({ message: 'Success' }, { status: 200 });
  applySetCookies(res, response);

  return response;
}
