import { httpClient } from '../http/httpClient';
import { User } from '../types/user';

export const userService = {
  getAll: (): Promise<User[]> => httpClient.get('/users'),

  updateName: (name: string) => {
    return httpClient.put('/profile/name', { name });
  },

  updatePassword: (oldPassword: string, newPassword: string) => {
    return httpClient.put('/profile/password', { oldPassword, newPassword });
  },

  updateEmail: (password: string, newEmail: string) => {
    return httpClient.put('/profile/email', { password, newEmail });
  },
};
