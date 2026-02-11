import { db } from '../utils/db.js';

const create = async (userId, newToken) => {
  await db.token.upsert({
    where: { userId },
    update: { refreshToken: newToken },
    create: { userId, refreshToken: newToken },
  });
};

const getByToken = async (refreshToken) => {
  return db.token.findUnique({
    where: { refreshToken },
  });
};

const removeByToken = async (refreshToken) => {
  await db.token.delete({
    where: { refreshToken },
  });
};

const invalidateSessions = async (userId) => {
  return db.token.deleteMany({ where: { userId } });
};

export const tokenService = {
  create,
  getByToken,
  removeByToken,
  invalidateSessions,
};
