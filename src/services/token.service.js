'use strict';

const { Token } = require('../models/Token.js');

const save = async(userId, refreshToken) => {
  const token = await Token.findOne({ where: { userId } });

  if (token) {
    token.refreshToken = refreshToken;

    await token.save();

    return;
  }

  await Token.create({
    userId, refreshToken,
  });
};

const getByToken = async(refreshToken) => {
  return Token.findOne({ where: { refreshToken } });
};

const remove = async(userId) => {
  return Token.destroy({ where: { userId } });
};

const tokenService = {
  remove,
  getByToken,
  save,
};

module.exports = { tokenService };
