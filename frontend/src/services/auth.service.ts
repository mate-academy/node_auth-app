import { api } from './api.client';

// Інтерфейс профілю для оновлення
interface ProfileUpdateData {
  name?: string;
  oldPassword?: string;
  newPassword?: string;
  confirmation?: string;
  newEmail?: string;
  password?: string;
}

// Загальний інтерфейс відповіді (якщо бекенд повертає об'єкт)
interface AuthResponse {
  [key: string]: object;
}

export const authService = {
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/register', { name, email, password });
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/login', { email, password });
    return data;
  },

  logout: async (): Promise<AuthResponse> => {
    const { data } = await api.post('/logout');
    return data;
  },

  updateProfile: async (profileData: ProfileUpdateData): Promise<AuthResponse> => {
    const { data } = await api.patch('/profile/update', profileData);
    return data;
  },

  forgotPassword: async (email: string): Promise<AuthResponse> => {
    const { data } = await api.post('/forgot-password', { email });
    return data;
  },

  activation: async (email: string, token: string): Promise<AuthResponse> => {
    const { data } = await api.get(`/auth/activation/${email}/${token}`);
    return data;
  },

  resetPassword: async (token: string, password: string, confirmation: string): Promise<AuthResponse> => {
    const { data } = await api.post('/reset-password', { token, password, confirmation });
    return data;
  }
};
