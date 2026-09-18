import { httpClient } from '../http/httpClient.js';

function getAll() {
  return httpClient.get('/users');
}

const changePassword = ({ oldPassword, password, confirmPassword }) => {
  return httpClient.post('/change', { oldPassword, password, confirmPassword });
};

const getUserOne = userId => {
  return httpClient.get(`/profile/${userId}`);
};

const changeName = (userId, { userName }) => {
  return httpClient.patch(`/change-name/${userId}`, { userName });
};

const changeEmail = (userId, { email, confirmEmail, password }) => {
  return httpClient.patch(`/change-email/${userId}`, {
    email,
    confirmEmail,
    password,
  });
};

export const userService = {
  getAll,
  changePassword,
  getUserOne,
  changeName,
  changeEmail,
};
