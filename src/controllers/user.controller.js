import { ApiError } from '../exceptions/api.error.js';
import { tokenService } from '../services/token.service.js';
import { userService } from '../services/user.service.js';
import { validateEmail, validatePassword } from './auth.controller.js';
import bcrypt from 'bcrypt';

const getOneActivated = async (req, res, next) => {
  const id = req.user.id;

  const user = await userService.findActivatedById(id);

  res.send(user);
};

const changePasswordAuthenticated = async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userData = req.user;

  if (!userData) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  if (newPassword !== confirmPassword) {
    throw ApiError.badRequest('password and confirmation fields must be equal');
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized({ password: 'wrong password' });
  }

  const errors = {
    newPassword: validatePassword(newPassword),
  };

  if (Object.values(errors).some((error) => error)) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const hashedPass = await bcrypt.hash(newPassword, 10);

  await userService.changePassword(userData.email, hashedPass);

  res.send({
    message: 'OK',
  });
};

const changeName = async (req, res, next) => {
  const { name } = req.body;
  const userData = req.user;

  if (!userData) {
    throw ApiError.unauthorized();
  }

  await userService.changeName(userData.email, name);

  res.send({
    message: 'OK',
  });
};

const changeEmail = async (req, res, next) => {
  const { oldEmail, newEmail, password } = req.body;
  const userData = req.user;

  if (!userData) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized({ password: 'wrong password' });
  }

  const errors = {
    email: validateEmail(newEmail),
  };

  if (Object.values(errors).some((error) => error)) {
    throw ApiError.badRequest('Validation error', errors);
  }

  if (oldEmail === newEmail) {
    throw ApiError.badRequest('new email must be different');
  }

  await userService.changeEmail(userData.email, newEmail);

  res.send({
    message: 'OK',
  });
};

const activateChangedEmail = async (req, res, next) => {
  const { emailChangeToken } = req.params;
  const user = await userService.findByEmailChangeToken(emailChangeToken);

  if (!user) {
    throw ApiError.notFound({ email: 'this email doesn`t exist' });
  }

  const existingUser = await userService.findByEmail(user.pendingEmail);

  if (existingUser) {
    throw ApiError.badRequest('email already exists');
  }

  user.email = user.pendingEmail;
  user.pendingEmail = null;
  user.emailChangeToken = null;

  await user.save();

  res.send({
    message: 'OK',
  });
};

const logout = async (req, res, next) => {
  res.clearCookie('refreshToken');

  await tokenService.remove(req.user.id);

  res.send({
    message: 'OK',
  });
};

export const userController = {
  getOneActivated,
  changeName,
  changeEmail,
  changePasswordAuthenticated,
  activateChangedEmail,
  logout,
};
