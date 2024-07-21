import { Token } from '../models/token.js';
import { User } from '../models/user.js';

async function getUser(id) {
  return User.findOne({ where: { id } });
}

function normalize({ id, email }) {
  return { id, email };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

const getUserToken = async (userId) => {
  return Token.findOne({ where: { userId } });
};

export const userService = {
  normalize,
  findByEmail,
  getUser,
  getUserToken,
};
