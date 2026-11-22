import { api } from './api';

const register = (name: string, email: string, password: string) => {
  return api.post('/registration', {
    name,
    email,
    password,
  });
};

export const authApi = {
  register,
};
