const bcrypt = require('bcrypt');
const { User } = require('../models/User.js');
const { userService } = require('../services/user.service.js');
const { jwtService } = require('../utils/jwt.js');
const { tokenService } = require('../services/token.service.js');
const { ApiError } = require('../exceptions/ApiError.js');

const validateUserName = (name) => {
  if (!name) {
    return 'Name is required';
  }
};

const validateUserEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.)+[\w-]{2,}$/;

  return emailPattern.test(email) ? null : 'Email is not valid';
};

const validateUserPassword = (password) => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'At least 6 characters required';
  }
};

const handleRegister = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: validateUserName(name),
    email: validateUserEmail(email),
    password: validateUserPassword(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.register(email, name, hashedPassword);

  res.send({ message: 'OK' });
};

const handleActivation = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    return res.status(404).send({ error: 'User not found' });
  }

  user.activationToken = null;
  await user.save();

  res.send({ message: 'Account successfully activated' });
};

const sendAuthTokens = async (res, user) => {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.send({ user: normalizedUser, accessToken });
};

const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No user with this email');
  }

  if (user.activationToken !== null) {
    throw ApiError.badRequest('Please activate your email before logging in');
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw ApiError.badRequest('Wrong password');
  }

  await sendAuthTokens(res, user);
};

const handleRefreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!user || !token) {
    throw ApiError.unauthorized('Invalid token');
  }

  await sendAuthTokens(res, user);
};

const handleLogout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const user = await jwtService.verifyRefresh(refreshToken);

  if (!user) {
    throw ApiError.unauthorized('Invalid token');
  }

  await tokenService.remove(user.id);
  res.sendStatus(204);
};

module.exports = {
  authController: {
    register: handleRegister,
    activate: handleActivation,
    login: handleLogin,
    refresh: handleRefreshToken,
    logout: handleLogout,
  },
};
