'use strict';

const { Token } = require('../models/token-model');

const saveToken = async (userId, refreshToken) => {
  await Token.create({
    userId: userId,
    token: refreshToken,
  });
};

const getToken = async (token) => {
  const findToken = await Token.findOne({
    where: { token },
  });

  return findToken;
};

const removeToken = async (refreshToken) => {
  const removedCount = await Token.destroy({ where: { token: refreshToken } });

  return removedCount;
};

module.exports = {
  saveToken,
  getToken,
  removeToken,
};
