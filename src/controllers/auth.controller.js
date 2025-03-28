const { User } = require('../models/user.model.js');

const userService = require('../services/user.service.js');
const emailService = require('../services/email.service.js');
const tokenService = require('../services/token.service.js');
const passwordTokenService = require('../services/passwordToken.service.js');
const jwtService = require('../services/jwt.service.js');
const validator = require('../utils/validation.js');
const { ApiError } = require('../exceptions/api.error.js');
const bcrypt = require('bcrypt');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: validator.validateName(name),
    email: validator.validateEmail(email),
    password: validator.validatePassword(password),
  };

  if (errors.email || errors.password || errors.name) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.register(name, email, hashedPassword);

  res
    .status(201)
    .send({ message: `Welcome! Don't forget confirm your email.` });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    throw ApiError.notFound({
      message: 'User not found',
    });
  }

  user.activationToken = null;
  await user.save();

  res.status(302).send(user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user', {
      email: `Email are incorrect`,
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password', {
      password: `Wrong password`,
    });
  }

  if (user.activationToken !== null) {
    throw ApiError.unauthorized({
      message: `Confirm your email and activate an account, please.`,
    });
  }

  await generateTokens(res, user);

  res.status(302).send(user.id);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  await generateTokens(res, user);
};

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshAccessToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshAccessToken);

  res.cookie('refreshToken', refreshAccessToken, {
    HttpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const resetPasswordStart = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw ApiError.BadRequest('Email is required');
  }

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.BadRequest(`User with this email doesn't exist`);
  }

  const normalizedUser = userService.normalize(user);

  const resetToken = jwtService.signResetPassword(normalizedUser);

  await passwordTokenService.save(normalizedUser.id, resetToken);

  await emailService.sendResetPasswordEmail(email, resetToken);

  res.status(201).send({
    normalizedUser,
    token: resetToken,
  });
};

const resetPasswordConfirmEmail = async (req, res) => {
  const { resetToken } = req.params;

  const userData = await jwtService.verifyResetPassword(resetToken);

  if (!userData) {
    throw ApiError.unauthorized({
      message: 'Expired',
    });
  }

  res.status(302).send(userData.id);
};

const resetPassword = async (req, res) => {
  const { userId, newPassword, confirmation } = req.body;

  const user = await User.findOne({ where: { id: userId } });

  if (!user) {
    throw ApiError.badRequest(`User with this email doesn't exist`);
  }

  if (newPassword !== confirmation) {
    throw ApiError.badRequest('Passwords are not equal');
  }

  const errors = validator.validatePassword(newPassword);

  if (errors) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  await user.save();

  await passwordTokenService.remove(user.id);

  res.status(302).send(user.id);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id);

  res.sendStatus(302);
};

module.exports = {
  register,
  activate,
  login,
  refresh,
  resetPasswordStart,
  resetPasswordConfirmEmail,
  resetPassword,
  logout,
};
