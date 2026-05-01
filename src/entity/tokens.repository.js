import { Token } from '../models/Token.js';

function create(userId, token) {
  return Token.create({ userId, token });
}

function getByToken(token) {
  return Token.findOne({ where: { token } });
}

function deleteByUserId(userId) {
  return Token.destroy({ where: { userId } });
}

export const tokensRepository = {
  create,
  getByToken,
  deleteByUserId,
};
