/* eslint-disable @typescript-eslint/no-unused-vars */
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { Store } from '@reduxjs/toolkit';

const API_URL = 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Інтерфейс для помилки бекенду
interface BackendError {
  response?: {
    status: number;
  };
}

export const setupInterceptors = (store: Store) => {
  api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const state = store.getState() as { auth: { accessToken: string | null } };
    const token = state.auth.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      const err = error as BackendError;

      if (err.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const { data } = await axios.get(`${API_URL}/refresh`, {
            withCredentials: true,
          });

          store.dispatch({ type: 'auth/setCredentials', payload: data });
          return api.request(originalRequest);
        } catch (refreshError) {
          store.dispatch({ type: 'auth/logoutLocal' });
        }
      }
      return Promise.reject(error);
    }
  );
};
