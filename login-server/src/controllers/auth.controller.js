'use strict';

const { User } = require('../models/user.js');
const {
  findByEmail, normalize, registerUser,
} = require('../services/user.service');
const { sign, verifyRefresh, signRefresh } = require('../services/jwt.service');
const { ApiError } = require('../exeptions/api.error');
const { hash, compare } = require('bcrypt');
const { save, getByToken, remove } = require('../services/token.service');

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
}

const register = async(req, res) => {
  const { email, password } = req.body;
  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPassword = await hash(password, 10);

  await registerUser(email, hashedPassword);
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
  const user = await findByEmail(email);

  console.log('user', user);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordValid = await compare(password, user.password);

  console.log('isPasswordValid', isPasswordValid);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  try {
    await generateTokens(res, user);
  } catch (error) {
    console.error(error, error.message);
    throw error;
  }
};

const refresh = async(req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await verifyRefresh(refreshToken);
  const token = await getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await findByEmail(userData.email);

  try {
    await generateTokens(res, user);
  } catch (error) {
    console.error(error, error.message);
    throw error;
  }
};

async function generateTokens(res, user) {
  const normalizedUser = normalize(user);
  const accessToken = sign(normalizedUser);
  const refreshToken = signRefresh(normalizedUser);

  console.log('accessToken, refreshToken ', accessToken, refreshToken);
  await save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    domain: 'http://localhost:3000/',
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
}

const logout = async(req, res) => {
  const { refreshToken } = req.cookies;

  console.log('req cookies', req.cookies);

  const userData = await verifyRefresh(refreshToken);

  console.log('userData', userData);
  console.log('refreshToken', refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await remove(userData.id);
  res.sendStatus(204);
};

module.exports = {
  register,
  activate,
  login,
  refresh,
  logout,
};
