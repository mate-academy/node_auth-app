import axios from 'axios';
import { accessTokenService } from '../utils/accessTokenService';

export const api = axios.create({
  baseURL: 'http://localhost:3005',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const accessToken = accessTokenService.get();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});
