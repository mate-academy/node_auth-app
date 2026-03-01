import { db } from '../utils/db.js';

async function save(userId, refreshToken) {
  const tokenExists = await db.token.findUnique({
    where: { userId },
  });

  if (tokenExists) {
    return db.token.update({
      where: { userId },
      data: { token: refreshToken },
    });
  }

  return db.token.create({
    data: {
      userId,
      token: refreshToken,
    },
  });
}

async function getByToken(refreshToken) {
  return db.token.findFirst({
    where: { token: refreshToken },
  });
}

async function remove(userId) {
  return db.token.delete({
    where: { userId },
  });
}

async function removeByToken(refreshToken) {
  return db.token.deleteMany({
    where: { token: refreshToken },
  });
}

export const tokenService = {
  save,
  getByToken,
  remove,
  removeByToken,
};
