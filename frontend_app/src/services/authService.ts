import { authClient as client } from '../http/authClient';
import { httpClient } from '../http/httpClient';
import type { User } from '../types/user';

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

  logout: () => client.post('/logout'),

  refresh: (): Promise<AuthData> => client.get('/refresh'),

  requestPasswordReset: (email: string) => {
    return client.post("/password-reset", { email });
  },

  confirmPasswordReset: (token: string, password: string, confirmPassword: string) => {
    return client.post(`/password-reset/confirm/${token}`, { password, confirmPassword });
  },

  changeName: (name: string): Promise<User> => {
    return httpClient.patch("/profile/name", { name });
  },

  changePassword: (
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<void> => {
    return httpClient.patch("/profile/password", {
      oldPassword,
      newPassword,
      confirmPassword
    });
  },

  changeEmail: (
    password: string,
    newEmail: string,
    confirmEmail: string,
  ): Promise<void> => {
    return httpClient.patch("/profile/email", {
      password,
      newEmail,
      confirmEmail
    });
  },
};