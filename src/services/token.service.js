import { Token } from '../models/index.js';

const save = async (userId, newToken) => {
  const token = await Token.findOne({
    where: {
      userId,
    },
  });

  if (!token) {
    await Token.create({ userId, refreshToken: newToken });

    return;
  }

  token.refreshToken = newToken;

  await token.save();
};

const getByToken = async (refreshToken) => {
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
