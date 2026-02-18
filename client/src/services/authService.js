import { authClient } from '../http/authClient.js';

function register({ name, email, password }) {
  return authClient.post('/registration', { name, email, password });
}

function login({ name, email, password }) {
  return authClient.post('/login', { name, email, password });
}

function logout() {
  return authClient.post('/logout');
}

function activate(activationToken) {
  return authClient.get(`/activation/${activationToken}`);
}

function refresh() {
  return authClient.get('/refresh');
}

export const authService = { register, login, logout, activate, refresh };
