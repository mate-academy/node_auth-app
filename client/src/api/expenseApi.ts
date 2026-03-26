/**
 * API Client — Despesas (Expenses).
 *
 * Todas as chamadas usam credentials: 'include' para enviar
 * os cookies HTTP-only (accessToken) automaticamente.
 *
 * Base URL: /api/accounting/expenses (proxy Vite → :3000)
 */
const ACCOUNTING_BASE = '/api/accounting/expenses';

export interface ExpensePayload {
  title: string;
  amount: number;
  category?: string;
  spentAt: string;
  note?: string;
}

export interface ExpenseResponse extends ExpensePayload {
  id: number;
  userId: number;
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

export const expenseApi = {
  getAll: (query?: string) => request(`${ACCOUNTING_BASE}${query ? `?${query}` : ''}`),
  getById: (id: number) => request(`${ACCOUNTING_BASE}/${id}`),
  create: (payload: ExpensePayload) => request(ACCOUNTING_BASE, { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: number, payload: Partial<ExpensePayload>) => request(`${ACCOUNTING_BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  remove: (id: number) => request(`${ACCOUNTING_BASE}/${id}`, { method: 'DELETE' }),
};
