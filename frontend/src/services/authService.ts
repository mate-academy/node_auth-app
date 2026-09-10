import { authClient as client } from '../http/authClient';
import { User } from '../types/user';

interface AuthData {
  accessToken: string;
  user: User;
}

export const authService = {
  register: (name: string, email: string, password: string) => {
    return client.post('/registration', {name, email, password });
  },

  activate: (email: string, token: string): Promise<AuthData> => {
    return client.get(`/activation/${email}/${token}`);
  },

  login: (email: string, password: string): Promise<AuthData> => {
    return client.post('/login', { email, password });
  },

  logout: () => client.post('/logout'),

  refresh: (): Promise<AuthData> => client.get('/refresh'),

  requestPasswordReset(email: string): Promise<void> {
    return client.post('/forgot-password', { email });
  },

  confirmPasswordReset(token: string, password: string): Promise<void> {
  return client.post('/reset-password', { token, password });
}
};
