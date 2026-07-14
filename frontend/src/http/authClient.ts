import { AuthUser } from '@/shared/type';
import { createClient } from './createClient';

const authClient = createClient();

authClient.interceptors.response.use((res) => res.data);

import { httpClient } from './httpClient';

function getMe(): Promise<{ user: AuthUser }> {
  return httpClient.get('/auth/me');
}

function register({
  email,
  password,
  firstName,
  lastName,
}: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  return authClient.post('/auth/register', { email, password, firstName, lastName });
}

function login({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{ accessToken: string; user: AuthUser }> {
  return authClient.post('/auth/login', { email, password });
}

function logout() {
  return authClient.post('/auth/logout');
}

function activate(
  activationToken: string,
): Promise<{ accessToken: string; user: AuthUser; message: string }> {
  console.log('activate');

  return authClient.get(`/auth/activation/${activationToken}`);
}

function forgetPassword(
  email: string,
): Promise<{ message: string; error?: Record<string, string> }> {
  return authClient.post(`/auth/forget-password`, email);
}

function resetPassword(
  newPassword: string,
  newPasswordConfirm: string,
  token: string,
): Promise<{ message: string; error?: Record<string, string> }> {
  return authClient.post(`/auth/reset-password`, { newPassword, newPasswordConfirm, token });
}

function refresh(): Promise<{ accessToken: string; user: AuthUser }> {
  console.log('refresh');

  return authClient.get('/auth/refresh');
}

export const authService = {
  register,
  login,
  logout,
  activate,
  refresh,
  getMe,
  forgetPassword,
  resetPassword,
};
