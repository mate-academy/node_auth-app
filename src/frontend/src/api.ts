const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const ACCESS_TOKEN_KEY = 'accessToken';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export type ApiError = {
  message: string;
  errors?: Record<string, string>;
};

export type SocialAccount = {
  provider: string;
};

export type MeResponse = {
  id: number;
  name: string;
  email: string;
  hasPassword: boolean;
  socialAccounts: SocialAccount[];
};

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const token = getAccessToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw data as ApiError;
  }

  return data as T;
}

export function register(body: {
  name: string;
  email: string;
  password: string;
}) {
  return request<{ message: string }>('/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function login(body: { email: string; password: string }) {
  return request<{ accessToken: string }>('/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function logout() {
  return request<{ message: string }>('/logout', {
    method: 'POST',
  });
}

export function requestPasswordReset(body: { email: string }) {
  return request<{ message: string }>('/password-reset', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function confirmPasswordReset(body: {
  token: string;
  password: string;
}) {
  return request<{ message: string }>('/password-reset/confirm', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function fetchMe() {
  return request<MeResponse>('/users/me');
}

export function changePassword(body: {
  oldPassword: string;
  newPassword: string;
}) {
  return request<{ message: string }>('/users/me/password', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function changeName(body: { newName: string }) {
  return request<{ message: string }>('/users/me/name', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function changeEmail(body: {
  password: string;
  newEmail: string;
}) {
  return request<{ message: string }>('/users/me/email', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function startGithubAuthentication() {
  return request<{ url: string }>('/auth/github/start', {
    method: 'POST',
  });
}

export function startGithubLink() {
  return request<{ url: string }>('/auth/github/link/start', {
    method: 'POST',
  });
}

export function removeGithubAccount() {
  return request<{ message: string }>('/users/me/social-accounts/github', {
    method: 'DELETE',
  });
}
