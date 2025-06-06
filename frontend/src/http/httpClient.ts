import axios, { AxiosError } from 'axios';
import { authService } from '../services/authService';
import { accessTokenService } from '../services/accessTokenService';

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  withCredentials: true,
});

// add `Authorization` header to all requests
httpClient.interceptors.request.use(request => {
  const accessToken = localStorage.getItem('accessToken');

  if (accessToken) {
    request.headers.Authorization = `Bearer ${accessToken}`;
  }

  return request;
});

httpClient.interceptors.response.use(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  res => res.data,

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
