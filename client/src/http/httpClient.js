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

  // Not a 401 (or no response at all) - nothing to refresh
  if (error.response?.status !== 401) {
    throw error;
  }

  // This request was already retried once after a refresh.
  // A second 401 means the session is really gone - stop here
  // instead of refreshing and retrying forever.
  if (originalRequest._isRetry) {
    throw error;
  }

  originalRequest._isRetry = true;

  const { accessToken } = await authService.refresh();

  accessTokenService.save(accessToken);

  return httpClient.request(originalRequest);
}
