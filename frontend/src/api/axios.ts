import axios from 'axios';

export const privateAxiosInstance = axios.create({
  baseURL: 'http://localhost:3005',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const publicAxiosInstance = axios.create({
  baseURL: 'http://localhost:3005',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

privateAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Якщо запит до /refresh не пройшов — більше не пробуємо
    if (error.response.status === 401 && originalRequest.url === '/refresh') {
      console.error('Token refresh failed. Redirecting to login.');
      return Promise.reject(error);
    }

    // Якщо 401 отримано на іншому запиті — пробуємо оновити токен
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.get('http://localhost:3005/refresh', {
          withCredentials: true,
        });
        return privateAxiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
