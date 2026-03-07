import bcrypt from 'bcrypt';
import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import { userService } from '../services/user.service.js';
import { emailService } from '../services/email.service.js';

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();

  res.send(users.map(userService.normalize));
};

const updateName = async (req, res) => {
  const { name } = req.body;
  const { id } = req.user;

  const user = await User.findByPk(id);

  user.name = name;
  await user.save();

  res.send(userService.normalize(user));
};

const changePassword = async (req, res) => {
  const { password, newPassword } = req.body;
  const { id } = req.user;

  const user = await User.findByPk(id);
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw ApiError.badRequest('Wrong password');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.send({ message: 'OK' });
};

const changeEmail = async (req, res) => {
  const { password, newEmail } = req.body;
  const { id } = req.user;

  const user = await User.findByPk(id);
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw ApiError.badRequest('Wrong password');
  }

  const existUser = await userService.findByEmail(newEmail);

  if (existUser) {
    throw ApiError.badRequest('Email already in use');
  }

  await emailService.sendEmailChangeNotification(user.email, newEmail);

  user.email = newEmail;
  await user.save();

  res.send(userService.normalize(user));
};

export const userController = {
  getAllActivated,
  updateName,
  changePassword,
  changeEmail,
};
