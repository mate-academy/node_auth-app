import { api } from './api';

const register = (name: string, email: string, password: string) => {
  return api.post('/registration', {
    name,
    email,
    password,
  });
};

const activate = (activationToken: string) => {
  return api.get(`/activation/${activationToken}`)
};

export const authApi = {
  register,
  activate,
};
