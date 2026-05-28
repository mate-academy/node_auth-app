import { authClient as client } from '../http/authClient';
import { User } from '../types/user';

interface AuthData {
  accessToken: string;
  user: User;
}

export const authService = {
  register: (email: string, password: string) => {
    return client.post('/registration', { email, password });
  },

  activate: (email: string, token: string): Promise<AuthData> => {
    return client.get(`/activation/${email}/${token}`);
  },

  login: (email: string, password: string): Promise<AuthData> => {
    return client.post('/login', { email, password });
  },

  logout: () => client.post('/logout'),

  refresh: (): Promise<AuthData> => client.get('/refresh'),
};
