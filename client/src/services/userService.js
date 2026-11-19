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

function updateEmail({ email, password }) {
  return httpClient.patch(`/users/me/email`, { email, password });
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
