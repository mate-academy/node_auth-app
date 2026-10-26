import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authService } from '../services/authService';
import { accessTokenService } from '../services/accessTokenService';

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  withCredentials: true,
});

// add `Authorization` header to all requests
httpClient.interceptors.request.use((request) => {
  const accessToken = accessTokenService.get();

  if (accessToken) {
    request.headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return request;
});

httpClient.interceptors.response.use(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  (res) => res.data,

  // retry request after refreshing access token
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      !originalRequest
    ) {
      throw error;
    }

    originalRequest._retry = true;

    const { accessToken } = await authService.refresh();

    accessTokenService.save(accessToken);

    return httpClient.request(originalRequest!);
  },
);
