const { User } = require('../models/user');
const { userService } = require('../services/user.service');
const { jwtService } = require('../services/jwt.service');
const { ApiError } = require('./expations/api.error');
const bcrypt = require('bcrypt');
const { tokenService } = require('../services/token.service');

function validateName(name) {
  if (!name) {
    return 'Name is required';
  }
}

function validateEmail(email) {
  if (!email) {
    return 'Email is required';
  }

  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!regex.test(email)) {
    return 'Email is invalid';
  }
}

function validatePassword(password) {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }

  if (!/\d/.test(password)) {
    return 'Password must contain at least one digit';
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }

  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
}

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

  await userService.register(name, email, hashedPassword);

  res.send({ message: 'Ok' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    return res.sendStatus(404);
  }

  user.activationToken = null;
  await user.save();

  res.send({
    message: 'Account successfully activated',
    redirectUrl: '/users/profile',
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Passwords do not match');
  }

  if (user.activationToken !== null) {
    throw ApiError.badRequest('Please activate your email');
  }

  await generateToken(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies || {};

  if (!refreshToken) {
    throw ApiError.unauthorized('Refresh token is missing');
  }

  const userData = jwtService.verifyRefresh(refreshToken);
  const tokenFromDb = await tokenService.getByToken(refreshToken);

  if (!userData || !tokenFromDb) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await userService.findById(userData.id);

  if (!user) {
    throw ApiError.unauthorized('User not found');
  }

  await generateToken(res, user);
};

const generateToken = async (res, user) => {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies || {};

  if (!refreshToken) {
    throw ApiError.unauthorized('Token is missing');
  }

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    throw ApiError.unauthorized('Invalid token');
  }

  await tokenService.remove(userData.id);

  res.clearCookie('refreshToken');

  res.send({
    message: 'Logout successfully',
    redirectUrl: '/users/login',
  });
};

const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  validatePassword,
};

module.exports = { authController };
