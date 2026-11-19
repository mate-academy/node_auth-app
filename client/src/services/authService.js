import { authClient } from '../http/authClient.js';

function register({ email, password, name }) {
  return authClient.post('/registration', { email, password, name });
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

function password({ oldPassword, password, confirmPassword }) {
  return authClient.patch('/password', {
    oldPassword,
    password,
    confirmPassword,
  });
}

function resetPassword({ email }) {
  return authClient.post('/reset-password', { email });
}

function resetPasswordConfirm({ password, confirmPassword, token }) {
  return authClient.patch('/reset-password', {
    password,
    confirmPassword,
    token,
  });
}

export const authService = {
  register,
  login,
  logout,
  activate,
  refresh,
  password,
  resetPassword,
  resetPasswordConfirm,
};
