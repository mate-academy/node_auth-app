import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import * as userService from '../services/user.service.js';
import * as emailService from '../services/email.service.js';
import * as tokenService from '../services/token.service.js';

import ApiError from '../exeptions/api.error.js';
import { hashPassword } from '../utils/helpers.js';

export const changeName = async (req, res) => {
  const validationResults = validationResult(req);

  if (!validationResults.isEmpty()) {
    throw ApiError.badRequest(validationResults.array());
  }

  const { name } = req.body;

  const { email } = res.locals.user;

  const user = await userService.findUser(email);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  user.name = name;
  await user.save();

  res.status(200).json(userService.secureUser(user));
};

export const changeEmail = async (req, res) => {
  const validationResults = validationResult(req);

  if (!validationResults.isEmpty()) {
    throw ApiError.badRequest(validationResults.array());
  }

  const { newEmail, password } = req.body;
  const { email } = res.locals.user;

  const user = await userService.findUser(email);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Invalid password');
  }

  const isNewEmailTaken = await userService.findUser(newEmail);

  if (isNewEmailTaken) {
    throw ApiError.badRequest('New email is alredy used in another account');
  }

  const activationToken = uuidv4();

  user.activationNewEmailToken = activationToken;
  user.newEmail = newEmail;
  await user.save();

  emailService.sendActivationNewEmail(newEmail, activationToken);

  res.status(200).json(userService.secureUser(user));
};

export const activateNewEmail = async (req, res) => {
  const validationResults = validationResult(req);

  if (!validationResults.isEmpty()) {
    throw ApiError.badRequest(validationResults.array());
  }

  const { activationNewEmailToken } = req.params;

  const user = await userService.findUserByActivationNewEmailToken(
    activationNewEmailToken,
  );

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const oldEmail = user.email;

  user.email = user.newEmail;
  user.activationNewEmailToken = null;
  user.newEmail = null;
  await user.save();

  emailService.sendChangedEmail(oldEmail, user.email);

  res.sendStatus(204);
};

export const changePassword = async (req, res) => {
  const validationResults = validationResult(req);

  if (!validationResults.isEmpty()) {
    throw ApiError.badRequest(validationResults.array());
  }

  const refreshToken = req.cookies.refreshToken || '';
  const { password, newPassword } = req.body;

  const { email } = res.locals.user;

  const user = await userService.findUser(email);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Invalid password');
  }

  const hashedNewPassword = await hashPassword(newPassword);

  user.password = hashedNewPassword;
  user.save();

  await tokenService.deleteAllTokenByUserIdAndCurrentToken(
    user.id,
    refreshToken,
  );

  res.sendStatus(204);
};
