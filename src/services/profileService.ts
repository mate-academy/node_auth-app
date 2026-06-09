import { httpClient } from '../http/httpClient';
import { User } from '../types/user';

export const profileService = {
  updateName: (userId: string, name: string): Promise<{ user: User }> => {
    return httpClient.patch('/profile/name', { userId, name });
  },

  updatePassword: (
    userId: string,
    oldPassword: string,
    newPassword: string,
    confirmation: string,
  ): Promise<{ user: User }> => {
    return httpClient.patch('/profile/password', {
      userId,
      oldPassword,
      newPassword,
      confirmation,
    });
  },

  updateEmail: (
    userId: string,
    password: string,
    email: string,
  ): Promise<{ user: User }> => {
    return httpClient.patch('/profile/email', {
      userId,
      password,
      email,
    });
  },
};
