import { httpClient } from '../http/httpClient.js';

function getAll() {
  return httpClient.get('/users');
}

function getMe() {
  return httpClient.get(`/users/me`);
}

function updateUserName({ name }) {
  return httpClient.put(`/users/me`, { name });
}

function updateEmail({ email, confirmation, password }) {
  return httpClient.patch(`/users/me/email`, { email, confirmation, password });
}

function activateChangeEmail({ token }) {
  return httpClient.get(`/users/me/changeEmail/activation/${token}`);
}

export const userService = {
  getAll,
  updateUser: updateUserName,
  getMe,
  updateEmail,
  activateChangeEmail,
};
