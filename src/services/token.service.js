'use strict';

const { Token } = require('../models/token.js');

async function save(userId, newToken) {
  const token = await Token.findOne({ where: { userId } });

  if (!token) {
    await Token.create({ userId, refreshToken: token });

    // eslint-disable-next-line no-useless-return
    return;
  }

  await token.save();
};

async function getByToken(refreshToken) {
  return Token.findOne({ where: refreshToken });
};

async function remove(userId) {
  return Token.destroy({ where: { userId } });
}

module.exports = {
  save,
  getByToken,
  remove,
};
