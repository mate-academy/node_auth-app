const { Token } = require('../models/Token.model');

async function save(UserId, newToken) {
  const token = await Token.findOne({ where: { UserId } });

  if (!token) {
    await Token.create({ UserId, refreshToken: newToken });
  }

  token.refreshToken = newToken;
  await token.save();
}

async function getByToken(refreshToken) {
  return Token.findOne({ where: { refreshToken } });
}

async function remove(UserId) {
  return Token.destroy({ where: { UserId } });
}

module.exports = {
  TokenService: {
    save,
    getByToken,
    remove,
  },
};
