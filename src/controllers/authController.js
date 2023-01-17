'use strict';

const bcrypt = require('bcrypt');
const { User } = require('../models/User');
const userService = require('../services/userService');
const jwtService = require('../services/jwtService');
const tokenService = require('../services/tokenService');
const { ApiError } = require('../exceptions/ApiError');
const emailService = require('../services/emailService');
const { v4: uuidv4 } = require('uuid');

const validateName = (value) => {
  if (!value) {
    return 'Name is required';
  }

  if (value.length < 3) {
    return 'Ate least 3 characters';
  }
};

const validateEmail = (value) => {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

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

const register = async(req, res, next) => {
  const { name, email, password } = req.body;

  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  await userService.register(name, email, password);

  res.send({ message: 'OK' });
};

const activate = async(req, res, next) => {
  const { activationToken } = req.params;

  const user = await User.findOne({
    where: {
      activationToken,
    },
  });

  if (!user) {
    res.sendStatus(404);

    return;
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

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Password is wrong');
  }

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

const logout = async(req, res, next) => {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  res.clearCookie('refreshToken');

  if (userData) {
    await tokenService.remove(userData.id);
  }

  res.sendStatus(204);
};

const sendAuthentication = async(res, user) => {
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
};

const reset = async(req, res) => {
  const { email } = req.body;

  await userService.reset(email);

  res.send({ message: 'OK' });
};

const resetPassword = async(req, res) => {
  const { resetToken } = req.params;
  const { newPassword, passwordConfirmation } = req.body;

  const user = await User.findOne({
    where: { resetToken },
  });

  if (!user) {
    throw ApiError.NotFound('Wrong reset token');
  }

  if (newPassword !== passwordConfirmation) {
    throw ApiError.BadRequest('Passwords did not match');
  }

  const errors = {
    newPassword: validatePassword(newPassword),
    passwordConfirmation: validatePassword(passwordConfirmation),
  };

  if (errors.newPassword || errors.passwordConfirmation) {
    throw ApiError('Validation error', errors);
  }

  const hash = await bcrypt.hash(newPassword, 10);

  user.password = hash;
  user.resetToken = null;

  await user.save();

  res.send({ message: 'OK' });
};

const changeName = async(req, res) => {
  const { refreshToken } = req.cookies;
  const { newName } = req.body;

  const userData = jwtService.validateRefreshToken(refreshToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  const token = await tokenService.getByToken(refreshToken);

  if (!token) {
    throw ApiError.Unauthorized();
  }

  const errors = {
    newName: validateName(newName),
  };

  if (errors.newName) {
    throw ApiError.BadRequest('Invalid name', errors);
  }

  const user = await userService.getByEmail(userData.email);

  user.name = newName;

  await user.save();

  await sendAuthentication(res, user);
};

const changeEmail = async(req, res) => {
  const { refreshToken } = req.cookies;
  const { password, newEmail } = req.body;

  const userData = jwtService.validateRefreshToken(refreshToken);

  if (!userData) {
    throw new ApiError.Unauthorized();
  }

  const token = await tokenService.getByToken(refreshToken);

  if (!token) {
    throw new ApiError.Unauthorized();
  }

  const errors = {
    newEmail: validateEmail(newEmail),
  };

  if (errors.newEmail) {
    throw ApiError.BadRequest('Invalid email', errors);
  }

  const existingError = await userService.getByEmail(newEmail);

  if (existingError) {
    throw ApiError.BadRequest('Email is already taken', {
      email: 'Email is already taken',
    });
  }

  const user = await userService.getByEmail(userData.email);

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Password is wrong');
  }

  await emailService.sendEmailChangeNotification(user.email);

  const activationToken = uuidv4();

  user.email = newEmail;
  user.activationToken = activationToken;

  await user.save();

  await emailService.sendActivalionLink(newEmail, activationToken);

  res.send({ message: 'OK' });
};

const changePassword = async(req, res) => {
  const { password, newPassword, passwordConfirmation } = req.body;
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

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Password is wrong');
  }

  const errors = {
    newPassword: validatePassword(newPassword),
    passwordConfirmation: validatePassword(passwordConfirmation),
  };

  if (errors.newPassword || errors.passwordConfirmation) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  if (newPassword !== passwordConfirmation) {
    throw ApiError.BadRequest('Passwords did not match');
  }

  const hash = await bcrypt.hash(newPassword, 10);

  user.password = hash;

  await user.save();

  await sendAuthentication(res, user);
};

module.exports = {
  register,
  activate,
  login,
  refresh,
  logout,
  reset,
  resetPassword,
  changeName,
  changeEmail,
  changePassword,
};
