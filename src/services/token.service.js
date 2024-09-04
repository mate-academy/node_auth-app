const { Token } = require('../models/token');

async function save(UserId, newToken) {
  const token = await Token.findOne({ where: { UserId } });

  if (!token) {
    await Token.create({ UserId, refreshToken: newToken });

    return;
  }

  token.refreshToken = newToken;

  await token.save();
}

async function getByToken(refreshToken) {
  return Token.findOne({ where: { refreshToken } });
}

function remove(UserId) {
  return Token.destroy({ where: { UserId } });
}

const tokenService = {
  save,
  getByToken,
  remove,
};

module.exports = {
  tokenService,
};
