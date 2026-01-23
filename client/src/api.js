'use strict';

'use strict';

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const p = path.startsWith('/') ? path : `/${path}`;
  const url = `${BASE}${p}`;

  const res = await fetch(url, {
    method,
    credentials: 'include',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }

  return data;
}

