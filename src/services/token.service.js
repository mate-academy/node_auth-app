const { Token } = require('../models');

const save = async (userId, newToken) => {
  const token = await Token.findOne({ where: { userId } });

  if (token) {
    token.refreshToken = newToken;
    await token.save();

    return;
  }

  await Token.create({ userId, refreshToken: newToken });
};

const getByToken = (refreshToken) => {
  return Token.findOne({ where: { refreshToken } });
};

const remove = (userId) => {
  return Token.destroy({ where: { userId } });
};

module.exports = {
  save,
  getByToken,
  remove,
};
