import { prisma } from '../utils/db.js';

const createUser = async (email, name, password, activationToken) => {
  return prisma.user.create({
    data: {
      email,
      name,
      password,
      activationToken,
    },
  });
};

const getByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

const getByName = async (name) => {
  return prisma.user.findUnique({
    where: { name },
  });
};

const activate = async (email) => {
  return prisma.user.update({
    where: { email },
    data: { activationToken: null },
  });
};

const getAllActive = () => {
  return prisma.user.findMany({
    where: { activationToken: null },
  });
};

const setResetPasswordToken = async (email, resetPasswordToken) => {
  return prisma.user.update({
    where: { email },
    data: { resetPasswordToken: resetPasswordToken },
  });
};

const resetPassword = (email, newPassword) => {
  return prisma.user.update({
    where: { email },
    data: { password: newPassword },
  });
};

const setNewName = (email, newName) => {
  return prisma.user.update({
    where: { email },
    data: { name: newName },
  });
};

const setNewEmail = (email, newEmail) => {
  return prisma.user.update({
    where: { email },
    data: { email: newEmail },
  });
};

const setChangeEmailToken = (email, changeEmailToken, newEmail) => {
  return prisma.user.update({
    where: { email },
    data: { changeEmailToken: changeEmailToken, newEmail: newEmail },
  });
};

const usersRepository = {
  createUser,
  getByEmail,
  getByName,
  activate,
  getAllActive,
  resetPassword,
  setResetPasswordToken,
  setNewName,
  setNewEmail,
  setChangeEmailToken,
};

export default usersRepository;
