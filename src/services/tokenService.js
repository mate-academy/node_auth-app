import { db } from '../utils/db.js';

function save(userId, newToken) {
  return db.token.upsert({
    create: {
      userId,
      refreshToken: newToken,
    },
    update: {
      refreshToken: newToken,
    },
    where: {
      userId,
    },
  });
}

function getByToken(refreshToken) {
  return db.token.findFirst({ where: { refreshToken } });
}

function remove(userId) {
  return db.token.delete({
    where: {
      userId,
    },
  });
}

export const tokenService = {
  save,
  getByToken,
  remove,
};
