import { Op } from 'sequelize';
import Token from '../models/Token.js';

export const createToken = async (userId, token) => {
  const createdToken = await Token.create({
    token,
    userId,
  });

  return createdToken;
};

export const findTokenByUserId = async (userId) => {
  const token = await Token.findOne({ where: { userId } });

  return token;
};

export const findTokenByToken = async (token) => {
  const foundToken = await Token.findOne({ where: { token } });

  return foundToken;
};

export const deleteTokenByToken = async (token) => {
  const deletedToken = await Token.destroy({ where: { token } });

  return deletedToken;
};

export const deleteAllTokenByUserId = async (userId) => {
  const deletedTokens = await Token.destroy({ where: { userId } });

  return deletedTokens;
};

export const deleteAllTokenByUserIdAndCurrentToken = async (userId, token) => {
  const deletedTokens = await Token.destroy({
    where: { userId, token: { [Op.not]: token } },
  });

  return deletedTokens;
};
