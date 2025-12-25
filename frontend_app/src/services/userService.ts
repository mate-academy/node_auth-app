import { httpClient } from '../http/httpClient';
import type { User } from '../types/user';


export const userService = {
  getAll: (): Promise<User[]> => httpClient.get('/users'),
};