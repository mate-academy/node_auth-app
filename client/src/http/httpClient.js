import { createClient } from './index.js';
import { authService } from '../services/authService.js';
import { accessTokenService } from '../services/accessTokenService.js';

export const httpClient = createClient();

httpClient.interceptors.request.use(onRequest);
httpClient.interceptors.response.use(onResponseSuccess, onResponseError);

function onRequest(request) {
  const accessToken = localStorage.getItem('accessToken');

  if (accessToken) {
    request.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return request;
}

function onResponseSuccess(res) {
  return res.data;
}

async function onResponseError(error) {
  const originalRequest = error.config;

  if (error.response.status !== 401) {
    throw error;
  }

  try {
    const { accessToken } = await authService.refresh();

    accessTokenService.save(accessToken);

    return httpClient.request(originalRequest);
  } catch (error) {
    throw error;
  }
}
