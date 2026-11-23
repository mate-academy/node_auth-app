import { request } from './http';

export const registerUser = ({ name, email, password }) =>
  request('/register', { method: 'POST', body: { name, email, password } });

export const loginUser = ({ email, password }) =>
  request('/login', { method: 'POST', body: { email, password } });

export const logoutUser = () => request('/logout', { method: 'POST' });

export const activateUser = (activationToken) =>
  request(`/activation/${encodeURIComponent(activationToken)}`);

export const updateProfile = ({ name }) =>
  request('/profile', { method: 'PATCH', body: { name } });

export const requestPasswordReset = (email) =>
  request('/password-reset', { method: 'POST', body: { email } });

export const resetPassword = (resetToken, { password, confirmation }) =>
  request(`/password-reset/${encodeURIComponent(resetToken)}`, {
    method: 'POST',
    body: { password, confirmation },
  });

export const changePassword = ({ oldPassword, newPassword, confirmation }) =>
  request('/profile/password', {
    method: 'PATCH',
    body: { oldPassword, newPassword, confirmation },
  });
