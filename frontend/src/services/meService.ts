import { httpClient } from '../http/httpClient.js';
import { Me } from '../types/me.js';

export const meService = {
    
  updateName: (name: string): Promise<Me> => {
    return httpClient.patch('/users/me', { name });
  },

  changePassword: (oldPassword: string, newPassword: string): Promise<void> => {
    return httpClient.patch('/users/me/password', {
      oldPassword,
      newPassword,
    });
  },

  requestEmailChange: (newEmail: string, password: string): Promise<void> => {
    return httpClient.post('/users/me/email-request', {
      newEmail,
      password,
    });
  },

  confirmEmailChange: (token: string): Promise<{ message: string; user: Me }> => {
    return httpClient.post('/users/me/email-confirm', { token });
  },
};