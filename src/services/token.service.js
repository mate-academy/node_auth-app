import { Token } from '../models/index.js';

const save = async (userId, newToken) => {
  let token = await Token.findOne({ where: { userId } });

  if (!token) {
    token = await Token.create({ userId, refreshToken: newToken });

    return token;
  }

  token.refreshToken = newToken;
  await token.save();

  return token;
};

const getByToken = (refreshToken) => {
  return Token.findOne({ where: { refreshToken } });
};

const remove = async (userId) => {
  return Token.destroy({ where: { userId } });
};

export const tokenService = {
  save,
  getByToken,
  remove,
};
