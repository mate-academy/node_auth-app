import { httpClient } from '../http/httpClient.js';

function getAll() {
  return httpClient.get('/users');
}

export const userService = { getAll };
