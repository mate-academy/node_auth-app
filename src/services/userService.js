const { v4: uuidv4 } = require('uuid');
const { prisma } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');

const createUser = async (userData) => {
  const { name, email, password } = userData;

  const hashedPassword = await hashPassword(password);
  const activationToken = uuidv4();

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      activationToken,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      activationToken: true,
    },
  });

  return user;
};

const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

const findUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
    },
  });
};

const findUserByActivationToken = async (token) => {
  return prisma.user.findUnique({
    where: { activationToken: token },
  });
};

const findUserByResetToken = async (token) => {
  return prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  });
};

const activateUser = async (token) => {
  const user = await prisma.user.update({
    where: { activationToken: token },
    data: {
      isActive: true,
      activationToken: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
    },
  });

  return user;
};

const updateUser = async (id, updateData) => {
  return prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
    },
  });
};

const updateUserPassword = async (userId, oldPassword, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const isValidPassword = await comparePassword(oldPassword, user.password);

  if (!isValidPassword) {
    throw new Error('Invalid current password');
  }

  const hashedNewPassword = await hashPassword(newPassword);

  return prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
    },
  });
};

const setResetToken = async (email) => {
  const resetToken = uuidv4();
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

  const user = await prisma.user.update({
    where: { email },
    data: {
      resetToken,
      resetTokenExpiry,
    },
  });

  return user;
};

const resetPassword = async (token, newPassword) => {
  const hashedPassword = await hashPassword(newPassword);

  const user = await prisma.user.update({
    where: { resetToken: token },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
    },
  });

  return user;
};

const changeUserEmail = async (userId, password, newEmail) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    throw new Error('Invalid password');
  }

  const existingUser = await findUserByEmail(newEmail);

  if (existingUser) {
    throw new Error('Email already in use');
  }

  return prisma.user.update({
    where: { id: userId },
    data: { email: newEmail },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
    },
  });
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByActivationToken,
  findUserByResetToken,
  activateUser,
  updateUser,
  updateUserPassword,
  setResetToken,
  resetPassword,
  changeUserEmail,
};
