import { httpClient } from '../http/httpClient';

function updateName(name) {
  return httpClient.patch('/profile/name', { name });
}

function updatePassword({ oldPassword, newPassword, confirmation }) {
  return httpClient.patch('/profile/password', {
    oldPassword,
    newPassword,
    confirmation,
  });
}

function updateEmail({ password, newEmail }) {
  return httpClient.patch('/profile/email', { password, newEmail });
}

export const profileService = {
  updateName,
  updatePassword,
  updateEmail,
};
