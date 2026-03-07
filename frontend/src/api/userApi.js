import { client } from './client';

export const userApi = {
  getAll: () => client.get('/users'),

  changePassword: (password, newPassword) =>
    client.patch('/users/password', { password, newPassword }),

  changeEmail: (password, newEmail) =>
    client.patch('/users/email', { password, newEmail }),

  updateName: (name) =>
    client.patch('/users/name', { name }),
};
