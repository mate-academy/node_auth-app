import { Token } from '../models/token.js';

const save = async (userId, refreshToken) => {
  let token = await Token.findOne({ where: { userId } });

  if (token) {
    token.refreshToken = refreshToken;
    await token.save();

    return token;
  }

  token = await Token.create({ userId, refreshToken });

  return token;
};

const remove = async (userId) => {
  return Token.destroy({ where: { userId } });
};

const getByToken = async (refreshToken) => {
  return Token.findOne({ where: { refreshToken } });
};

export const tokenService = {
  save,
  getByToken,
  remove,
};
