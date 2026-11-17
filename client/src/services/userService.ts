import { httpClient } from '../http/httpClient';
import { User } from '../types/user';

export const userService = {
  getAll: (): Promise<User[]> => httpClient.get('/users'),

  getAuthentificatedUser: (): Promise<User> => httpClient.get('/profile'),

  updateName: (name: string) => httpClient.patch('/profile/name', { name }),

  updatePassword: (
    oldPassword: string,
    newPassword: string,
    confirmation: string
  ) => httpClient.patch('/profile/password', { oldPassword, newPassword, confirmation }),

  updateEmail: (
    newEmail: string,
    password: string,
    emailConfirmation: string
  ) => httpClient.patch('/profile/email', { newEmail, password, emailConfirmation }),
};

