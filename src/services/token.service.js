const { Token } = require('../models/Token.model');

const save = async (userId, newToken) => {
  const token = await Token.findOne({ where: { UserId: userId } });

  if (!token) {
    await Token.create({ UserId: userId, refreshToken: newToken });

    return;
  }

  token.refreshToken = newToken;

  await token.save();
};

const getByToken = async (refreshToken) => {
  return Token.findOne({ where: { refreshToken } });
};

const remove = async (userId) => {
  return Token.destroy({ where: { UserId: userId } });
};

module.exports = {
  save,
  getByToken,
  remove,
};
