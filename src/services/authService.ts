import { authClient as client } from '../http/authClient';
import { User } from '../types/user';

export interface AuthData {
  accessToken: string;
  user: User;
}

export const authService = {
  register: (name: string, email: string, password: string) => {
    return client.post('/registration', { name, email, password });
  },

  activate: (token: string): Promise<AuthData> => {
    return client.get(`/activation/${encodeURIComponent(token)}`);
  },

  login: (email: string, password: string): Promise<AuthData> => {
    return client.post('/login', { email, password });
  },

  requestPasswordReset: (email: string) => {
    return client.post('/password-reset/request', { email });
  },

  resetPassword: (token: string, password: string, confirmPassword: string) => {
    return client.post('/password-reset/confirm', {
      token,
      password,
      confirmPassword,
    });
  },

  logout: () => client.post('/logout'),

  refresh: (): Promise<AuthData> => client.get('/refresh'),
};
