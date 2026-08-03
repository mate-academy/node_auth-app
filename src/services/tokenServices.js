const { Token } = require('../models/token.js');

const save = async (UserId, newToken) => {
  const token = await Token.findOne({ where: { UserId } });

  if (!token) {
    await Token.create({ UserId, refreshToken: newToken });

    return;
  }
  token.refreshToken = newToken;
  await token.save();
};

const getByToken = async (refreshToken) => {
  return Token.findOne({ where: { refreshToken } });
};

const remove = (UserId) => {
  return Token.destroy({ where: { UserId } });
};

const tokenServices = {
  save,
  getByToken,
  remove,
};

module.exports = {
  tokenServices,
};
