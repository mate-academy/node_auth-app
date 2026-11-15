import { httpClient } from '../http/httpClient.js';

function changeName(name) {
  return httpClient.patch('/profile/name', { name });
}

function changePassword({ oldPassword, newPassword, confirmation }) {
  return httpClient.patch('/profile/password', {
    oldPassword,
    newPassword,
    confirmation,
  });
}

function changeEmail({ password, newEmail, confirmation }) {
  return httpClient.patch('/profile/email', {
    password,
    newEmail,
    confirmation,
  });
}

export const profileService = { changeName, changePassword, changeEmail };
