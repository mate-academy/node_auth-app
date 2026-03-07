import axios from 'axios';

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3005',
  withCredentials: true,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.get('/auth/refresh', {
          baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3005',
          withCredentials: true,
        });

        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return client(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');

        if (!originalRequest.url.includes('/auth/refresh')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  },
);
