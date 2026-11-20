import { ApiError } from '../exeptions/api.error.js';
import { userService } from '../services/user.service.js';
import { validation } from '../utils/validation.js';

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();

  res.send(users.map(userService.normalize));
};

const changeName = async (req, res) => {
  const { id } = req.user;
  const { name } = req.body;

  const nameError = validation.validateName(name);

  if (nameError) {
    throw ApiError.badRequest('Bad request', { name: nameError });
  }

  const newNameUser = await userService.changeName(id, name);

  res.send(newNameUser);
};

const changePassword = async (req, res) => {
  const { id } = req.user;
  const { oldPassword, newPassword, confirmation } = req.body;

  if (!oldPassword) {
    throw ApiError.badRequest('Bad request', {
      oldPassword: 'Password is required',
    });
  }

  const passwordError = validation.validatePassword(newPassword);

  if (passwordError) {
    throw ApiError.badRequest('Bad request', { newPassword: passwordError });
  }

  if (newPassword !== confirmation) {
    throw ApiError.badRequest('Bad request', {
      confirmation: 'Passwords do not match',
    });
  }

  await userService.changePassword(id, oldPassword, newPassword);

  res.send({ message: 'Password changed' });
};

export const userController = {
  getAllActivated,
  changeName,
  changePassword,
};
