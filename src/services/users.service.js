import { db } from '../db.js';

function getAllActive() {
  return db.user.findMany({
    where: { activationToken: null },
  });
}

function getUser(email) {
  return db.user.findFirst({
    where: {
      email,
    },
  });
}

function updateUser(email, data) {
  return db.user.update({
    where: { email },
    data,
  });
}

export const usersService = {
  getAllActive,
  getUser,
  updateUser,
};
