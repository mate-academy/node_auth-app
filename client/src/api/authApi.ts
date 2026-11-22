import { api } from './api';

const register = (name: string, email: string, password: string) => {
  return api.post('/registration', {
    name,
    email,
    password,
  });
};

const activate = (activationToken: string) => {
  return api.get(`/activation/${activationToken}`);
};

const login = (email: string, password: string) => {
  return api.post('/login', {
    email,
    password,
  });
};

export const authApi = {
  register,
  activate,
  login,
};
