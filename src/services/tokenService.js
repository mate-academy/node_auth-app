import { db } from '../utils/db.js';

async function save(userId, newToken) {
  const token = await db.token.findFirst({
    where: { userId },
  });

  if (!token) {
    await db.token.create({
      data: {
        userId,
        refreshToken: newToken,
      },
    });

    return;
  }

  await db.token.update({
    where: {
      userId,
    },
    data: { refreshToken: newToken },
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
