import { httpClient } from '../http/httpClient';

type UpdateType = 'name' | 'password' | 'email';

type UpdateUserData =
  | {
      newName: string;
    }
  | {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }
  | {
      currentPassword: string;
      newEmail: string;
      confirmEmail: string;
    };

export const userService = {
  updateUserData: (type: UpdateType, data: UpdateUserData) => {
    return httpClient.patch(`/profile`, { type, ...data });
  },

  checkPassword: (password: string, email: string) => {
    return httpClient.post(`/profile/check`, { email, password });
  },
};
