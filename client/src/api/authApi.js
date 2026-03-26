/**
 * API Client — Autenticação (Auth).
 *
 * Métodos disponíveis:
 * - register, login, logout
 * - activate (ativação de conta por token)
 * - refresh (renovação de access token)
 * - requestReset, confirmReset (redefinição de senha)
 * - getProfile, changeName, changePassword, changeEmail (perfil)
 *
 * Todas as chamadas usam credentials: 'include' para enviar
 * os cookies HTTP-only (accessToken/refreshToken) automaticamente.
 */
const AUTH_BASE = '/api/auth';
const PROFILE_BASE = '/api/profile';

async function request(url, options = {}) {
  let res;

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

  let data;

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
    const error = new Error(data.message || 'Erro na requisição');
    error.status = res.status;
    error.errors = data.errors || {};
    throw error;
  }

  return data;
}

export const authApi = {
  register: (name, email, password) =>
    request(`${AUTH_BASE}/register`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email, password) =>
    request(`${AUTH_BASE}/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    request(`${AUTH_BASE}/logout`, { method: 'POST' }),

  activate: (token) =>
    request(`${AUTH_BASE}/activate/${token}`),

  refresh: () =>
    request(`${AUTH_BASE}/refresh`),

  requestReset: (email) =>
    request(`${AUTH_BASE}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  confirmReset: (token, password, confirmation) =>
    request(`${AUTH_BASE}/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password, confirmation }),
    }),

  getProfile: () =>
    request(PROFILE_BASE),

  changeName: (name) =>
    request(`${PROFILE_BASE}/name`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    }),

  changePassword: (oldPassword, newPassword, confirmation) =>
    request(`${PROFILE_BASE}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ oldPassword, newPassword, confirmation }),
    }),

  changeEmail: (password, newEmail) =>
    request(`${PROFILE_BASE}/email`, {
      method: 'PATCH',
      body: JSON.stringify({ password, newEmail }),
    }),
};
