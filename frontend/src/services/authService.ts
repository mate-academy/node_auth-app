import { authClient as client } from '../http/authClient';
import { User } from '../types/user';

interface AuthData {
  accessToken: string;
  user: User;
  redirectUrl?: string;
}

export const authService = {
  register: (name: string, email: string, password: string) => {
    return client.post('/registration', { name, email, password });
  },

  activate: (token: string): Promise<AuthData> => {
    return client.get(`/activation/${token}`);
  },

  login: (email: string, password: string): Promise<AuthData> => {
    return client.post('/login', { email, password });
  },

  logout: () => client.post('/logout'),

  refresh: (): Promise<AuthData> => client.get('/refresh'),

  requestPasswordReset: (email: string) => {
    return client.post('/password-reset', { email });
  },

  resetPassword: (token: string, password: string) => {
    return client.post(`/password-reset/${token}`, { password });
  },
};
