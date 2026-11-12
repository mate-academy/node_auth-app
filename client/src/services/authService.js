import { authClient } from '../http/authClient.js';

function register({ name, email, password }) {
  return authClient.post('/auth/registration', { name, email, password });
}

function login({ email, password }) {
  return authClient.post('/auth/login', { email, password });
}

function logout() {
  return authClient.post('/auth/logout');
}

function activate(email, token) {
  return authClient.get(`/auth/activate/${email}/${token}`);
}

function refresh() {
  return authClient.get('/auth/refresh');
}

function resetRequest(email) {
  return authClient.post('/auth/reset-request', { email });
}

function resetPassword({ email, token, password, confirmation }) {
  return authClient.post('/auth/reset-password', {
    email,
    token,
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
  resetRequest,
  resetPassword,
};
