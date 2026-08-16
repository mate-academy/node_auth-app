import { db } from '../utils/db.js';

const tokenModel = db.token;

async function save(userId, refreshToken) {
  return tokenModel.upsert({
    where: { userId },
    update: { refreshToken },
    create: {
      userId,
      refreshToken,
    },
  });
}

async function findByToken(refreshToken) {
  return tokenModel.findUnique({
    where: { refreshToken },
  });
}

async function remove(userId) {
  return tokenModel.delete({
    where: { userId },
  });
}

export const tokenService = { save, findByToken, remove };
