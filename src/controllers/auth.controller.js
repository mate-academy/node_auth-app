const { User } = require('../models/user.model.js');
const { userService } = require('../services/user.service.js');
const { jwtService } = require('../services/jwt.service.js');
const { ApiError } = require('../exeptions/api.error.js');
const bcrypt = require('bcrypt');
const { tokenService } = require('../services/token.service.js');

const validateName = (name) => {
  if (!name) {
    return 'Name is required';
  }
};

const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }

  const emailPattern = /^[^\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(email)) {
    return 'Email is not valid';
  }
};

const validatePassword = (password) => {
  if (!password) {
    return 'Email is required';
  }

  if (password.length < 6) {
    return 'At least 6 characters required';
  }
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.register(email, name, hashedPassword);
  res.send({ message: 'OK' });
};

const activate = async (req, res) => {
  const activationToken = req.params.activationToken.slice(1);

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);
  }

  user.activationToken = null;
  user.save();

  res.send(user);
};

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshAccessToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshAccessToken);

  res.cookie('refreshToken', refreshAccessToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.send({ user: normalizedUser, accessToken });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No user with this email');
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw ApiError.badRequest('Wrong password');
  }

  await generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!user || !token) {
    throw ApiError.unauthorized('Invalid token');
  }

  await generateTokens(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const user = await jwtService.verifyRefresh(refreshToken);

  if (!user || !refreshToken) {
    throw ApiError.unauthorized('Invalid token');
  }

  await tokenService.remove(user.id);
  res.sendStatus(204);
};

module.exports = {
  authController: {
    register,
    activate,
    login,
    refresh,
    logout,
  },
};
