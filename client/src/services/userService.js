import { authClient } from '../http/auth';

function getAll() {
  return authClient.get('/users');
}

export const userService = { getAll };
