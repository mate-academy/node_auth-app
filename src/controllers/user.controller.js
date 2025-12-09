import { ApiError } from '../exceptions/api.error.js';
import { emailService } from '../services/email.service.js';
import { userService } from '../services/user.service.js';
import bcrypt from 'bcrypt';

const getAllActivatedUsers = async (req, res) => {
  const users = await userService.getAllActivatedUsers();

  res.send(users.map(userService.normalize));
};

const getUser = async (req, res) => {
  const { email } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  res.send(userService.normalize(user));
};

const changeData = async (req, res) => {
  const user = req.body;

  const updatedUser = await userService.changeData(user);

  res.send(userService.normalize(updatedUser));
};

const changePassword = async (req, res) => {
  const { email } = req.params;
  const { oldPassword, newPassword } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.unauthorized();
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('invalid password');
  }

  const hashedPass = await bcrypt.hash(newPassword, 10);

  const updatedUser = await userService.changePassword(user.id, hashedPass);

  res.send(userService.normalize(updatedUser));
};

const changeEmail = async (req, res) => {
  const { email } = req.params;
  const { password, newEmail } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  const updatedUser = await userService.changeEmail(user.id, newEmail);

  if (updatedUser) {
    await emailService.sendChangedEmail(email);
  }

  res.send(userService.normalize(updatedUser));
};

export const userController = {
  getAllActivatedUsers,
  getUser,
  changeData,
  changePassword,
  changeEmail,
};
