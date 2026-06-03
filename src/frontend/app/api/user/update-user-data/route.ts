import { applySetCookies, backendHeaders } from '@/app/lib/bff';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  const base = process.env.SERVER_PATH;
  const body = await request.json();
  let url = '';

  if (body.newName) {
    url = `${base}/user/update-user-name`;
  } else if (body.newEmail) {
    url = `${base}/user/update-user-email`;
  } else if (body.newPassword) {
    url = `${base}/user/update-user-password`;
  }

  if (!url) {
    return NextResponse.json(
      { message: 'No update fields provided' },
      { status: 400 },
    );
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'PUT',
      headers: backendHeaders(request),
      body: JSON.stringify(body),
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
      payload ?? { message: 'Error during update user data' },
      { status: res.status },
    );
  }

  const response = NextResponse.json(payload, { status: res.status });
  applySetCookies(res, response);

  return response;
}
