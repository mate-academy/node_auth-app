import { Token } from '../models/tokenModel.js';

const save = (userId, refreshToken) => {
  return Token.create({ userId, refreshToken });
};

const getByToken = (refreshToken) => {
  return Token.findOne({ where: { refreshToken } });
};

const remove = (refreshToken) => {
  return Token.destroy({ where: { refreshToken } });
};

export const tokenService = {
  save,
  getByToken,
  remove,
};
