import { applySetCookies } from '@/app/lib/bff';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const base = process.env.SERVER_PATH;
  const url = `${base}/auth/google`;
  const body = await request.json();

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to reach backend';
    return NextResponse.json(
      { message: `Backend fetch failed (${url}): ${message}` },
      { status: 502 },
    );
  }

  const raw = await res.text();
  let payload: Record<string, unknown> = {};
  if (raw) {
    try {
      payload = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      payload = { message: raw };
    }
  }

  const normalizedUser = payload.normalizedUser;

  if (!res.ok) {
    const backendMessage =
      typeof payload.message === 'string' ? payload.message : undefined;
    return NextResponse.json(
      {
        message: backendMessage ?? 'Google sign-in failed',
        code:
          typeof payload.code === 'string'
            ? payload.code
            : 'GOOGLE_SIGN_IN_FAILED',
      },
      { status: res.status || 401 },
    );
  }

  if (!normalizedUser) {
    return NextResponse.json(
      { message: 'Google sign-in failed', code: 'GOOGLE_SIGN_IN_FAILED' },
      { status: 401 },
    );
  }

  const response = NextResponse.json(normalizedUser, {
    status: res.status,
  });

  applySetCookies(res, response);

  return response;
}
