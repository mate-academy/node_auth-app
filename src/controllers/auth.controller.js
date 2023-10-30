'use strict';

const { ApiError } = require('../exceptions/errors');
const { User } = require('../models/user');
const userService = require('../services/user.service');
const jwtService = require('../services/jwt.service');
const tokenService = require('../services/token.service');
const bcrypt = require('bcrypt');

async function generateTokens(res, user) {
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
}

const register = async(req, res) => {
  const { name, email, password } = req.body;

  await userService.register(name, email, password);
  res.send({ message: 'OK' });
};

const activate = async(req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.activationToken = null;
  user.save();

  res.send(user);
};

const login = async(req, res) => {
  const { email, password } = req.body;
  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  };

  await generateTokens(res, user);
};

const refresh = async(req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  };

  const user = await userService.findByEmail(userData.email);

  await generateTokens(res, user);
};

const logout = async(req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id);

  res.sendStatus(204);
};

const restorePassword = async(req, res) => {
  await userService.restorePassword(req.body.email);

  res.status(200).send({ message: 'Restore password is sent!' });
};

const useRestore = async(req, res) => {
  const { restoreCode } = req.params;

  const user = await User.findOne({
    where: { restoreCode },
  });

  if (!user) {
    throw ApiError.badRequest('Incorrect restore password');
  }

  user.restoreCode = null;
  await user.save();

  res.sendStatus(200);
};

const changePassword = async(res, req) => {
  const { email, password, confirmation } = req.body;
  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  if (password !== confirmation) {
    throw ApiError.badRequest('Password mismatch');
  }

  const newHashedPass = await bcrypt.hash(password, 10);

  user.password = newHashedPass;
  await user.save();

  res.send({ message: 'Password is updated!' });
};

module.exports = {
  register,
  activate,
  login,
  refresh,
  logout,
  restorePassword,
  useRestore,
  changePassword,
};
