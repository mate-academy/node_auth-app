import { prisma } from '../../lib/prisma.js';

type CreateUserData = {
  name: string;
  email: string;
  passwordHash: string;
  activationToken: string;
};

const findByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

const create = (data: CreateUserData) => {
  return prisma.user.create({
    data,
  });
};

const findByActivationToken = (token: string) => {
  return prisma.user.findUnique({
    where: { activationToken: token },
  });
};

const activate = (userId: number) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      isActivated: true,
      activationToken: null,
    },
  });
};

const updateName = (userId: number, name: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { name },
  });
};

const findById = (userId: number) => {
  return prisma.user.findUnique({
    where: { id: userId },
  });
};

const updatePassword = (userId: number, passwordHash: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
};

const setPasswordResetToken = (
  userId: number,
  resetPasswordToken: string,
  resetTokenExpires: Date,
) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      resetPasswordToken,
      resetTokenExpires,
    },
  });
};

const findByPasswordResetToken = (token: string) => {
  return prisma.user.findUnique({
    where: {
      resetPasswordToken: token,
    },
  });
};

const clearPasswordResetToken = (userId: number) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      resetPasswordToken: null,
      resetTokenExpires: null,
    },
  });
};

const setEmailChangeData = (
  userId: number,
  pendingEmail: string,
  emailChangeToken: string,
) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      pendingEmail,
      emailChangeToken,
    },
  });
};

const findByEmailChangeToken = (token: string) => {
  return prisma.user.findUnique({
    where: {
      emailChangeToken: token,
    },
  });
};

const confirmEmailChange = (userId: number, newEmail: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      email: newEmail,
      pendingEmail: null,
      emailChangeToken: null,
    },
  });
};

export const usersRepository = {
  findByEmail,
  create,
  findByActivationToken,
  activate,
  updateName,
  findById,
  updatePassword,
  setPasswordResetToken,
  findByPasswordResetToken,
  clearPasswordResetToken,
  setEmailChangeData,
  findByEmailChangeToken,
  confirmEmailChange,
};
