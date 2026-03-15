import { db } from '../utils/db.js';

function create(userId: string, token: string) {
  return db.token.create({
    data: { userId, token },
  });
}

function getByToken(token: string) {
  return db.token.findFirst({
    where: { token },
  });
}

function deleteByUserId(userId: string) {
  return db.token.deleteMany({
    where: { userId },
  });
}

export const tokensRepository = {
  create,
  getByToken,
  deleteByUserId,
};
