import { client } from './client';

export const userApi = {
  updateName: (newName: string) => client.patch('/users/name', { newName }),

  updateEmail: (newEmail: string, password: string) =>
    client.patch('/users/email', { newEmail, password }),

  updatePassword: (oldPassword: string, newPassword: string) =>
    client.patch('/users/password', { oldPassword, newPassword }),
};
