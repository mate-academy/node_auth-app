const { Token } = require('../models/token.model.js');

const save = async (userId, newToken) => {
  const token = await Token.findOne({ where: { userId } });

  if (!token) {
    await Token.create({ userId, refreshToken: newToken });

    return;
  }

  token.refreshToken = newToken;

  await token.save();
};

const getByToken = (refreshToken) => {
  return Token.findOne({ where: { refreshToken } });
};

const remove = async (userId) => {
  return Token.destroy({ where: { userId } });
};

const tokenService = {
  save,
  getByToken,
  remove,
};

module.exports = { tokenService };
