'use strict';

const { Token } = require('../models/token');

const save = async(userId, newToken) => {
  const token = await Token.findOne({ where: { userId } });

  if (!token) {
    await Token.create({
      userId,
      refreshToken: newToken,
    });

    return;
  }

  token.refreshToken = newToken;

  await Token.save();
};

const getByToken = (refrashToken) => {
  return Token.findOne({ where: { refrashToken } });
};

const remove = (userId) => {
  return Token.destroy({ where: { userId } });
};

module.exports = {
  save,
  getByToken,
  remove,
};
