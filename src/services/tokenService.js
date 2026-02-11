import { Token } from '../models/tokenModel.js';

export const save = async (UserId, newToken) => {
  const token = await Token.findOne({ where: { UserId } });

  if (!token) {
    await Token.create({ UserId, refreshToken: newToken });

    return;
  }

  token.refreshToken = newToken;

  await token.save();
};

export const getByToken = (refreshToken) => {
  return Token.findOne({ where: { refreshToken } });
};

export const remove = (userId) => {
  return Token.destroy({ where: { UserId: userId } });
};

export const removeByUserId = (userId) => {
  return Token.destroy({
    where: { UserId: userId },
  });
};

export const removeByToken = (refreshToken) => {
  return Token.destroy({
    where: { refreshToken },
  });
};

export const tokenService = {
  save,
  getByToken,
  removeByUserId,
  removeByToken,
  remove,
};
