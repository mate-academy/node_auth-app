import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const AUTH_SKIP_PATHS = [
  '/api/auth/refresh',
  '/api/auth/sign-in',
  '/api/auth/sign-out',
  '/api/auth/register',
  '/api/auth/activate',
  '/api/auth/google',
] as const;

export const REFRESH_URL = '/api/auth/refresh';

export const api = axios.create({
  withCredentials: true,
});

let isRefreshing = false;
let interceptorsRegistered = false;

let sessionInvalid = false;
let failedQueue: {
  resolve: () => void;
  reject: (error: unknown) => void;
}[] = [];

export function resetSessionState() {
  sessionInvalid = false;
  isRefreshing = false;
  failedQueue = [];
}

function processQueue(error: unknown | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  failedQueue = [];
}

export function getRequestPath(config: InternalAxiosRequestConfig): string {
  const raw = config.url ?? '';
  if (!raw) return '';

  if (raw.startsWith('http')) {
    try {
      return new URL(raw).pathname;
    } catch {
      return raw.split('?')[0] ?? '';
    }
  }

  return raw.split('?')[0] ?? '';
}

export function shouldSkipRefresh(config: InternalAxiosRequestConfig): boolean {
  const path = getRequestPath(config);
  if (!path) return false;
  return AUTH_SKIP_PATHS.some((skip) => path.includes(skip));
}

function isUnauthorizedStatus(status?: number) {
  return status === 401 || status === 403;
}

async function onSessionExpired() {
  if (typeof window === 'undefined') return;

  const path = window.location.pathname;
  if (path.startsWith('/sign-in') || path.startsWith('/sign-up')) return;

  try {
    await api.get('/api/auth/sign-out');
  } catch (err) {
    console.error(err);
  }

  window.location.href = '/sign-in';
}

function markSessionInvalid() {
  sessionInvalid = true;
  processQueue(new Error('Session expired'));
}

export function registerApiInterceptors() {
  if (interceptorsRegistered) return;
  interceptorsRegistered = true;

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableConfig | undefined;
      const status = error.response?.status;

      if (sessionInvalid) {
        return Promise.reject(error);
      }

      if (
        !isUnauthorizedStatus(status) ||
        !originalRequest ||
        originalRequest._retry ||
        shouldSkipRefresh(originalRequest)
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.get(REFRESH_URL);
        processQueue(null);
        return await api(originalRequest);
      } catch (refreshError) {
        markSessionInvalid();
        await onSessionExpired();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );
}
