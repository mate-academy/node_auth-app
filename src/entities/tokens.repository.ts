import { prisma } from '../utils/db.js';

export const create = (userId: string, token: string) => {
  return prisma.token.create({
    data: { userId, token },
  });
};

export const getByToken = (token: string) => {
  return prisma.token.findFirst({ where: { token } });
};

export const deleteByUserId = (userId: string) => {
  return prisma.token.deleteMany({ where: { userId } });
};
