import { sendRequest } from './sendRequest.mjs';

export const changeName = (payload) => {
  return sendRequest('/profile/change-name', payload, 'PATCH');
};

export const changePassword = (payload) => {
  return sendRequest('/profile/change-password', payload, 'PATCH');
};

export const changeEmail = (payload) => {
  return sendRequest('/profile/change-email', payload, 'PATCH');
};
