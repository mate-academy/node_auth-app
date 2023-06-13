'use strict';

const bcrypt = require('bcrypt');

const { User } = require('../models/user');
const userService = require('../services/userService');
const jwtService = require('../services/jwtService');
const { ApiError } = require('../exceptions/apiError');
const tokenService = require('../services/tokenService');
const emailService = require('../services/emailService');

const validateEmai = (email) => {
  if (!email) {
    return 'Email is required';
  }

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+/;

  if (!emailPattern.test(email)) {
    return 'Email is not valid';
  }
};

const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'At least 6 characters';
  }
};

const register = async(req, res, next) => {
  const { email, password, name } = req.body;
  const errors = {
    email: validateEmai(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.BadRequest('Validation error', errors);
  }
  await userService.register(email, password, name);

  res.send({ message: 'OK' });
};

const registerWithGoogle = async(req, res, next) => {
  const { email, name, id } = req.body;
  const errors = {
    email: validateEmai(email),
  };

  if (errors.email || errors.password) {
    throw ApiError.BadRequest('Validation error', errors);
  }
  await userService.registerWithGoogle(email, id, name);

  const user = await userService.getByEmail(email);

  await sendAuthentication(res, user);
};

const activate = async(req, res, next) => {
  const { activationToken } = req.params;
  const user = await User.findOne({
    where: { activationToken },
  });

  if (!user) {
    res.sendStatus(404);
  }

  user.activationToken = null;
  await user.save();

  await sendAuthentication(res, user);
};

const login = async(req, res, next) => {
  const { email, password } = req.body;
  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User with this email does not exist');
  }

  if (user.activationToken) {
    throw ApiError.BadRequest('This user is not activated yet');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Password is wrong');
  };

  await sendAuthentication(res, user);
};

const refresh = async(req, res, next) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.validateRefreshToken(refreshToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  const token = await tokenService.getByToken(refreshToken);

  if (!token) {
    throw ApiError.Unauthorized();
  }

  const user = await userService.getByEmail(userData.email);

  await sendAuthentication(res, user);
};

const sendAuthentication = async(res, user) => {
  const userData = userService.normalize(user);
  const accessToken = jwtService.generateAccessToken(userData);
  const refreshToken = jwtService.generateRefreshToken(userData);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  await tokenService.save(user.id, refreshToken);

  res.send({
    user: userData,
    accessToken,
  });
};

const logout = async(req, res, next) => {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  res.clearCookie('refreshToken');

  if (userData) {
    await tokenService.removeToken(userData.id);
  }

  res.sendStatus(204);
};

const restorePasswordEmailPart = async(req, res, next) => {
  const { email } = req.body;
  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User with this email does not exist');
  }

  user.restoreCode = userService.generateRestoreCode();
  await user.save();
  await emailService.sendRestoreCode(email, user.restoreCode);

  res.send({ message: 'OK' });
};

const checkRestoreCode = async(req, res, next) => {
  const { restoreCode } = req.body;

  if (!restoreCode) {
    throw ApiError.BadRequest('Restore code was not provided');
  }

  const user = await User.findOne({
    where: { restoreCode },
  });

  if (!user) {
    throw ApiError.BadRequest('Restore Code is incorrect');
  }

  user.restoreCode = null;
  await user.save();

  res.send({ message: 'Code was accepted' });
};

const changePassword = async(req, res, next) => {
  const { email, password } = req.body;
  const user = await userService.getByEmail(email);

  if (user) {
    const newPasswordHash = await bcrypt.hash(password, 10);

    user.password = newPasswordHash;
    await user.save();

    res.send({ message: 'Password updated successfully.' });
  } else {
    res.sendStatus(402);
  }
};

module.exports = {
  register,
  registerWithGoogle,
  activate,
  login,
  refresh,
  logout,
  validateEmai,
  validatePassword,
  restorePasswordEmailPart,
  checkRestoreCode,
  changePassword,
};
