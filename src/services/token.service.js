import { Token } from '../models/token.model.js';

const save = async (userId, newToken) => {
  const token = await Token.findOne({ where: { userId } });

  if (!token) {
    await Token.create({ userId, refreshToken: newToken });
    return;
  }

  token.refreshToken = newToken;

  await token.save();
};

const getByToken = (refreshToken) => {
  return Token.findOne({ where: { refreshToken } });
};

const remove = async (userId) => {
  return await Token.destroy({ where: { userId } });
};

export const tokenService = {
  save,
  getByToken,
  remove,
};
