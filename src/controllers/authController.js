'use strict';

const { ErrorApi } = require('../exceptions/ErrorApi.js');
const { validate } = require('../exceptions/validate.js');
const { bcryptService } = require('../services/bcryptService.js');
const { jwtService } = require('../services/jwtService.js');
const { tokenService } = require('../services/tokenService.js');
const { userService } = require('../services/userService.js');

async function sendAuthentication(res, foundUser) {
  const normalizedUser = userService.normalize(foundUser);
  const accessToken = jwtService.generateAccessToken(normalizedUser);
  const refreshToken = jwtService.generateRefreshToken(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    // msec
    maxAge: 30 * 24 * 60 * 60 * 1000,
    // dont access in client
    httpOnly: true,
    // send to all sites
    sameSite: 'none',
    // only secure send-method (https)
    secure: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
}

async function register(req, res) {
  const { name, email, password } = req.body;

  const errors = {
    name: validate.name(name),
    email: validate.email(email),
    password: validate.password(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ErrorApi.BadRequest('Validation error', errors);
  }

  await userService.register({
    name, email, password,
  });

  res.sendStatus(200);
}

async function activate(req, res) {
  const { activetionToken } = req.params;
  const foundUser = await userService.getByActivationToken(activetionToken);

  if (!foundUser) {
    throw ErrorApi.NotFound('user');
  }

  foundUser.activationToken = null;
  await foundUser.save();

  await sendAuthentication(res, foundUser);
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw ErrorApi.BadRequest('Email and password mustn\'t be empty');
  }

  const foundUser = await userService.getByEmail(email);

  if (!foundUser) {
    throw ErrorApi.NotFound('user');
  }

  if (foundUser.activetionToken) {
    throw ErrorApi.Unauthorized();
  }

  if (!(await bcryptService.isEquel(password, foundUser.password))) {
    throw ErrorApi.BadRequest('Password is wrong');
  }

  await sendAuthentication(res, foundUser);
}

async function logout(req, res) {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ErrorApi.Unauthorized();
  }

  const decodedUser = jwtService.validateRefreshToken(refreshToken);

  res.clearCookie('refreshToken');

  if (decodedUser) {
    await tokenService.removeByUserId(decodedUser.id);
  }

  res.sendStatus(204);
}

async function refresh(req, res) {
  const { refreshToken } = req.cookies;
  const decodedUser = jwtService.validateRefreshToken(refreshToken);

  if (!refreshToken) {
    throw ErrorApi.BadRequest('Refresh token is missing in cookies');
  }

  if (!decodedUser) {
    throw ErrorApi.Unauthorized();
  }

  const foundToken = await tokenService.getByToken(refreshToken);
  const foundUser = await userService.getByEmail(decodedUser.email);

  if (!foundUser) {
    throw ErrorApi.NotFound('user');
  }

  if (!foundToken) {
    throw ErrorApi.NotFound('token');
  }

  await sendAuthentication(res, foundUser);
}

function check(req, res) {
  const { refreshToken } = req.cookies;
  const decodedUser = jwtService.validateRefreshToken(refreshToken);

  if (!refreshToken) {
    throw ErrorApi.BadRequest('Refresh token is missing in cookies');
  }

  const isValid = !!decodedUser;

  res.send({ isValid });
}

async function forgot(req, res) {
  const { email } = req.body;

  if (!email) {
    throw ErrorApi.BadRequest('Email mustn\'t be empty');
  }

  const foundUser = await userService.getByEmail(email);

  if (!foundUser) {
    throw ErrorApi.NotFound('user');
  }

  await userService.forgot(email);

  res.sendStatus(200);
}

async function resetPassword(req, res) {
  const { activetionToken } = req.params;
  const { password, confirmation } = req.body;

  const errors = {
    password: validate.password(password),
    isEqual: password === confirmation,
  };

  if (errors.password || !errors.isEqual) {
    throw ErrorApi.BadRequest('Validation error', errors);
  }

  await userService.resetPassword(activetionToken, confirmation);

  res.sendStatus(200);
}

const authController = {
  register,
  activate,
  login,
  logout,
  refresh,
  check,
  forgot,
  resetPassword,
};

module.exports = { authController };
