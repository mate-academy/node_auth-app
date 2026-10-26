import { httpClient } from '../http/httpClient';
import { User } from '../types/user';
import { AuthData } from './authService';

export const userService = {
  getAll: (): Promise<User[]> => httpClient.get('/users'),

  updateName: (name: string): Promise<User> =>
    httpClient.patch('/users/name', { name }),

  updateEmail: (
    password: string,
    email: string,
    confirmEmail: string,
  ): Promise<AuthData> =>
    httpClient.patch('/users/email', { password, email, confirmEmail }),

  updatePassword: (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<User> =>
    httpClient.patch('/users/password', {
      currentPassword,
      newPassword,
      confirmPassword,
    }),
};
