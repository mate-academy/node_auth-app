import type { User } from '../types/User';
import { api } from './api';

const register = (name: string, email: string, password: string) => {
  return api.post('/registration', {
    name,
    email,
    password,
  });
};

const activate = (activationToken: string) => {
  return api.get(`/activation/${activationToken}`);
};

export type AuthResponse = {
  user: User;
  accessToken: string;
};

const login = (email: string, password: string) => {
  return api.post<AuthResponse>('/login', {
    email,
    password,
  });
};

const refresh = () => {
  return api.get<AuthResponse>('/refresh')
};

const logOut = () => {
  return api.post('/logout');
};

export const authApi = {
  register,
  activate,
  login,
  refresh,
  logOut,
};
