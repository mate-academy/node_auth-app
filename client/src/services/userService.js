import { httpClient } from '../http/httpClient.js';

function getAll() {
  return httpClient.get('/users');
}

function updateName(name) {
  return httpClient.patch('/profile/update-name', { name });
}

function updatePassword({ oldPassword, newPassword }) {
  return httpClient.patch('/profile/update-password', { oldPassword, newPassword });
}

function requestEmailChange(data) {
  return httpClient.patch('/profile/request-email-change', data);
}

function confirmEmailChange(activationToken) {
  return httpClient.get(`/profile/confirm-email-change/${activationToken}`);
}

function forgotPassword(email) {
  return httpClient.post('/forgot-password', { email });
}

function resetPassword(activationToken, password) {
  return httpClient.post('/reset-password', { activationToken, password });
}


export const userService = {
  getAll,
  updateName,
  updatePassword,
  requestEmailChange,
  confirmEmailChange,
  forgotPassword,
  resetPassword,
};
