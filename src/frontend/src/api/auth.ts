import { client } from './client.ts';

export const authApi = {
  register: (data: { email: string; password: string; name?: string }) =>
    client.post('/register', data),

  login: (data: { email: string; password: string }) =>
    client.post('/login', data),

  logout: () => client.post('/logout'),

  refresh: () => client.get('/refresh'),

  activate: (token: string) => client.get(`/activation?token=${token}`),

  requestPasswordReset: (email: string) =>
    client.post('/password-reset', { email }),

  confirmPasswordReset: (token: string, newPassword: string) =>
    client.post('/password-reset/confirm', { token, newPassword }),
};
