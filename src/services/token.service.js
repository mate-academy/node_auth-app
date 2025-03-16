const Token = require('../models/token.js');

async function save(userId, newToken) {
  const token = await Token.findOne({ where: { userId } });

  if (!token) {
    await Token.create({ userId, refreshToken: newToken });

    return;
  }

  token.refreshToken = newToken;

  await token.save();
}

function getByToken(token) {
  return Token.findOne({ where: { token } });
}

function remove(userId) {
  Token.destroy({ where: { userId } });
}

module.exports = {
  save,
  getByToken,
  remove,
};
