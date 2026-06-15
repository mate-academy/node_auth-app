import { sendRequest } from './sendRequest.mjs';

export const register = (payload) => {
  return sendRequest('/auth/register', payload);
};

export const login = (payload) => {
  return sendRequest('/auth/login', payload);
};

export const forgotPassword = (payload) => {
  return sendRequest('/auth/login/forgot-password', payload);
};

export const resetPassword = (payload) => {
  return sendRequest('/auth/reset-password', payload);
};
