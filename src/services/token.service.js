'use strict';

const { Token } = require('../models/token.js');

const createRefreshToken = async (userId, refreshToken) => {
  const [token] = await Token.findOrCreate({
    where: { userId },
    defaults: {
      refreshToken,
      userId,
    },
  });

  return token;
};

const getByToken = (refreshToken) => {
  return Token.findOne({ where: { refreshToken } });
};

const remove = async (userId) => {
  return Token.destroy({ where: { userId } });
};

exports.tokenService = {
  createRefreshToken,
  getByToken,
  remove,
};
