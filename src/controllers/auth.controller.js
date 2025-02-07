'use strict';

const bcrypt = require('bcrypt');
const userService = require('../services/user.service');
const jwtService = require('../services/jwt.service');
const tokenService = require('../services/token.service');
const ApiError = require('../exception/api.error');

const validateEmail = (value) => {
  if (!value) {
    return 'Email is required';
  }

  // eslint-disable-next-line
  const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
};

const validatePassword = (value) => {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 5);

  await userService.register(name, email, hashedPass);

  res.status(200).send('User create');
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  await userService.activation(activationToken);

  res.status(200).send('User has been activated');
};

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalized(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefesh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    HttpOnly: true,
  });

  res.setHeader('Authorization', `Bearer ${accessToken}`);

  res.send({
    user: normalizedUser,
    token: accessToken,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!user || !isPasswordValid) {
    res.status(401).send('Wrong password or email');

    return;
  }

  generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefesh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  await generateTokens(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = jwtService.verifyRefesh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id);

  res.sendStatus(204);
};

const reset = async (req, res) => {
  const { email } = req.body;

  const errors = {
    email: validateEmail(email),
  };

  if (errors.email) {
    throw ApiError.badRequest('Bad request', errors);
  }

  await userService.reset(email);

  res.status(200).send('Email is sent');
};

const update = async (req, res) => {
  const { updateToken } = req.params;

  if (!updateToken) {
    throw ApiError.notFound({ updateToken: updateToken });
  }

  const { password, confirmedPass } = req.body;

  if (password !== confirmedPass) {
    throw ApiError.badRequest('Bad request', {
      password: 'Passwords do not match.',
    });
  }

  const hashedPass = await bcrypt.hash(password, 5);

  await userService.update(updateToken, hashedPass);

  res.status(200).send('Password has been reset');
};

module.exports = {
  register,
  activate,
  login,
  refresh,
  logout,
  reset,
  update,
};
