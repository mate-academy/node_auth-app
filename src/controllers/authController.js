'use strict';

const bcrypt = require('bcrypt');
const userService = require('../services/userService.js');
const jwtService = require('../services/jwtService.js');
const tokenService = require('../services/tokenService.js');
const emailService = require('../services/emailService.js');
const { ApiError } = require('../exceptions/ApiError.js');
const { User } = require('../models/User.js');

async function register(req, res) {
  const { name, email, password } = req.body;

  const emailError = userService.validateEmail(email);
  const passwordError = userService.validatePassword(password);

  if (emailError || passwordError) {
    const errors = {
      email: emailError,
      password: passwordError,
    };

    throw ApiError.BadRequest('Validation error', errors);
  }

  await userService.register({
    name,
    email,
    password,
  });

  res.send({ message: 'User created' });
}

async function activate(req, res) {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    return res.sendStatus(404);
  }

  user.activationToken = null;
  await user.save();

  await sendAuthentication(res, user);
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Password is invalid');
  }

  await sendAuthentication(res, user);
}

async function refresh(req, res) {
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
}

async function logout(req, res) {
  const { refreshToken } = req.cookies;

  const userData = jwtService.validateRefreshToken(refreshToken);

  res.clearCookie('refreshToken');

  if (userData) {
    await tokenService.remove(userData.id);
  }

  res.sendStatus(204);
  res.redirect('/login');
}

async function sendRestorePasswordLink(req, res) {
  const { email } = req.body;
  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User does not exist!');
  }

  user.restorePasswordToken = userService.generateRestorePasswordToken();
  await user.save();

  await emailService.sendRestorePasswordLink({
    email,
    restorePasswordToken: user.restorePasswordToken,
  });

  res.send({ message: 'OK' });
}

async function checkRestoreCode(req, res) {
  const { restorePasswordToken } = req.body;

  if (!restorePasswordToken) {
    throw ApiError.BadRequest('Please provide restore password token');
  }

  const user = await User.findOne({
    where: { restorePasswordToken },
  });

  if (!user) {
    throw ApiError.BadRequest('Restore Code is incorrect');
  }

  user.restorePasswordToken = null;
  await user.save();

  res.sendStatus(200);
}

async function changePassword(req, res) {
  const { email, password } = req.body;
  const user = await userService.getByEmail(email);

  if (user) {
    const newPasswordHash = await bcrypt.hash(password, 10);

    user.password = newPasswordHash;
    await user.save();

    res.send({ message: 'Password is updated!' });
  } else {
    res.sendStatus(402);
  }
}

async function sendAuthentication(res, user) {
  const userData = userService.normalize(user);
  const accessToken = jwtService.generateAccessToken(userData);
  const refreshToken = jwtService.generateRefreshToken(userData);

  await tokenService.save(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.send({
    user: userData,
    accessToken,
  });
}

module.exports = {
  authController: {
    register,
    activate,
    login,
    refresh,
    logout,
    sendRestorePasswordLink,
    checkRestoreCode,
    changePassword,
  },
};
