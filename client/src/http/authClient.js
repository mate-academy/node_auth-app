import { createClient } from './index.js';

export const authClient = createClient();

authClient.interceptors.response.use(res => res.data);

authClient.interceptors.request.use(onRequest);

function onRequest(request) {
  const accessToken = localStorage.getItem('accessToken');

  if (accessToken) {
    request.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return request;
}
