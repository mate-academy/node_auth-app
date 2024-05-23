import { Token } from '../models/Token.js';

const save = async (userId, refreshToken) => {
  const token = await Token.findOne({ where: { userId } });

  if (token) {
    token.refreshToken = refreshToken;
    return token.save();
  }

  return Token.create({
    userId,
    refreshToken,
  });
};

const remove = (userId) => {
  return Token.destroy({
    where: { userId },
  });
};

const getByToken = (refreshToken) => {
  return Token.findOne({ where: { refreshToken } });
};

export default {
  save,
  remove,
  getByToken,
};
