import axios from 'axios';
import { useAuthStore } from '../stores/auth.js';

const api = axios.create({
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const auth = useAuthStore();

  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const auth = useAuthStore();
    const original = error.config;

    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url.includes('/refresh')
    ) {
      original._retry = true;

      try {
        await auth.refresh();
        original.headers.Authorization = `Bearer ${auth.accessToken}`;

        return api(original);
      } catch {
        auth.logout();
      }
    }

    return Promise.reject(error);
  },
);

export default api;
