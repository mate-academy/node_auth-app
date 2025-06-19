import { prisma } from '../utils/db.js';

function create(userId, token) {
  return prisma.token.create({
    data: { userId, token },
  });
}

function getByToken(token) {
  return prisma.token.findFirst({
    where: { token },
  });
}

function getByUserId(userId) {
  return prisma.token.findFirst({
    where: { userId },
  });
}

function deleteByUserId(userId) {
  return prisma.token.deleteMany({
    where: { userId },
  });
}

export const tokensRepository = {
  create,
  getByToken,
  deleteByUserId,
  getByUserId,
};
