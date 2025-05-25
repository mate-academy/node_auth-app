import axios, { AxiosError } from 'axios';
import { authService } from '../services/authService';
import { accessTokenService } from '../services/accessTokenService';

// Extend ImportMeta globally to include 'env'
declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // add other env variables here if needed
}

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  withCredentials: true,
});

// add `Authorization` header to all requests
httpClient.interceptors.request.use((request) => {
  const accessToken = accessTokenService.get();

  if (accessToken) {
    request.headers.Authorization = `Bearer ${accessToken}`;
  }

  return request;
});

httpClient.interceptors.response.use(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  (res) => res.data,

  // retry request after refreshing access token
  async (error: AxiosError) => {
    if (error.response?.status !== 401) {
      throw error;
    }

    const originalRequest = error.config;
    const { accessToken } = await authService.refresh();

    accessTokenService.save(accessToken);

    return httpClient.request(originalRequest!);
  },
);
