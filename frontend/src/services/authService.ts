import type { User } from '../../types/User';
import { authClient } from '../http/authClient';

interface GenerateTokensResponse {
  user: User;
  accessToken: string;
}

function register(
  name: string,
  email: string,
  password: string,
): Promise<{ message: string }> {
  return authClient.post<{ message: string }>('/registration', {
    name,
    email,
    password,
  });
}

function login(
  email: string,
  password: string,
): Promise<GenerateTokensResponse> {
  return authClient.post<GenerateTokensResponse>('/login', { email, password });
}

function logout(): Promise<void> {
  return authClient.post<void>('/logout');
}

function activate(activationToken: string): Promise<GenerateTokensResponse> {
  return authClient.get<GenerateTokensResponse>(
    `/activation/${activationToken}`,
  );
}

function refresh(): Promise<GenerateTokensResponse> {
  return authClient.get<GenerateTokensResponse>('/refresh');
}

function forgotPassword(email: string): Promise<void> {
  return authClient.post<void>('/forgot-password', { email });
}

function resetPassword(resetToken: string, password: string): Promise<void> {
  return authClient.post<void>('/reset-password', { resetToken, password });
}

function changeEmail(securityToken: string): Promise<{ message: string }> {
  return authClient.patch<{ message: string }>('/change-email', {
    securityToken,
  });
}

export const authService = {
  register,
  login,
  logout,
  activate,
  refresh,
  forgotPassword,
  resetPassword,
  changeEmail,
};
