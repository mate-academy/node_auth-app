import { httpClient } from '../http/httpClient';
import type { User } from '../types/user';

export const userService = {
  getAll: (): Promise<User[]> => httpClient.get('/users'),

  getMe: (): Promise<User> => httpClient.get('/users/me'),

  updateProfile: (name: string): Promise<User> =>
    httpClient.patch('/users/me', { name }),

  updatePassword: (
    oldPassword: string,
    newPassword: string,
    confirmation: string,
  ): Promise<User> =>
    httpClient.patch('/users/me/password', {
      oldPassword,
      newPassword,
      confirmation,
    }),

  requestEmailChange: (
    password: string,
    newEmail: string,
  ): Promise<{ message: string }> =>
    httpClient.patch('/users/me/email', {
      password,
      newEmail,
    }),
};
