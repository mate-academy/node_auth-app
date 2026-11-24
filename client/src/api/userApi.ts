import { accessTokenService } from './accessToken';
import { api } from './api';

const getAuthHeder = () => {
  return {
    headers: {
      Authorization: `Bearer ${accessTokenService.get()}`,
    },
  };
};

const changeName = (name: string) => {
  return api.patch('/users/change-name', { name }, getAuthHeder());
};

const changeEmail = (newEmail: string, password: string) => {
  return api.patch(
    '/users/change-email',
    { newEmail, password },
    getAuthHeder(),
  );
};

const changePassword = (
  oldPassword: string,
  newPassword: string,
  confirmation: string,
) => {
  return api.patch('/users/change-password', {
    oldPassword,
    newPassword,
    confirmation,
  }, getAuthHeder());
};

export const userAuth = {
  changeName,
  changeEmail,
  changePassword,
};
