'use strict';

import EmailChangeRepository from '../entity/emailChange.repository.js';
import { ApiError } from '../exceptions/api.error.js';
import jwtService from '../services/jwt.service.js';
import userService from '../services/user.service.js';

const changeName = async (req, res) => {
  const { name } = req.body;
  const { refreshToken } = req.cookies;

  const errors = {
    name: userService.validateRequiredName(name),
  };

  if (Object.values(errors).some((error) => error)) {
    throw ApiError.badRequest('Validation Error', errors);
  }

  const userData = await jwtService.verifyRefreshToken(refreshToken);

  if (!userData) {
    throw ApiError.unauthorized({ message: 'Invalid token' });
  }

  const updatedUser = await userService.changeNameByEmail(userData.email, name);

  res.status(200).json({
    user: userService.normalize(updatedUser),
    message: 'Name updated successfully',
  });
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const { refreshToken } = req.cookies;

  const userData = await jwtService.verifyRefreshToken(refreshToken);

  if (!userData) {
    throw ApiError.unauthorized({ message: 'Invalid token' });
  }

  const updatedUser = await userService.changePasswordByEmail(userData.email, {
    oldPassword,
    newPassword,
    confirmPassword,
  });

  res.status(200).json({
    message: 'Password updated successfully',
    user: userService.normalize(updatedUser),
  });
};

const requestChangeEmail = async (req, res) => {
  const { newEmail, password } = req.body;
  const { refreshToken } = req.cookies;

  const userData = await jwtService.verifyRefreshToken(refreshToken);

  if (!userData) {
    throw ApiError.badRequest({ message: 'Invalid token' });
  }

  await userService.requestChangeEmail(userData.email, { newEmail, password });

  res.status(200).json({
    message: 'Check your new email for activation Link',
  });
};

const changeEmail = async (req, res) => {
  const { activationToken } = req.params;

  const emailChangeRequest =
    await EmailChangeRepository.getByToken(activationToken);

  if (!emailChangeRequest) {
    throw ApiError.badRequest('No such email-change request', {
      token: 'No such email-change request',
    });
  }

  if (emailChangeRequest.expiresAt < Date.now()) {
    EmailChangeRepository.deleteByUserId(emailChangeRequest.userId);
    throw ApiError.unauthorized({
      message: 'Change-email token expired',
    });
  }

  const user = await userService.changeEmail(
    emailChangeRequest.userId,
    emailChangeRequest.email,
  );

  await EmailChangeRepository.deleteByUserId(emailChangeRequest.userId);

  res.status(200).json({
    message: 'Email updated successfully',
    user: userService.normalize(user),
  });
};

const profileController = {
  changeName,
  requestChangeEmail,
  changePassword,
  changeEmail,
};

export default profileController;
