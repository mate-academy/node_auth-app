import { httpClient } from '../http/httpClient.js';

function getAll() {
  return httpClient.get('/users');
}

function changeName({ userId, newName }) {
  return httpClient.post(`/users/change_name/${userId}`, { newName });
}

function changeUserPassword({ userId, oldPassword, password, confirmation }) {
  return httpClient.post(`/users/change_password/${userId}`, {
    oldPassword,
    password,
    confirmation,
  });
}

function changeEmail({ userId, newEmail, password }) {
  return httpClient.post(`/users/change_email/${userId}`, {
    newEmail,
    password,
  });
}

export const userService = {
  getAll,
  changeName,
  changeUserPassword,
  changeEmail,
};
