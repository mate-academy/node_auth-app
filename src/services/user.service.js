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

const register = async (name, email, password, activationToken, expiresAt) => {
  await db.user.create({
    data: {
      name,
      email,
      password,
      activationToken,
      activationExpiresAt: expiresAt,
    },
  });
};

const activate = async (activationToken) => {
  return db.user.update({
    data: { activationToken: null, activationExpiresAt: null },
    where: { activationToken },
  });
};

const getById = async (id) => {
  return db.user.findUnique({ where: { id } });
};

const getByEmail = async (email) => {
  return db.user.findUnique({ where: { email } });
};

const getProfile = async (userId) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { socialAccounts: { select: { provider: true } } },
  });

  if (!user) {
    logger.warn('Get profile attempt for non-existent user', { userId });
    throw ApiError.notFound();
  }

  return {
    ...normalize(user),
    hasPassword: !!user.password,
    socialAccounts: user.socialAccounts.map((a) => a.provider),
  };
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

const setPasswordResetToken = async (id, passwordResetToken, expiresAt) => {
  await db.user.update({
    data: { passwordResetToken, passwordResetExpiresAt: expiresAt },
    where: { id },
  });
};

const clearPasswordResetToken = async (id) => {
  await db.user.update({
    data: { passwordResetToken: null, passwordResetExpiresAt: null },
    where: { id },
  });
};

const updateName = async (id, name) => {
  await db.user.update({
    data: { name },
    where: { id },
  });
};

const setPendingEmail = async (id, newEmail, pendingEmailToken, expiresAt) => {
  await db.user.update({
    data: {
      pendingEmail: newEmail,
      pendingEmailToken,
      pendingEmailExpiresAt: expiresAt,
    },
    where: { id },
  });
};

const updateEmail = async (id, pendingEmail) => {
  await db.user.update({
    data: {
      email: pendingEmail,
      pendingEmail: null,
      pendingEmailToken: null,
      pendingEmailExpiresAt: null,
    },
    where: { id },
  });
};

const clearPendingEmail = async (id) => {
  await db.user.update({
    data: {
      pendingEmail: null,
      pendingEmailToken: null,
      pendingEmailExpiresAt: null,
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

const createSocialUser = async (name, email) => {
  return db.user.create({
    data: { name, email },
  });
};

const clearActivation = async (id) => {
  return db.user.update({
    where: { id },
    data: { activationToken: null, activationExpiresAt: null },
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
  clearPendingEmail,
  updateName,
  updateEmail,
  getByPendingEmailToken,
  getByPendingEmail,
  createSocialUser,
  clearActivation,
};
