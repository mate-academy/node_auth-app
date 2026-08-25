'use strict';

const { randomUUID } = require('node:crypto');

const { ApiError } = require('../utils/ApiError.js');
const { jwt } = require('../utils/jwt.js');
const { mailer } = require('../utils/mailer.js');
const { assertValid } = require('../utils/validation.js');
const { userService } = require('../services/user.service.js');
const { authService } = require('../services/auth.service.js');
const { usersRepository } = require('../entity/users.repository.js');
const { tokensRepository } = require('../entity/tokens.repository.js');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  assertValid({
    name: userService.validateName(name),
    email: userService.validateEmail(email),
    password: userService.validatePassword(password),
  });

  const existingUser = await usersRepository.getByEmail(email);

  if (existingUser) {
    throw ApiError.badRequest('Validation error', {
      email: 'Email is already taken',
    });
  }

  const activationToken = randomUUID();

  await usersRepository.create({
    name,
    email,
    password: await authService.hashPassword(password),
    activationToken,
  });

  await mailer.sendActivationLink(email, activationToken);

  res.status(201).send({
    message: 'Check your email to activate the account',
  });
};

const activate = async (req, res) => {
  const { email, token } = req.params;
  const user = await usersRepository.getByEmail(email);

  if (!user || user.activationToken !== token) {
    throw ApiError.notFound('Activation link is not valid');
  }

  const activeUser = await usersRepository.update(user.id, {
    activationToken: null,
  });

  await authService.sendAuthentication(res, activeUser);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await usersRepository.getByEmail(email);

  const isPasswordValid = await authService.comparePasswords(
    password || '',
    user?.password || '',
  );

  if (!user || !isPasswordValid) {
    throw ApiError.unauthorized('Wrong email or password');
  }

  if (user.activationToken) {
    throw ApiError.unauthorized('Activate your email before logging in');
  }

  await authService.sendAuthentication(res, user);
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies?.[authService.REFRESH_TOKEN_COOKIE] || '';
  const userData = jwt.validateRefreshToken(refreshToken);
  const savedToken = await tokensRepository.getByToken(refreshToken);

  if (!userData || !savedToken) {
    authService.clearRefreshCookie(res);

    throw ApiError.unauthorized('Refresh token is not valid');
  }

  const user = await usersRepository.getById(userData.id);

  if (!user) {
    throw ApiError.unauthorized('Refresh token is not valid');
  }

  await authService.sendAuthentication(res, user);
};

const logout = async (req, res) => {
  const refreshToken = req.cookies?.[authService.REFRESH_TOKEN_COOKIE] || '';
  const userData = jwt.validateRefreshToken(refreshToken);

  if (userData) {
    await tokensRepository.remove(userData.id);
  }

  authService.clearRefreshCookie(res);
  res.sendStatus(204);
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  assertValid({ email: userService.validateEmail(email) });

  const user = await usersRepository.getByEmail(email);

  if (user) {
    const resetToken = randomUUID();

    await usersRepository.update(user.id, { resetToken });
    await mailer.sendResetPasswordLink(email, resetToken);
  }
  res.send({ message: 'If the email is registered, we have sent a link' });
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmation } = req.body;

  assertValid({
    password: userService.validatePassword(password),
    confirmation: userService.validateConfirmation(password, confirmation),
  });

  const user = await usersRepository.getByResetToken(token);

  if (!user) {
    throw ApiError.notFound('Reset link is not valid');
  }

  await usersRepository.update(user.id, {
    password: await authService.hashPassword(password),
    resetToken: null,
  });

  await tokensRepository.remove(user.id);

  res.send({ message: 'The password has been changed, you can log in now' });
};

const confirmEmailChange = async (req, res) => {
  const { token } = req.params;
  const user = await usersRepository.getByEmailChangeToken(token);

  if (!user) {
    throw ApiError.notFound('Confirmation link is not valid');
  }

  const emailOwner = await usersRepository.getByEmail(user.newEmail);

  if (emailOwner) {
    throw ApiError.badRequest('Validation error', {
      email: 'Email is already taken',
    });
  }

  await usersRepository.update(user.id, {
    email: user.newEmail,
    newEmail: null,
    emailChangeToken: null,
  });

  await tokensRepository.remove(user.id);
  authService.clearRefreshCookie(res);

  res.send({ message: 'The email has been changed, please log in again' });
};

module.exports = {
  authController: {
    register,
    activate,
    login,
    refresh,
    logout,
    requestPasswordReset,
    resetPassword,
    confirmEmailChange,
  },
};
