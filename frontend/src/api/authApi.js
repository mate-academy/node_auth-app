import { client } from './client';

export const authApi = {
  register: (name, email, password) =>
    client.post('/auth/registration', { name, email, password }),

  activate: (token) =>
    client.get(`/auth/activate/${token}`),

  login: (email, password) =>
    client.post('/auth/login', { email, password }),

  logout: () =>
    client.get('/auth/logout'),

  refresh: () =>
    client.get('/auth/refresh'),

  forgotPassword: (email) =>
    client.post('/auth/forgot-password', { email }),

  resetPassword: (token, password) =>
    client.post(`/auth/reset-password/${token}`, { password }),
};
