import { backendHeaders } from '@/app/lib/bff';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const base = process.env.SERVER_PATH;
  const url = `${base}/auth/reset-password`;
  const body = await request.json();

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: backendHeaders(request),
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

  if (!res.ok) {
    const raw = await res.text();
    let details: unknown = null;

    if (raw) {
      try {
        details = JSON.parse(raw);
      } catch {
        details = { message: raw };
      }
    }

    return NextResponse.json(
      {
        message: 'Send email failed',
        backendStatus: res.status,
        backendBody: details,
      },
      { status: res.status },
    );
  }

  const response = NextResponse.json({ message: 'Success' }, { status: 200 });

  return response;
}
