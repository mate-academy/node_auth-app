'use strict';

const { Token } = require('../models/Token');

const save = async(userId, refreshToken) => {
  const token = await Token.findOne({
    where: { userId },
  });

  if (token) {
    token.refreshToken = refreshToken;

    await token.save();

    return;
  }

  await Token.create({
    userId, refreshToken,
  });
};

const getByToken = (refreshToken) => {
  return Token.findOne({
    where: { refreshToken },
  });
};

const remove = async(userId) => {
  return Token.destroy({
    where: { userId },
  });
};

module.exports = {
  save, getByToken, remove,
};
