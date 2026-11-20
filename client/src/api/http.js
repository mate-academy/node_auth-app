const API_URL = 'http://localhost:3005';
export const TOKEN_KEY = 'accessToken';

export async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Could not connect to the server.');
  }


  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || 'Something went wrong.');
    error.status = response.status;
    throw error;
  }

  return data;
}
