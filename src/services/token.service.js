import { db } from '../utils/db.js';

function create(userId, token) {
  return db.token.create({
    data: { userId, token },
  });
}

function getByToken(token) {
  return db.token.findFirst({
    where: {
      token,
    },
  });
}

function getByUserId(userId) {
  return db.token.findUnique({
    where: {
      userId,
    },
  });
}

async function deleteByUserId(userId) {
  return db.token.deleteMany({
    where: {
      userId,
    },
  });
}

export const tokenService = {
  create,
  getByToken,
  deleteByUserId,
  getByUserId,
};
