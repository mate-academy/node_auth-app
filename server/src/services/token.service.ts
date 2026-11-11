import { prisma } from '../db';

function save(userId: number, refreshToken: string) {
  return prisma.token.create({ data: { userId, refreshToken } });
}

function findByToken(refreshToken: string) {
  return prisma.token.findUnique({ where: { refreshToken } });
}

function remove(refreshToken: string) {
  return prisma.token.deleteMany({ where: { refreshToken } });
}

export const tokenService = { save, findByToken, remove };
