import api from './index.js';

export const profileApi = {
  getProfile: () => api.get('/api/profile'),

  changeName: (name) => api.post('/api/profile/change-name', { name }),

  changePassword: (oldPassword, newPassword, confirmedPassword) =>
    api.post('/api/profile/change-password', {
      oldPassword,
      newPassword,
      confirmedPassword,
    }),

  changeEmail: (password, newEmail) =>
    api.post('/api/profile/change-email', { password, newEmail }),
};
