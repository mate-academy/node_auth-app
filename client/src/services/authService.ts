import { authClient } from '../http/authClient';
import type { AuthData } from '../types/authData';

export const authService = {
  register: (name: string, email: string, password: string) => {
    return authClient.post('/registration', { name, email, password });
  },

  activate: (email: string, token: string): Promise<AuthData> => {
    return authClient.get(`/activation/${email}/${token}`);
  },

  login: (email: string, password: string): Promise<AuthData> => {
    return authClient.post('/login', { email, password });
  },

  forgotPassword: (email: string) => {
    return authClient.post(`/forgot-password`, { email });
  },

  resetPassword: (token: string, password: string) => {
    return authClient.post(`/reset-password/${token}`, { password });
  },

  confirmEmailChange: (token: string) =>
    authClient.get(`/email-confirmation/${token}`),

  logout: () => authClient.post('/logout'),

  refresh: (): Promise<AuthData> => authClient.get('/refresh'),
};
