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

const MAX_RETRY_ATTEMPT = 3;
const RETRY_DELAY = 1000;

async function onResponseError(error) {
  const originalRequest = error.config;
  let retryCount = 0;

  if (!error.response || error.response.status !== 401) {
    throw error;
  }

  while (retryCount < MAX_RETRY_ATTEMPT) {
    try {
      const { accessToken } = await authService.refresh();
      accessTokenService.save(accessToken);

      return httpClient.request(originalRequest);
    } catch (err) {
      retryCount++;
      if (retryCount >= MAX_RETRY_ATTEMPT) {
        throw new Error('Max retry attempts reached');
      }

      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
}


