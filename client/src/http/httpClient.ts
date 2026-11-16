import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authService } from '../services/authService';
import { accessTokenService } from '../services/accessTokenService';

type RetryRequestConfig = InternalAxiosRequestConfig & {
  isRetry?: boolean;
};

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  withCredentials: true,
});

// add `Authorization` header to all requests
httpClient.interceptors.request.use(request => {
  const accessToken = accessTokenService.get();

  if (accessToken) {
    request.headers.Authorization = `Bearer ${accessToken}`;
  }

  return request;
});

let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = authService
      .refresh()
      .then(({ accessToken }) => {
        accessTokenService.save(accessToken);
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  await refreshPromise;
}

httpClient.interceptors.response.use(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  res => res.data,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig | undefined;

    if (error.response?.status !== 401 || !originalRequest) {
      throw error;
    }

    if (originalRequest.isRetry) {
      throw error;
    }

    originalRequest.isRetry = true;

    try {
      await refreshAccessToken();
    } catch (refreshError) {
      accessTokenService.remove();
      window.location.href = '/login';

      throw refreshError;
    }

    return httpClient.request(originalRequest!);
  },
);
