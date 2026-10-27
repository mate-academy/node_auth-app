const { Token } = require('../models/token.js');

async function save(userId, newToken) {
  let token = await Token.findOne({ where: { UserId: userId } });

  if (!token) {
    token = await Token.create({ UserId: userId, refreshToken: newToken });

    return;
  }

  token.refreshToken = newToken;
  await token.save();
}

function getByToken(refreshToken) {
  return Token.findOne({ where: { refreshToken } });
}

module.exports = {
  save,
  getByToken,
};
