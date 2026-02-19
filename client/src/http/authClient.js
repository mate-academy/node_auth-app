import { createClient } from './index.js';

export const authClient = createClient();

authClient.interceptors.response.use(
  res => res.data,
  error => {
    return Promise.reject(error);
  }
);
