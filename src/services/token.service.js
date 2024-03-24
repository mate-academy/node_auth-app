import { Token } from '../models/Token.js';

const getByUserId = async (userId) => {
  return Token.findOne({ where: { userId } });
};

const createToken = async (userId, authToken) => {
  await Token.create({ userId, authToken });
};

const destroy = async (userId) => {
  await Token.destroy({ where: { userId } });
};

export const tokenService = {
  createToken,
  getByUserId,
  destroy,
};
