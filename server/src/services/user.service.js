const { randomUUID } = require('node:crypto');
const User = require('../models/user.model.js');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { ApiError } = require('../exeptions/api.error.js');
const { emailService } = require('./email.service.js');
const {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LENGTH_MESSAGE,
} = require('../constants/auth.constants.js');

const getAllUsers = async (req, res) => {
  const users = await User.findAll();

  const normalizedUsers = users.map(normalizeUser);

  res.status(200).json(normalizedUsers);
};

const getUserByActivationToken = async (activationToken) => {
  return User.findOne({ where: { activationToken: activationToken } });
};

const requestPasswordReset = async (email) => {
  if (typeof email !== 'string' || !email.trim()) {
    throw ApiError.BadRequest('Email is required', {
      email: 'Email is required',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({
    where: { email: { [Op.iLike]: normalizedEmail } },
  });

  if (!user) {
    return;
  }

  const resetPasswordToken = randomUUID();

  user.resetPasswordToken = resetPasswordToken;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  await emailService.sendPasswordResetEmail(user.email, resetPasswordToken);
};

const resetPassword = async (token, payload = {}) => {
  const { password, confirmation } = payload || {};

  if (
    typeof password !== 'string' ||
    typeof confirmation !== 'string' ||
    !password ||
    !confirmation
  ) {
    throw ApiError.BadRequest('Password and confirmation are required', {
      password: 'Password and confirmation are required',
      confirmation: 'Password and confirmation are required',
    });
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    throw ApiError.BadRequest(PASSWORD_MIN_LENGTH_MESSAGE, {
      password: PASSWORD_MIN_LENGTH_MESSAGE,
    });
  }

  if (password !== confirmation) {
    throw ApiError.BadRequest('Password confirmation does not match', {
      confirmation: 'Passwords do not match',
    });
  }

  if (typeof token !== 'string' || !token) {
    throw ApiError.BadRequest('Invalid or expired password reset link', {
      token: 'Invalid or expired password reset link',
    });
  }

  const user = await User.findOne({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { [Op.gt]: new Date() },
    },
  });

  if (!user) {
    throw ApiError.BadRequest('Invalid or expired password reset link', {
      token: 'Invalid or expired password reset link',
    });
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id);

  if (!user) {
    throw ApiError.NotFound('User not found', {
      id: 'User not found',
    });
  }

  res.status(200).json(normalizeUser(user));
};

const getUserByEmail = async (email) => {
  if (typeof email !== 'string' || !email.trim()) {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({
    where: { email: { [Op.iLike]: normalizedEmail } },
  });

  if (!user) {
    return null;
  }

  return normalizeUser(user);
};

const findUserById = async (id) => {
  const user = await User.findByPk(id);

  return user ? normalizeUser(user) : null;
};

const checkPassword = async (id, password) => {
  const user = await User.findByPk(id);

  if (!user) {
    return false;
  }

  return bcrypt.compare(password, user.password);
};

const updateUser = async (req, res) => {
  const { name } = req.body;

  if (typeof name !== 'string' || !name.trim()) {
    throw ApiError.BadRequest('Name is required', {
      name: 'Name is required',
    });
  }

  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw ApiError.NotFound({ user: 'User not found' });
  }

  user.name = name.trim();

  await user.save();

  res.status(200).json(normalizeUser(user));
};

const changePassword = async (userId, payload = {}) => {
  const { currentPassword, newPassword, confirmation } = payload || {};

  if (
    typeof currentPassword !== 'string' ||
    typeof newPassword !== 'string' ||
    typeof confirmation !== 'string' ||
    !currentPassword ||
    !newPassword ||
    !confirmation
  ) {
    throw ApiError.BadRequest('All password fields are required');
  }

  if (newPassword.length < PASSWORD_MIN_LENGTH) {
    throw ApiError.BadRequest(PASSWORD_MIN_LENGTH_MESSAGE, {
      newPassword: PASSWORD_MIN_LENGTH_MESSAGE,
    });
  }

  if (newPassword !== confirmation) {
    throw ApiError.BadRequest('Password confirmation does not match', {
      confirmation: 'Passwords do not match',
    });
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.NotFound({ user: 'User not found' });
  }

  if (!(await bcrypt.compare(currentPassword, user.password))) {
    throw ApiError.BadRequest('Current password is incorrect', {
      currentPassword: 'Current password is incorrect',
    });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return normalizeUser(user);
};

const changeEmail = async (userId, payload = {}) => {
  const { password, email, confirmation } = payload || {};

  if (
    typeof password !== 'string' ||
    typeof email !== 'string' ||
    typeof confirmation !== 'string' ||
    !password ||
    !email.trim() ||
    !confirmation.trim()
  ) {
    throw ApiError.BadRequest('Password, email, and confirmation are required');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedConfirmation = confirmation.trim().toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalizedEmail)) {
    throw ApiError.BadRequest('Email is not valid', {
      email: 'Email is not valid',
    });
  }

  if (normalizedEmail !== normalizedConfirmation) {
    throw ApiError.BadRequest('Email confirmation does not match', {
      confirmation: 'Email addresses do not match',
    });
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.NotFound({ user: 'User not found' });
  }

  if (!(await bcrypt.compare(password, user.password))) {
    throw ApiError.BadRequest('Password is incorrect', {
      password: 'Password is incorrect',
    });
  }

  if (normalizedEmail === user.email.toLowerCase()) {
    throw ApiError.BadRequest('New email must be different');
  }

  const existingUser = await User.findOne({
    where: { email: { [Op.iLike]: normalizedEmail } },
  });

  if (existingUser) {
    throw ApiError.Conflict('User with this email already exists', {
      email: 'User with this email already exists',
    });
  }

  await emailService.sendEmailChangeNotification(user.email, normalizedEmail);

  user.email = normalizedEmail;

  try {
    await user.save();
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw ApiError.Conflict('User with this email already exists', {
        email: 'User with this email already exists',
      });
    }

    throw error;
  }

  return normalizeUser(user);
};

const normalizeUser = (user) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
};

const isUserActivated = async (id) => {
  const user = await User.findByPk(id);

  return user.activationToken === null;
};

const createUser = async (name, email, password) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({
    where: { email: { [Op.iLike]: normalizedEmail } },
  });

  if (existingUser) {
    if (existingUser.activationToken) {
      await emailService.sendActivationEmail(
        existingUser.email,
        existingUser.activationToken,
      );

      return normalizeUser(existingUser);
    }

    throw ApiError.BadRequest('User with this email already exists', {
      email: 'User with this email already exists',
    });
  }

  const activationToken = randomUUID();
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    activationToken,
  });

  await emailService.sendActivationEmail(user.email, activationToken);

  return normalizeUser(user);
};

const userService = {
  getUserById,
  updateUser,
  changePassword,
  changeEmail,
  isUserActivated,
  createUser,
  getUserByEmail,
  findUserById,
  checkPassword,
  getAllUsers,
  getUserByActivationToken,
  requestPasswordReset,
  resetPassword,
};

module.exports = { userService };
