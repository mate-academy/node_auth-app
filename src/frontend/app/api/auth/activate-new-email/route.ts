import { applySetCookies } from '@/app/lib/bff';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const activateToken = new URL(request.url).searchParams.get('activateToken');

  const base = process.env.SERVER_PATH;
  const url = `${base}/auth/activate-new-email?activateToken=${activateToken}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
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
      payload ?? { message: 'Email activation failed' },
      { status: res.status },
    );
  }

  if (!payload?.normalizedUser) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const response = NextResponse.json(payload.normalizedUser, {
    status: res.status,
  });

  applySetCookies(res, response);

  return response;
}
