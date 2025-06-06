import { Token } from '../models/token.js';

const save = async (userId, newToken) => {
  const token = await Token.findOne({ where: { userId } });

  if (!token) {
    await Token.create({
      refreshToken: newToken,
      userId,
    });

    return;
  }

  token.refreshToken = newToken;

  await token.save();
};

const getByToken = (refreshToken) => {
  return Token.findOne({ where: { refreshToken } });
};

const remove = (userId) => {
  return Token.destroy({ where: { userId } });
};

export const tokenService = {
  save,
  getByToken,
  remove,
};
