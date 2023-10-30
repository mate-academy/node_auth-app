'use strict';

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
    res.status(400).send({ error: 'No such user' });

    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    res.status(400).send({ error: 'Wrong password' });

    return;
  };

  await generateTokens(res, user);
};

const refresh = async(req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    res.status(401).send({ error: 'Unauthorized' });

    return;
  };

  const user = await userService.findByEmail(userData.email);

  await generateTokens(res, user);
};

const logout = async(req, res) => {
  const { id } = req.userData;

  await tokenService.remove(id);

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
    res.status(400).send({ error: 'Incorrect restore password' });

    return;
  }

  user.restoreCode = null;
  await user.save();

  res.sendStatus(200);
};

const changePassword = async(res, req) => {
  const { email, password, confirmation } = req.body;
  const user = await userService.getByEmail(email);

  if (!user) {
    res.status(400).send({ error: 'User not found' });

    return;
  }

  if (password !== confirmation) {
    res.status(400).send({ error: 'Password mismatch' });

    return;
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
