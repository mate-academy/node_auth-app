import { httpClient } from '../http/httpClient';

interface UpdatePasswordData {
  oldPassword?: string;
  newPassword?: string;
}

interface UpdateEmailData {
  newEmail: string;
  password?: string;
}

export const userService = {
  updateName: (name: string): Promise<void> => {
    return httpClient.patch('/users/profile', { name });
  },

  updateEmail: (data: UpdateEmailData): Promise<void> => {
    return httpClient.patch('/users/profile/email', data);
  },

  updatePassword: (data: UpdatePasswordData): Promise<void> => {
    return httpClient.patch('/users/profile/password', data);
  }
};