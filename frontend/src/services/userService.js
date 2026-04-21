import { httpClient } from '../http/httpClient.js';

function getAll() {
  return httpClient.get('/users');
}

function changeName(name) {
  return httpClient.patch('/users/name', { name });
}

function changePassword(oldPassword, newPassword, confirmation) {
  return httpClient.patch('/users/password', {
    oldPassword,
    newPassword,
    confirmation,
  });
}

function changeEmail(password, email) {
  return httpClient.patch('/users/email', { password, email });
}

export const userService = { getAll, changeName, changePassword, changeEmail };
