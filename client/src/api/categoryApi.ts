/**
 * API Client — Categorias (Categories).
 *
 * Todas as chamadas usam credentials: 'include' para enviar
 * os cookies HTTP-only (accessToken) automaticamente.
 *
 * Base URL: /api/accounting/categories (proxy Vite → :3000)
 */
const CATEGORY_BASE = '/api/accounting/categories';

export interface CategoryResponse {
  id: number;
  userId: number;
  name: string;
  type: string;
}

async function request(url: string, options: RequestInit = {}) {
  let res: Response;

  try {
    res = await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
  } catch {
    throw new Error(
      'Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente mais tarde.',
    );
  }

  let data: any;

  try {
    data = await res.json();
  } catch {
    if (!res.ok) {
      throw new Error(
        'O servidor encontrou um problema. Tente novamente mais tarde.',
      );
    }

    return {};
  }

  if (!res.ok) {
    const error: any = new Error(data.message || 'Erro na requisição');
    error.status = res.status;
    error.errors = data.errors || {};
    throw error;
  }

  return data;
}

export const categoryApi = {
  getAll: (query?: string) => request(`${CATEGORY_BASE}${query ? `?${query}` : ''}`),
  create: (name: string, type: string) => request(CATEGORY_BASE, { method: 'POST', body: JSON.stringify({ name, type }) }),
  update: (id: number, name: string, type: string) => request(`${CATEGORY_BASE}/${id}`, { method: 'PATCH', body: JSON.stringify({ name, type }) }),
  remove: (id: number) => request(`${CATEGORY_BASE}/${id}`, { method: 'DELETE' }),
};
