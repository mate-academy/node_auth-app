/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
'use strict';

const API_BASE = 'http://localhost:3005';

const session = {
  getToken() {
    return localStorage.getItem('accessToken');
  },

  getUser() {
    const raw = localStorage.getItem('user');

    return raw ? JSON.parse(raw) : null;
  },

  set(user, accessToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
  },

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  clear() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },
};

/**
 * @param {string} path
 * @param {object} [options]
 * @param {string} [options.method='POST']
 * @param {object} [options.body]
 * @param {boolean} [options.auth=false]
 */
async function apiRequest(path, { method = 'POST', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = session.getToken();

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  return { ok: res.ok, status: res.status, data };
}
