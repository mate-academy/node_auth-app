import { authClient as client } from '../http/authClient';
import type { User } from '@prisma/client';

interface AuthData {
  accessToken: string;
  user: User;
}

export const authService = {
  register: (name: string, email: string, password: string) => {
    return client.post('/registration', { name, email, password });
  },

  activate: (email: string, token: string): Promise<AuthData> => {
    return client.get(`/activation/${email}/${token}`);
  },

  login: (email: string, password: string): Promise<AuthData> => {
    return client.post('/login', { email, password });
  },

  refresh: (): Promise<AuthData> => client.get('/refresh'),

  logout: () => client.post('/logout'),

  requestPasswordReset: (email: string) => {
    return client.post('/request-password-reset', { email });
  },

  validateResetToken: (token: string) => {
    return client.get(`/reset-password/validate/${token}`);
  },

  resetPassword: (
    token: string,
    newPassword: string,
    confirmPassword: string,
  ) => {
    return client.post('/reset-password', {
      token,
      newPassword,
      confirmPassword,
    });
  },
};
