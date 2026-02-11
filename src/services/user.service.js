import { ApiError } from '../utils/api.error.js';
import { db } from '../utils/db.js';
import { logger } from '../utils/logger.js';

const normalize = ({ id, name, email }) => {
  return {
    id,
    name,
    email,
  };
};

const register = async (name, email, password, activationToken) => {
  await db.user.create({
    data: {
      name,
      email,
      password,
      activationToken,
    },
  });
};

const activate = async (activationToken) => {
  return await db.user.update({
    data: { activationToken: null },
    where: { activationToken },
  });
};

const getById = async (id) => {
  return db.user.findUnique({ where: { id } });
};

const getByEmail = async (email) => {
  return db.user.findUnique({ where: { email } });
};

const getProfile = async (userId, refreshToken) => {
  if (!refreshToken) {
    logger.warn('Get profile attempt without refresh token', { userId });
    throw ApiError.unauthorized();
  }

  const user = await getById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return normalize(user);
};

const getByActivationToken = async (activationToken) => {
  return db.user.findUnique({
    where: { activationToken },
  });
};

const getByPasswordResetToken = async (passwordResetToken) => {
  return db.user.findUnique({
    where: { passwordResetToken },
  });
};

const updatePassword = async (id, newPassword) => {
  await db.user.update({
    data: { password: newPassword },
    where: { id },
  });
};

const setPasswordResetToken = async (id, passwordResetToken) => {
  await db.user.update({
    data: { passwordResetToken },
    where: { id },
  });
};

const clearPasswordResetToken = async (id) => {
  await db.user.update({
    data: { passwordResetToken: null },
    where: { id },
  });
};

const updateName = async (id, name) => {
  await db.user.update({
    data: { name },
    where: { id },
  });
};

const setPendingEmail = async (id, newEmail, pendingEmailToken) => {
  await db.user.update({
    data: { pendingEmail: newEmail, pendingEmailToken },
    where: { id },
  });
};

const updateEmail = async (id, pendingEmail) => {
  await db.user.update({
    data: {
      email: pendingEmail,
      pendingEmail: null,
      pendingEmailToken: null,
    },
    where: { id },
  });
};

const getByPendingEmailToken = async (pendingEmailToken) => {
  return db.user.findUnique({
    where: { pendingEmailToken },
  });
};

const getByPendingEmail = async (pendingEmail) => {
  return db.user.findUnique({
    where: { pendingEmail },
  });
};

export const userService = {
  normalize,
  register,
  activate,
  getById,
  getByEmail,
  getProfile,
  getByActivationToken,
  getByPasswordResetToken,
  updatePassword,
  setPasswordResetToken,
  clearPasswordResetToken,
  setPendingEmail,
  updateName,
  updateEmail,
  getByPendingEmailToken,
  getByPendingEmail,
};
