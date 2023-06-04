'use srict';

const { Token } = require('../models/token');

const save = async(userId, refreshToken) => {
  const token = await Token.findOne({ where: { userId } });

  if (token) {
    token.refreshToken = refreshToken;
    await token.save();

    return;
  }

  await Token.create({ userId, refreshToken });
};

const getByToken = (refreshToken) => {
  return Token.findOne({ where: { refreshToken } });
};

const removeToken = async(userId) => {
  await Token.destroy({ where: { userId } });
};

module.exports = {
  save,
  getByToken,
  removeToken,
};
