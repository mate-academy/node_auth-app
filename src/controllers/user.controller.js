import { validationResult } from 'express-validator';

import * as userService from '../services/user.service.js';

import ApiError from '../exeptions/api.error.js';

export const changeName = async (req, res) => {
  const validationResults = validationResult(req);

  if (!validationResults.isEmpty()) {
    throw ApiError.badRequest(validationResults.array());
  }

  const { name } = req.body;
  const { email } = res.locals.user;

  const user = await userService.changeName({ email, newName: name });

  res.status(200).json(user);
};

export const changeEmail = async (req, res) => {
  const validationResults = validationResult(req);

  if (!validationResults.isEmpty()) {
    throw ApiError.badRequest(validationResults.array());
  }

  const { newEmail, password } = req.body;
  const { email } = res.locals.user;

  const user = await userService.changeEmail({ email, password, newEmail });

  res.status(200).json(user);
};

export const activateNewEmail = async (req, res) => {
  const validationResults = validationResult(req);

  if (!validationResults.isEmpty()) {
    throw ApiError.badRequest(validationResults.array());
  }

  const { activationNewEmailToken } = req.params;

  await userService.activateNewEmail({ activationNewEmailToken });

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

  await userService.chnagePassword({
    refreshToken,
    email,
    password,
    newPassword,
  });

  res.sendStatus(204);
};
