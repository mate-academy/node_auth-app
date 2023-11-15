'use strict';

const { User } = require('../models/User.js');
const bcrypt = require('bcrypt');
const { v4 } = require('uuid');
const {
  sendActivationEmail,
  sendResetLink,
  sendNotifyOldEmail,
} = require('./email.service.js');
const { ApiError } = require('../exceptions/api.error.js');
const { jwtService } = require('./jwt.service.js');

const register = async(name, email, password) => {
  const activationToken = v4();
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    throw ApiError.badRequest('User with this email already exist!');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashedPassword,
    activationToken,
  });

  await sendActivationEmail(name, email, activationToken);
};

const getUserByEmail = (email) => {
  return User.findOne({ where: { email } });
};

const getUserById = (id) =>
  User.findOne({
    where: {
      id,
    },
  });

const getUserByActivationToken = (activationToken) => {
  return User.findOne({ where: { activationToken } });
};

const getUsers = () => User.findAll();

const normalize = ({ id, email, name }) => ({
  id,
  email,
  name,
});

const forgotPassword = async(res, email) => {
  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    throw ApiError.badRequest(`There's no registered user with email ${email}`);
  }

  const resetToken = jwtService.generateToken(
    { userId: existingUser.id },
    'JWT_RESET_SECRET',
    '3600s'
  );

  res.cookie('resetToken', resetToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  await sendResetLink(email, resetToken);
};

const resetPassword = async(resetToken, newPassword) => {
  const decodedToken = jwtService.verifyToken(resetToken, 'JWT_RESET_SECRET');

  if (!decodedToken) {
    throw ApiError.unAuthorized('Invalid reset token!');
  }

  const { userId } = decodedToken;
  const foundUser = await getUserById(userId);

  if (!foundUser) {
    throw ApiError.notFound('User was not found!');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  foundUser.password = hashedPassword;

  await foundUser.save();

  return foundUser;
};

const updateEmail = async(confirmationToken) => {
  const decodedToken = jwtService.verifyToken(
    confirmationToken,
    'JWT_CONFIRMATION_SECRET'
  );

  if (!decodedToken) {
    throw ApiError.unAuthorized('Invalid confirmation token!');
  }

  const { userId, newEmail } = decodedToken;

  const foundUser = await userService.getUserById(userId);

  if (!foundUser) {
    throw ApiError.notFound('User not found!');
  }

  if (!newEmail) {
    throw ApiError.notFound('New email not found!');
  }

  await sendNotifyOldEmail(foundUser.name, foundUser.email);

  foundUser.email = newEmail;

  await foundUser.save();

  return foundUser;
};

const userService = {
  getUserByEmail,
  getUserByActivationToken,
  normalize,
  getUsers,
  register,
  forgotPassword,
  resetPassword,
  getUserById,
  updateEmail,
};

module.exports = { userService };
