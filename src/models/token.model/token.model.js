const { Token } = require('./token.postgresql');

async function save(userId, newToken, newRefreshToken) {
  const token = await Token.findOne({ where: { userId } });

  if (!token) {
    await Token.create({
      userId,
      token: newToken,
      refreshToken: newRefreshToken,
    });

    return;
  }

  token.token = newToken;
  token.refreshToken = newRefreshToken;

  await token.save();
}

function getByToken(refreshToken) {
  return Token.findOne({ where: { refreshToken } });
}

module.exports = { save, getByToken };
