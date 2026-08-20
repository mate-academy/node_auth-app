import axios from 'axios';

const ACCESS_TOKEN_KEY = 'AccessToken';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRoute =
      originalRequest.url?.includes('/auth/sessions') ||
      originalRequest.url?.includes('/auth/registration') ||
      originalRequest.url?.includes('/auth/sessions/tokens') ||
      originalRequest.url?.includes('/password-resets');

    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/sessions/tokens`,
          {},
          { withCredentials: true },
        );

        if (data.accessToken) {
          localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
