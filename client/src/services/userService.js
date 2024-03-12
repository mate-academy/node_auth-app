import { httpClient } from '../http/httpClient';

function getAll() {
  return httpClient.get('/users');
}

export const userService = { getAll };
