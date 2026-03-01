import { Token } from '../models/Token.model.js';

const getByToken = async (refreshToken) => {
  const token = await Token.findOne({ where: { refreshToken } });

  if (token) {
    return token.get({ plain: true });
  }

  return null;
};

const create = async ({ userId, refreshToken }) => {
  await Token.create({ userId, refreshToken });
};

const deleteByUserId = async (userId) => {
  await Token.destroy({ where: { userId } });
};

const deleteByToken = async (refreshToken) => {
  await Token.destroy({ where: { refreshToken } });
};

export const tokenService = {
  getByToken,
  create,
  deleteByUserId,
  deleteByToken,
};
