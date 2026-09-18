import { authClient } from '../http/authClient.js';

function register({ email, userName, password }) {
  return authClient.post('/registration', { email, userName, password });
}

function login({ email, password }) {
  return authClient.post('/login', { email, password });
}

function logout() {
  return authClient.post('/logout');
}

function activate(activationToken) {
  return authClient.get(`/activate/${activationToken}`);
}

function refresh() {
  return authClient.get('/refresh');
}

const sendPassResetLink = ({ email }) => {
  return authClient.post('/auth/forgot-password', { email });
};

const resetPassword = ({ resetToken, password, confirmation }) => {
  return authClient.post('/auth/reset-password', {
    resetToken,
    password,
    confirmation,
  });
};

export const authService = {
  register,
  login,
  logout,
  activate,
  refresh,
  sendPassResetLink,
  resetPassword,
};
