import { request } from './http';

export const registerUser = ({ name, email, password }) =>
  request('/register', { method: 'POST', body: { name, email, password } });

export const loginUser = ({ email, password }) =>
  request('/login', { method: 'POST', body: { email, password } });
