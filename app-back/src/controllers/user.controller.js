import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.model.js';
import { userService } from '../services/user.service.js';
import bcrypt from 'bcrypt';
import { authController } from './auth.controller.js';

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();

  res.send(users.map(userService.normalizedUser));
};

const changeName = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  if (!name || name.trim().length < 2) {
    throw ApiError.badRequest('Name is invalid');
  }

  const user = await userService.changeName(userId, name.trim());

  res.send({
    user: userService.normalizedUser(user),
  });
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user.id;

  if (authController.validatePassword(newPassword)) {
    return ApiError.badRequest();
  }

  if (newPassword !== confirmPassword) {
    return ApiError.badRequest();
  }

  const user = await userService.findUserById(userId);

  const isValid = await bcrypt.compare(oldPassword, user.password);
  if (!isValid) {
    return res.sendStatus(401);
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.send({
    user: userService.normalizedUser(user),
  });
};

const changeEmail = async (req, res) => {
  const { password, newEmail } = req.body;
  const user = req.user;

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return res.sendStatus(401);
  }

  const newUser = await userService.changeEmail(user, newEmail);

  res.send({
    user: userService.normalizedUser(newUser),
  });
};

export const userController = {
  getAllActivated,
  changeName,
  changePassword,
  changeEmail,
};
