import type { User } from '../types/User';
import { api } from './api';

export type AuthResponse = {
  user: User;
  accessToken: string;
};

const register = (name: string, email: string, password: string) => {
  return api.post('/registration', {
    name,
    email,
    password,
  });
};

const activate = (activationToken: string) => {
  return api.patch<AuthResponse>(`/activation/${activationToken}`);
};

const login = (email: string, password: string) => {
  return api.post<AuthResponse>('/login', {
    email,
    password,
  });
};

const refresh = () => {
  return api.get<AuthResponse>('/refresh');
};

const logOut = () => {
  return api.post('/logout');
};

const confirmEmail = (resetEmailToken: string) => {
  return api.patch<User>(`/change-email/${resetEmailToken}`);
};

const forgotPassword = (email: string) => {
  return api.post('/forgot-password', { email });
};

const resetPassword = (password: string, confirmation: string, resetToken: string) => {
  return api.patch(`/reset-password/${resetToken}`, {password, confirmation});
};

export const authApi = {
  register,
  activate,
  login,
  refresh,
  logOut,
  confirmEmail,
  forgotPassword,
  resetPassword,
};
