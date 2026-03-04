import { prisma } from '../utils/db.js';

export const create = (
  email: string,
  password: string,
  activationToken?: string,
  name?: string,
) => {
  return prisma.user.create({
    data: {
      email,
      password,
      activationToken,
      name,
    },
  });
};

export const getByEmail = (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const getById = (id: string) => {
  return prisma.user.findUnique({ where: { id } });
};

export const getAllActive = () => {
  return prisma.user.findMany({ where: { activationToken: null } });
};

export const activate = (email: string) => {
  return prisma.user.update({
    where: { email },
    data: { activationToken: null },
  });
};

export const setResetToken = (email: string, resetToken: string | null) => {
  return prisma.user.update({
    where: { email },
    data: { resetToken },
  });
};

export const updatePassword = (id: string, hashedPassword: string) => {
  return prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });
};

export const updateEmail = (
  id: string,
  newEmail: string,
  activationToken: string,
) => {
  return prisma.user.update({
    where: { id },
    data: { email: newEmail, activationToken },
  });
};

export const updateName = (id: string, name: string) => {
  return prisma.user.update({
    where: { id },
    data: { name },
  });
};
