import { userService } from '../services/user.service.js';
import { ApiError } from '../exeptions/api.error.js';

const updateName = async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    throw ApiError.badRequest('Bad request', { name: 'Name is required!' });
  }

  const user = await userService.updateName(req.user.id, name.trim());

  res.send(userService.normalize(user));
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  if (!oldPassword) {
    throw ApiError.badRequest('Bad request', {
      oldPassword: 'Old password is required!',
    });
  }

  if (!newPassword || !passwordPattern.test(newPassword)) {
    throw ApiError.badRequest('Bad request', {
      newPassword:
        'Password must be at least 8 characters long and include an uppercase letter and a number',
    });
  }

  await userService.updatePassword(req.user.id, oldPassword, newPassword);

  res.send({ message: 'Ok' });
};

const updateEmail = async (req, res) => {
  const { password, newEmail } = req.body;
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!password) {
    throw ApiError.badRequest('Bad request', {
      password: 'Password is required!',
    });
  }

  if (!newEmail || !emailPattern.test(newEmail)) {
    throw ApiError.badRequest('Bad request', {
      newEmail: 'Email is not valid',
    });
  }

  const user = await userService.updateEmail(req.user.id, password, newEmail);

  res.send(userService.normalize(user));
};

export const profileController = {
  updateName,
  updatePassword,
  updateEmail,
};
