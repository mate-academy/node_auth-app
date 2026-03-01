import { User } from '../models/User.model.js';

const validateEmail = (email) => {
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!email) {
    return 'Email is required';
  }

  if (!emailPattern.test(email)) {
    return 'Email is not valid';
  }
};

const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'At least 6 characters';
  }
};

const validateUserName = (name) => {
  if (!name) {
    return 'User name is required';
  }

  if (name.length < 2) {
    return 'User name must be at least 2 characters';
  }
};

const getActiveUsers = async () => {
  const users = await User.findAll({ where: { activationToken: null } });

  return users;
};

const getUserById = async (id) => {
  const user = await User.findByPk(id);

  if (!user) {
    return null;
  }

  return user.get({ plain: true });
};

const getUserByEmail = async (email) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return null;
  }

  return user.get({ plain: true });
};

const getUserByResetPasswordToken = async (resetPasswordToken) => {
  const user = await User.findOne({ where: { resetPasswordToken } });

  if (!user) {
    return null;
  }

  return user.get({ plain: true });
};

const activate = async (email) => {
  await User.update(
    { activationToken: null, lastActivationEmailSentAt: null },
    { where: { email } },
  );

  return getUserByEmail(email);
};

const createUser = async (userData) => {
  const user = await User.create(userData);

  if (user) {
    return getUserById(user.id);
  }

  return null;
};

const updateUser = async (id, dataToUpdate) => {
  await User.update(dataToUpdate, { where: { id } });

  return getUserById(id);
};

export const userService = {
  validateEmail,
  validatePassword,
  validateUserName,
  getActiveUsers,
  getUserById,
  getUserByEmail,
  getUserByResetPasswordToken,
  activate,
  createUser,
  updateUser,
};
