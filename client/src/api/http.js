const API_URL = 'http://localhost:3005';

export async function request(path, { method = 'GET', body } = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Не вдалося зʼєднатися з сервером');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Щось пішло не так');
  }

  return data;
}
