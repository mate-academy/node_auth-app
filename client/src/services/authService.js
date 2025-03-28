import { authClient } from '../http/authClient.js';

function register({ name, email, password }) {
  return authClient.post('/registration', { name, email, password });
}

function login({ email, password }) {
  return authClient.post('/login', { email, password });
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

function resetPasswordRequest({ email }) {
  return authClient.post('/reset-password', { email });
}

function changePassword({ password, confirmation, resetToken }) {
  return authClient.post(`/reset-password/${resetToken}`, {
    password,
    confirmation,
  });
}

export const authService = {
  register,
  login,
  logout,
  activate,
  refresh,
  resetPasswordRequest,
  changePassword,
};
