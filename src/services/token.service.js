const { Token } = require('../models/Token.model');

const save = async (UserId, newToken) => {
  const token = await Token.findOne({ where: { UserId } });

  if (!token) {
    await Token.create({ UserId, refreshToken: newToken });
  }

  token.refreshToken = newToken;
  await token.save();
};

const getByToken = (refreshToken) => {
  return Token.findOne({ where: { refreshToken } });
};

const remove = async (UserId) => {
  return Token.destroy({ where: { UserId } });
};

module.exports = {
  TokenService: {
    save,
    getByToken,
    remove,
  },
};
