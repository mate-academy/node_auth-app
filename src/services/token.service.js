const { Token } = require('../models/token');

async function save(userId, refreshToken) {
  const token = await Token.findOne({ where: { userId } });

  if (!token) {
    await Token.create({ userId, refreshToken });

    return;
  }

  token.refreshToken = refreshToken;

  await token.save();
}

function getByToken(refreshToken) {
  return Token.findOne({ where: { refreshToken } });
}

function remove(userId) {
  return Token.destroy({ where: { userId } });
}

const tokenService = {
  save,
  getByToken,
  remove,
};

module.exports = { tokenService };
