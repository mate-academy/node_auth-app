import axios from 'axios';

export const client = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true,
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/refresh')
    ) {
      originalRequest._retry = true;

      try {
        const { data } = await client.get('/refresh');

        originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
        client.defaults.headers['Authorization'] = `Bearer ${data.token}`;

        return client(originalRequest);
      } catch {
        window.location.href = '/login';

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
