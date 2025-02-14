import { Token } from '../models/Token.model.js';

export const save = async (userId, refreshToken) => {
  const token = await Token.findOne({ where: { userId } });

  if (token) {
    token.refreshToken = refreshToken;

    await token.save();

    return;
  }

  await Token.create({ userId, refreshToken });
};

export const getByToken = async (refreshToken) => {
  return Token.findOne({ where: { refreshToken } });
};

export const remove = async (userId) => {
  await Token.destroy({ where: { userId } });
};

export const tokenService = {
  save,
  getByToken,
  remove,
};
