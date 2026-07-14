import { createClient } from './createClient';
import { accessTokenService } from '@/services/accessTokenService.js';
import { AxiosInterceptorRejected } from 'node_modules/axios/index.cjs';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { authService } from './authClient';

export const httpClient = createClient();

httpClient.interceptors.request.use(onRequest);
httpClient.interceptors.response.use(onResponseSuccess, onResponseError);

function onRequest(request: InternalAxiosRequestConfig) {
  const accessToken = accessTokenService.get();

  if (accessToken) {
    request.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return request;
}

function onResponseSuccess(res: AxiosResponse) {
  return res.data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function onResponseError(error: any): Promise<AxiosInterceptorRejected> {
  const originalRequest = error.config;

  if (error.response.status !== 401) {
    throw error;
  }

  try {
    const { accessToken } = await authService.refresh();

    accessTokenService.save(accessToken);

    return httpClient.request(originalRequest);
  } catch (error) {
    console.log('User is not authentincated ' + error);
    throw error;
  }
}
