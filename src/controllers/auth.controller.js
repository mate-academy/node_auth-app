'use strict';

const { mailService } = require('../services/mail.service.js');
const { jwtService } = require('../services/jwt.service.js');
const { userService } = require('../services/user.service.js');
const { ApiError } = require('../utils/api.error.js');
const { tokenService } = require('../services/token.service.js');
const { validators } = require('../utils/validators.js');

const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  const activationToken = jwtService.generateToken();

  await userService.create({
    name,
    email,
    password,
    activationToken,
  });

  await mailService.sendActivationMail(email, activationToken);

  res
    .status(201)
    .send({ message: 'User created check email to activate account' });
};

const sendAuth = async ({ id, email, name }, res) => {
  const userDataToShow = {
    id,
    email,
    name,
  };
  const refreshToken = jwtService.createRefreshToken(userDataToShow);
  const accessToken = jwtService.createAccessToken(userDataToShow);

  const { refreshToken: createdRefreshToken }
    = await tokenService.createRefreshToken(id, refreshToken);

  res.cookie('refreshToken', createdRefreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.send({
    accessToken,
    user: userDataToShow,
  });
};

const activate = async (req, res, next) => {
  const { activationToken } = req.params;
  const user = await userService.findByToken(
    'activationToken',
    activationToken
  );

  if (user === null) {
    throw ApiError.NotFound();
  }

  const activatedUser = await userService.consumeToken('activationToken', user);

  sendAuth(activatedUser, res);
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userService.findActiveUser(email);

  await userService.checkPassword(password, user);

  sendAuth(user, res);
};

const refresh = async (req, res, next) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.readRefreshToken(refreshToken);

  if (userData === null) {
    throw ApiError.Unauthorized();
  }

  const token = await tokenService.getByToken(refreshToken);

  if (!token) {
    throw ApiError.Unauthorized();
  }

  const user = await userService.findActiveUser(userData.email);

  sendAuth(user, res);
};

const logout = async (req, res, next) => {
  const { refreshToken } = req.cookies;
  const userData = jwtService.readRefreshToken(refreshToken);

  if (userData) {
    await tokenService.remove(userData.id);
  }

  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

const reset = async (req, res, next) => {
  const { email } = req.body;

  const emailError = validators.validateEmail(email);

  if (emailError) {
    throw ApiError.BadRequest('Invalid email', { email: emailError });
  }

  const user = await userService.findActiveUser(email);
  const resetToken = jwtService.generateToken();

  await Promise.all([
    userService.updateResetToken(resetToken, user),
    mailService.sendResetMail(email, resetToken),
  ]);

  res.send({ message: 'Reset token has been send. Check your email!' });
};

const confirmReset = async (req, res, next) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  const passwordError = validators.validatePassword(password);

  if (passwordError) {
    throw ApiError.BadRequest('Invalid password', { password: passwordError });
  }

  const user = await userService.findByToken('resetToken', resetToken);

  if (!user) {
    throw ApiError.NotFound();
  }

  await Promise.all([
    userService.updatePassword(user, password),
    userService.consumeToken('resetToken', user),
  ]);

  res.send({ message: 'Successfully changed password. Please login!' });
};

exports.authController = {
  register,
  activate,
  login,
  logout,
  refresh,
  reset,
  confirmReset,
};
